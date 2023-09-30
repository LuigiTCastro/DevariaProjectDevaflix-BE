import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchDto } from './dtos/search.dto';
import { Search, SearchDocument } from './schemas/search.schema';
import { TempSearch, TempSearchDocument } from './schemas/tempsearch.schema';
import { AxiosService } from './AxiosService';
import { TempSearchDto } from './dtos/tempsearch.dto';
import { MovieMessagesHelper } from './helpers/messages.helper';
import { Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { UserService } from 'src/user/user.service';


@Injectable()
export class SearchService {
    constructor(

        @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
        @InjectModel(TempSearch.name) private tempsearchModel: Model<TempSearchDocument>,
        private readonly userService: UserService, //ADC NO MODULE
        private readonly axios: AxiosService
    ) { }

    private logger = new Logger(SearchService.name);

    async searchOnMyDb(imdbID: string) {
        const search = await this.searchModel.find({ imdbID: imdbID });
        if (search.length > 0) {
            return search;
        }
        return null;
    }

    async getNamesUsingTmdb(title: TempSearchDto) {
        const movieNames = await this.axios.getMovieNamesOnTMDB(title);
        let movieList = [];
        for (const iten of movieNames) {
            const movie = { title: iten.title }
            movieList.push(movie);
        }
        return movieList;
    }

    async searchOnTmDb(title: TempSearchDto) {
        let idsOnTMDB = [];
        let tmdbDetails = [];
        const movieList = await this.axios.getMovieNamesOnTMDB(title);
        for (const movie of movieList) {
            idsOnTMDB.push(movie.id);
        }
        for (const id of idsOnTMDB) {
            const result = await this.axios.getMovieByIdsOnTMDB(id);
            if (result.status == "Released" && result.imdb_id !== null && result.imdb_id.length > 0) {
                const movieObj = {
                    title: result.title,
                    imdbID: result.imdb_id ? result.imdb_id : " ",
                    videos: result.video ? result.video : "N/A"
                }
                tmdbDetails.push(movieObj)
                await this.tempsearchModel.create(movieObj); // Criar regra para verificar se o titulo não já existe no db.
            }
        }
        return tmdbDetails;
    }

    async searchMovie(title: TempSearchDto) {
        try {
            this.logger.debug('Procurando filmes!')
            let movieList = [];
            const traducoes = await this.searchOnTmDb(title);
            this.logger.debug('filmes procurados no tmdb! hora de procurar no meu db!')
            for (const iten of traducoes) {
                let movieOnDB = await this.searchOnMyDb(iten.imdbID);
                if (movieOnDB !== null) {
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);
                    }
                } else {
                    await this.searchOnOmDb(iten)
                    movieOnDB = await this.searchOnMyDb(iten.imdbID);
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);
                    }
                }
            }
            this.logger.debug('Busca finalizada! Retornando resultados!')
            return movieList;
        } catch (error) {
            console.log(error);
        }
    }


    async searchOnOmDb(title: TempSearchDto) {
        let details = await this.axios.getDetailedMoviesOnOMDB(title.imdbID);
        const translatedInfo = await this.axios.getTranslatedPlotOnTmdb(title.imdbID);
        if (details.Response !== false) {
            const movie = {
                title: title.title,
                translatedTitle: translatedInfo.title,
                poster: details.Poster ? details.Poster : "N/A",
                imdbID: title.imdbID,
                year: details.Year ? details.Year : "N/A",
                genre: details.Genre ? details.Genre : "N/A",
                director: details.Director ? details.Director : "N/A",
                actor: details.Actors ? details.Actors : "N/A",
                imdbRating: details.imdbRating ? details.imdbRating : "N/A",
                likes: details.likes,
                totalLikes: details.totalLikes,
                plot: translatedInfo.overview ? translatedInfo.overview : details.Plot,
            } as SearchDto
            await this.tempsearchModel.deleteMany({ imdbID: movie.imdbID });  // Não entendi o pq do deleteMany.
            await this.searchModel.create(movie); // Criar regra para verificar se o filme não já existe no db.        
        }
        return;
    }

    // IMPROVE THE OPERATION
    // MAKE TO SEARCH IN THE APIS TOO
    // FIX THE IMDBRATING VALIDATION
    // MAKE TO SEARCH IN THE APIS TOO
    async findMoviesByFilter(filters: any) {
        try {
            this.logger.debug('Filtrando filmes')
            const query = {};
            const filterAttributes = ['year', 'genre', 'director', 'actor', 'imdbRating', 'plot']; // Inserir Type?
            
            for (const attr of filterAttributes) {
                if (filters[attr]) {
                    query[attr] = { $regex: filters[attr], $options: 'i' };
                }
            }

            const movies = await this.searchModel.find(query);
            if (!movies) {
                throw new BadRequestException(MovieMessagesHelper.MOVIE_NOT_FOUND);
            }

            this.logger.debug('Filtros Aplicados! Retornando resultados!')
            return movies;
        } 
        catch (error) {
            console.log(error);
        }
    }

    // EXCLUIR DA BUSCA FILMES ADULTOS
    // SEPARAR A BUSCA DE FILMES DA BUSCA DE SERIES?
    // BUSCAR POR FILMES DE MAIS QUALIDADE
    // BUSCAR NO BANCO, SE NÃO ENCONTRAR, BUSCAR NA OMDB E SALVAR NO BANCO
    async findRandomMovieFromOMDB() {
        try {
            this.logger.debug('Searching random movie.')

            const imdbIdList = []

            for (let i = 1; i <= 9999999; i++) {
                const paddedNumber = i.toString().padStart(7, '0'); // Formata o número para ter sempre 7 dígitos com zeros à esquerda
                const imdbId = `tt${paddedNumber}`;
                imdbIdList.push(imdbId);
            }

            let randomIndex = randomInt(0, imdbIdList.length)
            let randomMovie = await this.axios.getDetailedMoviesOnOMDB(imdbIdList[randomIndex])

            if (!randomMovie) {
                throw new BadRequestException(MovieMessagesHelper.NO_RESULTS_FOUND)
            }

            if (randomMovie.title === "N/A" || randomMovie.Title === "#DUPE#") {
                while (randomMovie.title === "N/A" || randomMovie.Title === "#DUPE#") {
                    randomIndex = randomInt(0, imdbIdList.length)
                    randomMovie = await this.axios.getDetailedMoviesOnOMDB(imdbIdList[randomIndex])
                }
            }

            console.log(imdbIdList[randomIndex])
            this.logger.debug('Random movie found.')
            const result = {
                id: randomMovie._id,
                type: randomMovie.Type,
                title: randomMovie.Title,
                translatedTitle: randomMovie.translatedTitle,
                poster: randomMovie.Poster,
                imdbID: randomMovie.imdbID,
                year: randomMovie.Year,
                genre: randomMovie.Genre,
                director: randomMovie.Director,
                actor: randomMovie.Actor,
                imdbRating: randomMovie.imdbRating,
                likes: randomMovie.likes,
                totalLikes: randomMovie.totalLikes,
                plot: randomMovie.Plot,
            } as SearchDto
            return result
        }

        catch (error) {
            this.logger.error(error)
        }
    }

    async findRandomMovieFromMyDb() {
        try {
            this.logger.debug('Searching random movie.')

            const moviesOnDb = await this.searchModel.find()
            const moviesList = []

            for (const movie of moviesOnDb) {
                moviesList.push(movie)
            }

            const randomIndex = randomInt(0, moviesList.length)
            const randomMovie = moviesList[randomIndex]

            if (!randomMovie) {
                throw new BadRequestException(MovieMessagesHelper.NO_RESULTS_FOUND)
            }

            this.logger.debug('Random movie found.')
            return randomMovie
        }

        catch (error) {
            this.logger.error(error)
        }
    }
    
    // async likeOrDislikeMovie(loggedUserId: string, movieId: string, dto: LikeMovieDto) {
    async likeOrDislikeMovie(loggedUserId: string, movieId: string) {
        try {
            this.logger.debug('Procurando filme.')

            const loggedUser = await this.userService.getUserById(loggedUserId)
            const movie = await this.searchModel.findById({_id: movieId})

            if(movie.likes.indexOf(loggedUser.id) == -1) {
                movie.likes.push(loggedUser.id)
                this.logger.debug('Filme curtido com sucesso.')
            }
            else {
                movie.likes.splice(movie.likes.indexOf(loggedUser.id), 1)
                this.logger.debug('Filme descurtido com sucesso.')
            }

            movie.totalLikes = movie.likes.length

            // movie.likes = dto.likes
            // movie.totalLikes = dto.totalLikes
            // const updatedMovie = await this.searchModel.findByIdAndUpdate({ _id: movieId }, movie)            
            
            const updatedMovie = await this.searchModel.findByIdAndUpdate(movie._id, {
                likes: movie.likes, totalLikes: movie.totalLikes
            })
            return updatedMovie
        }

        catch(error) {
            console.log(error)
            this.logger.error(error)
        }
    }
}
