import {Injectable, BadRequestException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchDto } from './dtos/search.dto';
import { Search, SearchDocument } from './schemas/search.schema';
import { TempSearch, TempSearchDocument } from './schemas/tempsearch.schema';
import {AxiosService} from './AxiosService';
import { TempSearchDto } from './dtos/tempsearch.dto';
import { MovieMessagesHelper } from './helpers/messages.helper';


let spaceSwap = / /gi;

@Injectable()
export class SearchService {
    constructor(
        
        @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
        @InjectModel(TempSearch.name) private tempsearchModel: Model<TempSearchDocument>,
        private readonly axios:AxiosService
        ) {}

    async searchOnMyDb(imdbID:string){
        console.log("searchOnMyDb pode ficar ");
        const search = await this.searchModel.find({imdbID:{$regex:imdbID}});
        if (search.length > 0){
            return search;
        }
        return null;
    }

    async getNamesUsingTmdb(title:TempSearchDto){
        console.log("getNamesUsingTmdb pode ficar ");
        const movieNames = await this.axios.getMovieNamesOnTMDB(title);
        let movieList = [];
        for (const iten of movieNames) {
            const movie = {title:iten.title}
            movieList.push(movie);
        }
        return movieList;
    }
    
    async searchOnTmDb(title: TempSearchDto){
        console.log("searchOnTmDb pode ficar ");
        let idsOnTMDB = [];
        let tmdbDetails = [];
        const movieList = await this.axios.getMovieNamesOnTMDB(title);
        console.log("MovieList Retornou!")
        for (const movie of movieList) {
            console.log(`O Filme "${movie.title}" com o id no tmdb "${movie.id}" retornou`)
            idsOnTMDB.push(movie.id);
        }
        console.log(idsOnTMDB)
        for (const id of idsOnTMDB) {
            const result = await this.axios.getMovieByIdsOnTMDB(id);
            
            console.log(result);
            // console.log(result.imdb_id.length);
            // console.log(result.status);
            if (result.status == "Released" && result.imdb_id !== null && result.imdb_id.length > 0){
                console.log(`id ${id} tem o IMDB ID ${result.imdb_id}`);
                const movieObj ={
                    title: result.title,
                    imdbID:result.imdb_id? result.imdb_id: " ",
                    videos:result.video? result.video:"N/A"
                }
                console.log(result.imdb_id);
                tmdbDetails.push(movieObj)
                await this.tempsearchModel.create(movieObj);
            }
        }
        console.log("Lista dos Ids para busca",idsOnTMDB);
        return tmdbDetails;
    }

    async searchMovie(title:TempSearchDto){
        try{
            let movieList = [];
            const traducoes = await this.searchOnTmDb(title);
            console.log("finalizou a busca inicial pelos ids");
            for (const iten of traducoes) {
                let movieOnDB = await this.searchOnMyDb(iten.imdbID);
                if (movieOnDB !== null){
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);                        
                    }
                }else{
                    console.log("entrou no else do movieOnDB =? null")
                    await this.searchOnOmDb(iten)
                    movieOnDB = await this.searchOnMyDb(iten.imdbID);
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);                        
                    }
                }
            }
            console.log("busca finalizada e MovieList completa");
            return movieList;
        }catch (error){
            console.log(error);
        }
    }


    async searchOnOmDb(title: TempSearchDto){
        console.log("searchOnOmDb pode ficar ");
        let details = await this.axios.getDetailedMoviesOnOMDB(title.imdbID);
            const movie = {
                title: details.Title,                                   // Traduzir?
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
            const query = {};
            const filterAttributes = ['year','genre', 'director', 'actor', 'imdbRating', 'plot'];
            for(const attr of filterAttributes){
                if (filters[attr]){
                    console.log(filters[attr]);
                    query[attr] = {$regex:filters[attr], $options: 'i'};
                    console.log(query[attr]);
                }
            }
            const movies = await this.searchModel.find(query);
            if (!movies){
                throw new BadRequestException(MovieMessagesHelper.MOVIE_NOT_FOUND);
            }
            return movies;
        }catch(error){
            console.log(error);
        }
    }
}