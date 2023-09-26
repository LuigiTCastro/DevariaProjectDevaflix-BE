import axios from "axios";
import { TempSearchDto } from './dtos/tempsearch.dto';

export class AxiosService{

    async getMovieNamesOnTMDB(title:TempSearchDto){
        title.title = title.title.slice(0,25)
        const data = await axios.get(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        return data.data.results;
    }

    async getMovieByIdsOnTMDB(id:string){
        const data = await axios.get(process.env.TMDB_MOVIE_DETAILS_URL + `/${id}&` + process.env.API_KEY);
        return data.data;
    }

    async getPreviewMoviesOnOMDB(title:TempSearchDto){  
        const data = await axios.get(process.env.OMDB_PUBLIC_URL+ `&i=${title.imdbID}`);
        if (data.data.Search){
            return data.data;
        }else{
            return {title:"N/A"};
        }
    }

    async getDetailedMoviesOnOMDB(imdbId:string){
        const data = await axios.get(process.env.OMDB_PUBLIC_URL+ `&i=${imdbId}`);
        return data.data;
    }
}
