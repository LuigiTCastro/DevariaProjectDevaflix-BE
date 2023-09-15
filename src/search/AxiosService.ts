import axios from "axios";
import { TempSearchDto } from './dtos/tempsearch.dto';

export class AxiosService{

    async getMoviesOnTMDB(title:TempSearchDto){
        title.title = title.title.slice(0,25)
        console.log(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        const data = await axios.get(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        // console.log('captou o Data usando axios pelo TMDB', data.data.results);
        // console.log('result do tmdb', data.data);
        return data.data.results;
    }

    async getPreviewMoviesOnOMDB(title:TempSearchDto){  
        console.log(process.env.OMDB_PUBLIC_URL+ `&s=${title.title}`);
        const data = await axios.get(process.env.OMDB_PUBLIC_URL+ `&s=${title.title}`);
        // console.log(" console.log(data.data) ->",data.data)
        if (data.data.Search){
            return data.data.Search;
        }else{
            return {title:"N/A"};
        }
    }

    async getDetailedMoviesOnOMDB(imdbId:string){
        console.log(process.env.OMDB_PUBLIC_URL+ `&i=${imdbId}`);
        const data = await axios.get(process.env.OMDB_PUBLIC_URL+ `&i=${imdbId}`);
        // console.log("Data => ", data.data);
        return data.data;
    }
}
