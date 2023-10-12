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
import { Rating, RatingDocument } from './schemas/rating.schema';


@Injectable()
export class SearchService {
    constructor(

        @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
        @InjectModel(TempSearch.name) private tempsearchModel: Model<TempSearchDocument>,
        @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
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
        const movieNames = await this.axios.getNamesListOnTMDB(title);
        let movieList = [];
        for (const iten of movieNames) {
            const movie = { title: iten.title }
            movieList.push(movie);
        }
        return movieList;
    }

    newObjectModel(objeto1, imdbId, id) {
        const restult = {
            name: objeto1.name,
            title: objeto1.name,
            type: 'tv',
            status: objeto1.status,
            imdb_id: imdbId,
            id: id,
            videos: "N]A"
        };

        return restult;

    }
    async searchOnTmDb(title: TempSearchDto) {
        let idsOnTMDB = [];
        let tmdbDetails = [];
        const titleList = await this.axios.getNamesListOnTMDB(title);
        for (const title of titleList) {
            const mediaType = {
                id: title.id.toString(),
                type: title.media_type,
                name: title.name ? title.name : title.title
            }
            idsOnTMDB.push(mediaType);
        }
        for (const id of idsOnTMDB) {
            if (id.type !== 'person') {
                let result;
                let trailers = [];
                if (id.type == "movie") {
                    result = await this.axios.getMovieByIdsOnTMDB(id.id);
                    const searchTrailers = await this.axios.getMovieTrailer(id.id);
                    for (const trailer of searchTrailers) {
                        if (trailer.site === "YouTube") {
                            trailers.push(`https://www.youtube.com/watch?v=${trailer.key} `);
                        } else {
                            trailers.push(`Site:${trailer.site}, Key:${trailer.key} `);
                        }
                    }
                }
                if (id.type == "tv") {
                    result = await this.axios.getSeriesByIdsOnTMDB(id.id);
                    const searchTrailers = await this.axios.getSeriesTrailer(id.id);
                    for (const trailer of searchTrailers) {
                        if (trailer.site === "YouTube") {
                            trailers.push(`https://www.youtube.com/watch?v=${trailer.key} `);
                        } else {
                            trailers.push(`Site:${trailer.site}, Key:${trailer.key} `);
                        }
                    }
                }

                if (!result.imdb_id) {
                    const ttId = await this.axios.getTtIdSeriesfromOmdb(id.name);
                    if (ttId.Response !== 'False') {
                        const imdb_id = ttId.Search[0].imdbID;
                        const tmdbId = id.id;
                        result = this.newObjectModel(result, imdb_id, tmdbId)
                    }
                }
                if (result?.status !== "Planned" && result.imdb_id !== null && result.imdb_id?.length > 0) {
                    const movieObj = {
                        title: result.title ? result.title : id.name,
                        type: id.type,
                        imdbID: result.imdb_id ? result.imdb_id : id.imdbID,
                        tmdbId: id.id,
                        videos: trailers.toString() ? trailers.toString() : "N/A"
                    }
                    tmdbDetails.push(movieObj)
                    await this.tempsearchModel.create(movieObj); // Criar regra para demonstrar que esses objetos não contem informações minimas para retornar um objeto valido.
                }
            }
        }
        return tmdbDetails;
    }

    async searchMovie(title: TempSearchDto) {
        try {
            this.logger.debug(`Procurando filmes relacionados a ${title.title} .`)
            let movieList = [];
            const traducoes = await this.searchOnTmDb(title);
            this.logger.debug(`${traducoes.length} filmes encontrados no tmdb! hora de procurar no meu db!`)
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
            this.logger.debug(`Busca finalizada! Retornando ${movieList?.length} resultados!`)
            return movieList;
        } catch (error) {
            console.log(error);
        }
    }


    async searchOnOmDb(title: TempSearchDto) {
        let translatedInfo;
        let details = await this.axios.getDetailedMoviesOnOMDB(title.imdbID);
        translatedInfo = await this.axios.getTranslatedPlotOnTmdb(title);
        if (details.Response !== false) {
            const movie = {
                title: title.title,
                translatedTitle: translatedInfo.title ? translatedInfo.title : translatedInfo.name,
                poster: details.Poster ? details.Poster : "N/A",
                imdbID: title.imdbID,
                year: details.Year ? details.Year : "N/A",
                genre: details.Genre ? details.Genre : "N/A",
                director: details.Director ? details.Director : "N/A",
                actor: details.Actors ? details.Actors : "N/A",
                imdbRating: details.imdbRating ? details.imdbRating : "N/A",
                plot: translatedInfo.overview ? translatedInfo.overview : details.Plot,
                videos: title.videos
            } as SearchDto
            await this.tempsearchModel.deleteMany({ imdbID: movie.imdbID });
            await this.searchModel.create(movie);
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
            const filterAttributes = ['year', 'genre', 'director', 'actor', 'imdbRating', 'plot']; // Inserir Type? Other attributes? (runtime)

            for (const attr of filterAttributes) {
                if (filters[attr]) {
                    query[attr] = { $regex: filters[attr], $options: 'i' };
                }
            }
            const movies = await this.searchModel.find(query);
            
            if (!movies) {
                throw new BadRequestException(MovieMessagesHelper.MOVIE_NOT_FOUND);
            }
            this.logger.debug(`Filtros Aplicados! Retornando ${movies?.length} resultados!`)
            return movies;
        }
        catch (error) {
            console.log(error);
        }
    }

    async findRandomMovieFromOMDB() {
        try {
            this.logger.debug('Searching random movie.')

            const imdbIdList = []
            for (let i = 1; i <= 9999999; i++) {
                const paddedNumber = i.toString().padStart(7, '0'); // Formata o número para ter sempre 7 dígitos com zeros à esquerda
                const imdbId = `tt${paddedNumber}`;
                imdbIdList.push(imdbId);
            }
            let randomImdbId
            let randomMovie
            let movie

            while(movie === undefined) {
                console.log(movie)
                randomImdbId = randomInt(0, imdbIdList.length);
                randomMovie = await this.axios.getDetailedMoviesOnOMDB(imdbIdList[randomImdbId]);
                
                while (!randomMovie || randomMovie.title === "N/A" || randomMovie.title === "#DUPE#" || randomMovie.imdbRating === "N/A") {
                    randomImdbId = randomInt(0, imdbIdList.length)
                    randomMovie = await this.axios.getDetailedMoviesOnOMDB(imdbIdList[randomImdbId])
                }
                let movieObj: TempSearchDto = {
                    title: randomMovie.Title,
                    type: randomMovie.Type,
                    imdbID: randomMovie.imdbID,
                    tmdbId: 'N/A',
                    videos: 'N/A',
                }
                const moviesList = await this.searchMovie(movieObj)
                movie = moviesList.find((movie) => movie.imdbID === randomMovie.imdbID)
                console.log(movie)
            }
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
                actor: randomMovie.Actors,
                imdbRating: randomMovie.imdbRating,
                runtime: randomMovie.Runtime,
                language: randomMovie.Language,
                plot: randomMovie.Plot,
                videos: movie.videos,
            } as SearchDto
            return result
        }
        catch (error) {
            this.logger.error(error)
        }
    }

    // ADC O ATRIBUTO RUNTIME?
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

    async registerLikeMovie(loggedUserId: string, movieId: string) {
        try {
            this.logger.debug('Procurando filme.')
            const movie = await this.searchModel.findById({ _id: movieId });
            let obj = await this.ratingModel.findOne({ imdbID: movie.imdbID });

            if (!obj) {
                obj = new this.ratingModel({
                    imdbID: movie.imdbID,
                    title: movie.title,
                    likes: [],
                    totalLikes: 0,
                    dislikes: [],
                    totalDislikes: 0,
                    percentagelLikes: 0,
                });
                await obj.save();
            }
            if (obj.dislikes.indexOf(loggedUserId) != -1) {
                obj.dislikes.splice(obj.dislikes.indexOf(loggedUserId), 1)
            }
            if (obj.likes.indexOf(loggedUserId) == -1) {
                obj.likes.push(loggedUserId)
                this.logger.debug('Like registrado com sucesso.')
            }
            else {
                obj.likes.splice(obj.likes.indexOf(loggedUserId), 1)
                this.logger.debug('Like removido com sucesso.')
            }

            obj.totalLikes = obj.likes.length
            obj.totalDislikes = obj.dislikes.length

            await this.ratingModel.findByIdAndUpdate(obj._id, {
                likes: obj.likes, totalLikes: obj.totalLikes,
                dislikes: obj.dislikes, totalDislikes: obj.totalDislikes
            })
            obj.percentageLikes = await this.registerPercentageLikes(movieId)
            return obj
        }

        catch (error) {
            console.log(error)
            this.logger.error(error)
        }
    }

    async registerDislikeMovie(loggedUserId: string, movieId: string) {
        try {
            this.logger.debug('Procurando filme.')
            const movie = await this.searchModel.findById({ _id: movieId });
            let obj = await this.ratingModel.findOne({ imdbID: movie.imdbID });

            if (!obj) {
                obj = new this.ratingModel({
                    imdbID: movie.imdbID,
                    title: movie.title,
                    likes: [],
                    totalLikes: 0,
                    dislikes: [],
                    totalDislikes: 0,
                    percentageLikes: 0,
                });
                await obj.save();
            }

            if (obj.likes.indexOf(loggedUserId) != -1) {
                obj.likes.splice(obj.likes.indexOf(loggedUserId), 1)
            }

            if (obj.dislikes.indexOf(loggedUserId) == -1) {
                obj.dislikes.push(loggedUserId)
                this.logger.debug('Dislike registrado com sucesso.')
            }
            else {
                obj.dislikes.splice(obj.dislikes.indexOf(loggedUserId), 1)
                this.logger.debug('Dislike removido com sucesso.')
            }

            obj.totalDislikes = obj.dislikes.length
            obj.totalLikes = obj.likes.length

            await this.ratingModel.findByIdAndUpdate(obj._id, {
                dislikes: obj.dislikes, totalDislikes: obj.totalDislikes,
                likes: obj.likes, totalLikes: obj.totalLikes
            })
            obj.percentageLikes = await this.registerPercentageLikes(movieId)
            return obj
        }

        catch (error) {
            console.log(error)
            this.logger.error(error)
        }
    }

    async registerPercentageLikes(movieId: string) {
        const movie = await this.searchModel.findById({ _id: movieId });
        let obj = await this.ratingModel.findOne({ imdbID: movie.imdbID });
        obj.percentageLikes = (obj.totalLikes / (obj.totalLikes + obj.totalDislikes))

        if (obj.totalLikes == 0)
            obj.percentageLikes = 0

        await this.ratingModel.findByIdAndUpdate(obj._id, {
            percentageLikes: obj.percentageLikes
        })
        return obj.percentageLikes
    }
}
