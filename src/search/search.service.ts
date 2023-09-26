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


let spaceSwap = / /gi;

@Injectable()
export class SearchService {
    constructor(
        
        @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
        @InjectModel(TempSearch.name) private tempsearchModel: Model<TempSearchDocument>,
        private readonly axios:AxiosService
        ) {}

        private logger = new Logger(SearchService.name);

    async searchOnMyDb(imdbID:string){
        const search = await this.searchModel.find({imdbID:{$regex:imdbID}});
        if (search.length > 0){
            return search;
        }
        return null;
    }

    async getNamesUsingTmdb(title:TempSearchDto){
        const movieNames = await this.axios.getMovieNamesOnTMDB(title);
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
        const movieList = await this.axios.getMovieNamesOnTMDB(title);
        for (const movie of movieList) {
            idsOnTMDB.push(movie.id);
        }
        for (const id of idsOnTMDB) {
            const result = await this.axios.getMovieByIdsOnTMDB(id);
            if (result.status == "Released" && result.imdb_id !== null && result.imdb_id.length > 0){
                const movieObj ={
                    title: result.title,
                    imdbID:result.imdb_id? result.imdb_id: " ",
                    videos:result.video? result.video:"N/A"
                }
                tmdbDetails.push(movieObj)
                await this.tempsearchModel.create(movieObj);
            }
        }
        return tmdbDetails;
    }

    async searchMovie(title:TempSearchDto){
        try{
            this.logger.debug('Procurando filmes!')
            let movieList = [];
            const traducoes = await this.searchOnTmDb(title);
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
            const movie = {
                title: details.Title,
                poster: details.Poster? details.Poster: "N/A",
                imdbID: title.imdbID? title.imdbID: "N/A",
                year: details.Year? details.Year: "N/A",
                genre: details.Genre? details.Genre: "N/A",
                director: details.Director? details.Director: "N/A",
                actor: details.Actors? details.Actors: "N/A",
                imdbRating: details.imdbRating? details.imdbRating: "N/A",
                plot: details.Plot? details.Plot: "N/A",
            } as SearchDto
            await this.tempsearchModel.deleteMany({title:{$regex:movie.title}});
            await this.searchModel.create(movie);                
        // }
        
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
}
