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

    

    async create(dto: TempSearchDto): Promise<SearchDocument> {
        const createdTitle = new this.tempsearchModel(dto);
        console.log("createdTitle.save();")
        createdTitle.save();
        return
    }

    async searchOnMyDb(movieName:TempSearchDto){
        // console.log(`Buscar ${movieName.title} no meu banco de dados`);
        // essa regex serve para o banco de dados retornar tudo que tenha esse nome ou parte dele
        //                                                  V
        const search = await this.searchModel.findOne({title:{$regex:movieName.title}});
        console.log("Search findOne No searchModel  = >",search?.title);

        // if (search.length > 0){
            return search;
        // }
        // return null;
    }

    async getNamesUsingTmdb(title:TempSearchDto){
        // console.log('titulo que chega no getNameUsingTmdb', title);
        // title.title = title.title.replace(spaceSwap, '+');
        // console.log("Nome do filme alterado para ",title);
        const movieList = await this.axios.getMoviesOnTMDB(title);
        // console.log("movielist do getName pelo tmdb",movieList);
        let movieNames = [];
        for (const iten of movieList) {
            // console.log("busca do tmdb pelo nome traduzido",iten.title);;
            const movie = {title:iten.title}
            movieNames.push(movie);
        }
        // console.log(movieNames);
        return movieNames;
        // return movieList;
        // return title; OK!
    }

    async serchMovie(title:TempSearchDto){
        //usar o tmdb pra tradução do nome
        let movieList = [];
        // console.log(title);
        const traducoes = await this.getNamesUsingTmdb(title);
        console.log("traduções ===>", traducoes);
        for (const iten of traducoes) {
            console.log("item dentro das traduções",iten);
        //     const movieOnDB = await this.searchOnMyDb(iten);
        //     if (movieOnDB){
        //         console.log("ACHEI NO MEU DB! Vamos adicionar a lista resultado!")
        //         movieList.push(movieOnDB)
        //     }else{
        //         console.log("NÃO ACHEI NO MEU DB! Vamos Buscar de fora!")
        //         // buscar no tmdb e adicionar na tempSearch         ****
        //         let result = await this.searchOnTmDb(iten);
        //         console.log("result dentro do Else  ", result);
        //         // buscar da tempSearch no OMDB e adição na Search  ****
        //         for (const movie of result) {
        //             console.log("Movie do for  ",movie);
        //             await this.searchOnOmDb(movie)
        //         }
        // //         console.log("busca de novo no meu DB", iten);
        // //         movieOnDB = await this.searchOnMyDb(iten);
        // //         console.log("movieOnDB segunda vez => ",movieOnDB);
        //     }
        }
        // return movieOnDB;
        // console.log("movielist pra retornar pro controller",movieList);
        return movieList;
    }

    async searchOnTmDb(title: TempSearchDto){
        // console.log("entrou na searchTmDb", title);
        const movieList = await this.axios.getMoviesOnTMDB(title);
        for (const movie of movieList) {
            // console.log(movie);
            await this.tempsearchModel.create(movie);
        }
        return movieList;
    }

    async searchOnOmDb(title: TempSearchDto){
        // title.title = title.title.replace(spaceSwap, '+');
        // console.log("movieName dentro do searchOnOmDb", title)
        const movieList = await this.axios.getPreviewMoviesOnOMDB(title);
        // console.log("movieList do omdb =>> ",movieList);

        let idsList =[];
        for (const item of movieList) {
            // if (item.title != "Not Found"){
                // let imdbId = item.imdbID;
                // idsList.push(imdbId);
                idsList.push(item.imdbID);
            // }
        }
        console.log("Lista dos TTIds do IMDB",idsList);

        let contador = 1;
        for (const ttId of idsList) {
            let details = await this.axios.getDetailedMoviesOnOMDB(ttId);
            // if (details.Title){
            const movie = {
                    title: details.Title,
                    poster: details.Poster,
                    imdbID: details.imdbID,
                    year: details.Year,
                    genre: details.Genre,
                    director: details.Director,
                    actor: details.Actors,
                    imdbRating: details.imdbRating                
                } as SearchDto
                // console.log(`movie ${contador}  ==> `,movie);
                contador ++;
                await this.tempsearchModel.deleteMany({title:{$regex:movie.title, $options:"i"}});
                await this.searchModel.create(movie);                
            // }
            
        }
        return "ok";
    }
}
