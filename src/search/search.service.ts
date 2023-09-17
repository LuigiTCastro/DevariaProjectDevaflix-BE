import {BadRequestException, Injectable} from '@nestjs/common';
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
        // console.log("até aqui fopi");
        const search = await this.searchModel.find({title:{$regex:movieName.title}});
        // console.log("aqui foi?", search);
        if (search.length > 0){
            console.log("Encontrado no banco de dados!", movieName)
            console.log(search)
            return search;
        }
        console.log("Não encontrado no banco de dados!", movieName)
        return null;
    }

    async getNamesUsingTmdb(title:TempSearchDto){
        const movieNames = await this.axios.getMoviesOnTMDB(title);
        let movieList = [];
        for (const iten of movieNames) {
            const movie = {title:iten.title}
            movieList.push(movie);
        }
        return movieList;
    }

    // this.activeSockets = this.activeSockets.filter(
    //     socket => socket.id !== client.id
    //   );

    // CORRIGIR NOME DA FUNÇÃO
    async serchMovie(title:TempSearchDto){
        try{
            let movieList = [];
            const traducoes = await this.getNamesUsingTmdb(title);
            // console.log("traduções",traducoes);
            for (const iten of traducoes) {
                let movieOnDB = await this.searchOnMyDb(iten);
                // console.log(movieOnDB);
                if (movieOnDB !== null){
                    // console.log("ACHEI NO MEU DB! Vamos adicionar a lista resultado!", movieOnDB)
                    for (const movieObject of movieOnDB) {
                        movieList.push(movieObject);                        
                    }
                }else{
                    let result = await this.searchOnTmDb(iten);
                    // console.log("Result retorna",result)
                    for (const movie of result) {
                        // console.log(movie)
                        await this.searchOnOmDb(movie)
                        movieOnDB = await this.searchOnMyDb(iten);
                        // console.log("vamos ver como o movieondb volta ",movieOnDB)
                        // if (movieOnDB.title !== "N/A"){
                            for (const movieObject of movieOnDB) {
                                movieList.push(movieObject);                        
                            }
                        // }
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
            // console.log(movie);
            await this.tempsearchModel.create({title: movie.title});
        }
        return movieList;
    }

    async searchOnOmDb(title: TempSearchDto){
        const movieObj = await this.axios.getPreviewMoviesOnOMDB(title);
        // console.log("movie list",movieObj);
        let idsList =[];
        for (const iten of movieObj) {
            if (iten.Title !== "N/A"){
                // console.log("imdbID ==",iten.imdbID)
                        idsList.push(iten.imdbID);
                }
            console.log("Lista dos TTIds do IMDB",idsList);
            let contador = 1; // contador para visualização!
        }
        for (const ttId of idsList) {
            // console.log("titulo",ttId)
            let details = await this.axios.getDetailedMoviesOnOMDB(ttId);
            console.log(details.Title)
            if (details.Title !== undefined){
                // console.log("esta entrando aqui?")
                const movie = {
                    title: details.Title,                                   // Traduzir?
                    poster: details.Poster? details.Poster: "N/A",
                    imdbID: details.imdbID? details.imdbID: "N/A",
                    year: details.Year? details.Year: "N/A",
                    genre: details.Genre? details.Genre: "N/A",
                    director: details.Director? details.Director: "N/A",
                    actor: details.Actors? details.Actors: "N/A",
                    imdbRating: details.imdbRating? details.imdbRating: "N/A",
                } as SearchDto
                console.log(movie) ;
                await this.tempsearchModel.deleteMany({title:{$regex:movie.title}});
                await this.searchModel.create(movie);                
            }
        }
    }

    async findMoviesByYear(movieYear: string) {
        const movies = await this.searchModel.find({year: {$regex: movieYear}})
        console.log(movieYear)

        if(!movies) {
            throw new BadRequestException("Nenhum filme foi encontrado.")
        }

        return movies
    }
}
