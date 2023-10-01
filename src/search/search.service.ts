import {Injectable, BadRequestException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchDto } from './dtos/search.dto';
import { Search, SearchDocument } from './schemas/search.schema';
import { TempSearch, TempSearchDocument } from './schemas/tempsearch.schema';
import {AxiosService} from './AxiosService';
import { TempSearchDto } from './dtos/tempsearch.dto';
import { MovieMessagesHelper } from './helpers/messages.helper';
import { Logger } from '@nestjs/common';
import { randomInt } from 'crypto';


@Injectable()
export class SearchService {
    constructor(
        
        @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
        @InjectModel(TempSearch.name) private tempsearchModel: Model<TempSearchDocument>,
        private readonly axios:AxiosService
        ) {}

        private logger = new Logger(SearchService.name);

    async searchOnMyDb(imdbID:string){
        const search = await this.searchModel.find({imdbID:imdbID});
        if (search.length > 0){
            return search;
        }
        return null;
    }

    async getNamesUsingTmdb(title: TempSearchDto) {
        const movieNames = await this.axios.getNamesListOnTMDB(title);
        let movieList = [];
        for (const iten of movieNames) {
            const movie = {title:iten.title}
            movieList.push(movie);
        }
        return movieList;
    }
    
    async searchOnTmDb(title: TempSearchDto){
        let idsOnTMDB = [];
        let tmdbDetails = [];
        const titleList = await this.axios.getNamesListOnTMDB(title);
        for (const title of titleList) {
            console.log("1 ---- Media_Type",title.media_type)
            console.log("2 ---- ID ",title.id)
            if(title.media_type == "tv"){
                console.log("3 ---- NAME ",title.name)
            }else{
                console.log("3 ---- NAME ",title.title)
            }
            console.log("---------------------------------------------------------")
            console.log(" ")
            const mediaType= {
                id: title.id,
                type:title.media_type,
                name:title.name?title.name :title.title
            }
            idsOnTMDB.push(mediaType);
        }
        // console.log(idsOnTMDB);
        for (const id of idsOnTMDB) {
            let result;
            let trailers = [];
            if (id.type == "movie"){
                result = await this.axios.getMovieByIdsOnTMDB(id.id);
                const searchTrailers = await this.axios.getMovieTrailer(id.id);
                    for (const trailer of searchTrailers) {
                        if (trailer.site === "YouTube"){
                            trailers.push(`https://www.youtube.com/watch?v=${trailer.key} `);
                        }else{
                            trailers.push(`Site:${trailer.site}, Key:${trailer.key} `);
                        }
                    }
            }
            if (id.type == "tv"){
                result = await this.axios.getSeriesByIdsOnTMDB(id.id);
                const searchTrailers = await this.axios.getSeriesTrailer(id.id);
                    for (const trailer of searchTrailers) {
                        if (trailer.site === "YouTube"){
                            trailers.push(`https://www.youtube.com/watch?v=${trailer.key} `);
                        }else{
                            trailers.push(`Site:${trailer.site}, Key:${trailer.key} `);
                        }
                    }
            }
            if (!result.imdb_id){
                console.log("NÃO TEM TtId",result.imdb_id)
                const ttId = await this.axios.getTtIdSeriesfromOmdb(id.name);
                console.log("Response ",ttId.Response)
                if (ttId.Response !== 'False') {
                    console.log(result)
                    const imdb_id = {imdb_id:ttId.Search[0].imdbID}
                    console.log(imdb_id)
                    result = result + imdb_id
                    console.log(result)
                    console.log("BUsca na OMDB pelo titulo para apresentação do TT ID", ttId.Search[0].imdbID)
                    console.log("AGORA TEM TtId!",result.imdb_id)
                }
                console.log("____________________________________________________________________", )
            }

            if (result?.status !== "Planned" && result.imdb_id !== null && result.imdb_id?.length > 0) {
                    console.log(`type = ${id.type},     id = ${id.id},      status = ${result.status}`)
                    const movieObj = {
                        title: result.title,
                        type: id.type,
                        imdbID: result.imdb_id,
                        videos: trailers.toString() ? trailers.toString() : "N/A"
                    }
                    tmdbDetails.push(movieObj)
                    await this.tempsearchModel.create(movieObj); // Criar regra para verificar se o titulo não já existe no db.
                }
            //}
        }
        return tmdbDetails;
    }

    async searchMovie(title:TempSearchDto){
        try{
            this.logger.debug('Procurando filmes!')
            let contador = 1;
            let movieList = [];
            const traducoes = await this.searchOnTmDb(title);
            console.log("Traduções  --- > ",traducoes);
            this.logger.debug('filmes procurados no tmdb! hora de procurar no meu db!')
            for (const iten of traducoes) {
                let movieOnDB = await this.searchOnMyDb(iten.imdbID);
                if (movieOnDB !== null){
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);
                    }
                }else{
                    await this.searchOnOmDb(iten)
                    movieOnDB = await this.searchOnMyDb(iten.imdbID);
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);                        
                    }
                }
            }
            this.logger.debug('Busca finalizada! Retornando resultados!')
            return movieList;
        }catch (error){
            console.log(error);
        }
    }


    async searchOnOmDb(title: TempSearchDto){
        let details = await this.axios.getDetailedMoviesOnOMDB(title.imdbID);
        const translatedInfo = await this.axios.getTranslatedPlotOnTmdb(title.imdbID);
        if(details.Response !== false){
            const movie = {
                title: title.title,
                translatedTitle: translatedInfo.title,
                poster: details.Poster? details.Poster : "N/A",
                imdbID: title.imdbID,
                year: details.Year? details.Year : "N/A",
                genre: details.Genre? details.Genre : "N/A",
                director: details.Director? details.Director : "N/A",
                actor: details.Actors? details.Actors : "N/A",
                imdbRating: details.imdbRating? details.imdbRating : "N/A",
                plot: translatedInfo.overview ? translatedInfo.overview : details.Plot,
                videos:title.videos
            } as SearchDto
            await this.tempsearchModel.deleteMany({imdbID:movie.imdbID});
            await this.searchModel.create(movie);                
        }
        return;
    }

    async findMoviesbyfilter(filters:any) {
        try{
            this.logger.debug('Filtrando filmes')
            const query = {};
            const filterAttributes = ['year','genre', 'director', 'actor', 'imdbRating', 'plot'];
            for(const attr of filterAttributes){
                if (filters[attr]){
                    query[attr] = {$regex:filters[attr], $options: 'i'};
                }
            }
            const movies = await this.searchModel.find(query);
            if (!movies){
                throw new BadRequestException(MovieMessagesHelper.MOVIE_NOT_FOUND);
            }
            this.logger.debug('Filtros Aplicados! Retornando resultados!')
            return movies;
        }catch(error){
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
                while (randomMovie.title === "N/A" || randomMovie.Title === "#DUPE#"){
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
                plot: randomMovie.Plot,
                videos: "N/A"
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
}
