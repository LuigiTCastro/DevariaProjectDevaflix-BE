import axios from "axios";
import { TempSearchDto } from './dtos/tempsearch.dto';

export class AxiosService{

    async getMovieNamesOnTMDB(title:TempSearchDto){
        title.title = title.title.slice(0,25)
        console.log(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        const data = await axios.get(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        // console.log('captou o Data usando axios pelo TMDB', data.data.results);
        // console.log('result do tmdb', data.data.results);
        return data.data.results;
    }

    async getMovieByIdsOnTMDB(id:string){
        // console.log(process.env.TMDB_MOVIE_DETAILS_URL + `${id}&` + process.env.API_KEY);
        const data = await axios.get(process.env.TMDB_MOVIE_DETAILS_URL + `/${id}&` + process.env.API_KEY);
        // console.log('captou o Data usando axios pelo TMDB', data.data.results);
        console.log('result do tmdb', data.data.imdb_id);
        return data.data;
    }

    async getPreviewMoviesOnOMDB(title:TempSearchDto){  
        console.log(process.env.OMDB_PUBLIC_URL+ `&i=${title.imdbID}`);
        const data = await axios.get(process.env.OMDB_PUBLIC_URL+ `&i=${title.imdbID}`);
        console.log(" console.log(data.data.Search) ->",data.data.Search)
        if (data.data.Search){
            return data.data;
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
