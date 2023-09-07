import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchDto } from './dtos/search.dto';
import { Search, SearchDocument } from './schemas/search.schema';
import { TempSearch, TempSearchDocument } from './schemas/tempsearch.schema';
import {AxiosService} from './AxiosService';
import { TempSearchDto } from './dtos/tempsearch.dto';


let spaceSwap = / /gi;

@Injectable()
export class SearchService {
    constructor(
        
        @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
        @InjectModel(TempSearch.name) private tempsearchModel: Model<TempSearchDocument>,
        private readonly axios:AxiosService
        ) {}

        async searchOnMyDb(movieName:TempSearchDto){
        const search = await this.searchModel.find({title:{$regex:movieName.title}});
        if (search.length > 0){
            return search;
        }
        return null;
    }

    async getNamesUsingTmdb(title:TempSearchDto){
        const movieNames = await this.axios.getMoviesOnTMDB(title);
        let movieList = [];
        for (const iten of movieNames) {
            const movie = {title:iten.title}
            movieList.push(movie);
        }
        console.log(movieNames);
        return movieList;
    }

    // this.activeSockets = this.activeSockets.filter(
    //     socket => socket.id !== client.id
    //   );

    async serchMovie(title:TempSearchDto){
        try{
            let movieList = [];
            const traducoes = await this.getNamesUsingTmdb(title);
            for (const iten of traducoes) {
                let movieOnDB = await this.searchOnMyDb(iten);
                console.log(movieOnDB);
                if (movieOnDB !== null){
                    console.log("ACHEI NO MEU DB! Vamos adicionar a lista resultado!", movieOnDB)
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);                        
                    }
                }else{
                    let result = await this.searchOnTmDb(iten);
                    for (const movie of result) {
                        await this.searchOnOmDb(movie)
                        movieOnDB = await this.searchOnMyDb(iten);
                        for (const movieObject of movieOnDB) {
                            movieList.push(movieObject);                        
                        }
                    }
                }
            }
            return movieList;
        }catch (error){
            console.log(error);
        }
    }

    async searchOnTmDb(title: TempSearchDto){
        const movieList = await this.axios.getMoviesOnTMDB(title);
        for (const movie of movieList) {
            console.log(movie);

            await this.tempsearchModel.create({title: movie.title});
        }
        return movieList;
    }

    async searchOnOmDb(title: TempSearchDto){
        const movieList = await this.axios.getPreviewMoviesOnOMDB(title);
        let idsList =[];
        for (const iten of movieList) {
            // if (item.title != "Not Found"){
                // let imdbId = item.imdbID;
                // idsList.push(imdbId);
                idsList.push(iten.imdbID);
            // }
        }
        console.log("Lista dos TTIds do IMDB",idsList);
        let contador = 1; // contador para visualização!
        for (const ttId of idsList) {
            let details = await this.axios.getDetailedMoviesOnOMDB(ttId);
            // if (details.Title){
            const movie = {
                    title: details.Title,
                    poster: details.Poster? details.Poster: "Não disponivel",
                    imdbID: details.imdbID? details.imdbID: "Não disponivel",
                    year: details.Year? details.Year: "Não disponivel",
                    genre: details.Genre? details.Genre: "Não disponivel",
                    director: details.Director? details.Director: "Não disponivel",
                    actor: details.Actors? details.Actors: "Não disponivel",
                    imdbRating: details.imdbRating? details.imdbRating: "Não disponivel",
                } as SearchDto
                console.log(`movie ${contador}  ==> `, movie); //Para visualização!
                contador ++; // contador para visualização
                await this.tempsearchModel.deleteMany({title:{$regex:movie.title, $options:"i"}});
                await this.searchModel.create(movie);                
            // }       
        }
        return "ok";
    }
}
