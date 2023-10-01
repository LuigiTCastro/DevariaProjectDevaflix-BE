import axios from "axios";
import { TempSearchDto } from './dtos/tempsearch.dto';

export class AxiosService {

    async getNamesListOnTMDB(title: TempSearchDto) { // busca geral usando metodo multi do tmdb
        title.title = title.title.slice(0, 25) //verificar retorno se retorna type: movie || tv 
        const data = await axios.get(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        // console.log("get names Lists ",data.data.results);
        return data.data.results;
    }

    async getMovieByIdsOnTMDB(id: string) {  // pegar o objeto do movie pelo id
        // console.log(process.env.TMDB_MOVIE_DETAILS_URL + `${id}&` + process.env.API_KEY);
        const data = await axios.get(process.env.TMDB_MOVIE_DETAILS_URL + `${id}&` + process.env.API_KEY);
        // console.log("get movie by id on tmdb",data.data);
        return data.data;
    }

    async getSeriesByIdsOnTMDB(id: string) { // pegar o objeto da série (tv) pelo id
        // console.log(process.env.TMDB_SERIES_DETAILS_URL + `${id}&` + process.env.API_KEY);
        const data = await axios.get(process.env.TMDB_SERIES_DETAILS_URL + `${id}&` + process.env.API_KEY);
        // console.log("get series by id on tmdb",data.data);
        return data.data;
    }
    async getMovieTrailer(id: string){  // busca trailer de filmes
        // console.log(process.env.TMDB_MOVIE_DETAILS_URL + `${id}/videos` + process.env.API_KEY );
        const data = await axios.get(process.env.TMDB_MOVIE_DETAILS_URL + `${id}/videos` + process.env.API_KEY );
        return data.data.results;
    }

    async getSeriesTrailer(id: string){ // busca trailer de séries
        // console.log(process.env.TMDB_SERIES_DETAILS_URL + `${id}/videos`+ process.env.API_KEY);
        const data = await axios.get(process.env.TMDB_SERIES_DETAILS_URL + `${id}/videos`+ process.env.API_KEY);
        // console.log("get series trailer by id on tmdb",data.data.results);
        // buscarTrailer https://api.themoviedb.org/3/tv/{series_id}/videos
        return data.data.results;
    }

    async getTranslatedPlotOnTmdb(id: string) {
        const data = await axios.get(process.env.TMDB_MOVIE_DETAILS_URL + id + process.env.API_KEY + "&" + process.env.TMDB_RESPONSE_LANGUAGE);
        return data.data;
    }

    async getPreviewMoviesOnOMDB(title: TempSearchDto) {
        const data = await axios.get(process.env.OMDB_PUBLIC_URL + `&i=${title.imdbID}`);
        if (data.data.Response === 'True') {
            return data.data;
        } else {
            return { title: "N/A" };
        }
    }

    async getTtIdSeriesfromOmdb(title:string){
        console.log(process.env.OMDB_PUBLIC_URL + `&s=${title}`);
        const data = await axios.get(process.env.OMDB_PUBLIC_URL + `&s=${title}`);
        return data.data;
    }

    async getDetailedMoviesOnOMDB(imdbId: string) {

        const data = await axios.get(process.env.OMDB_PUBLIC_URL + `&i=${imdbId}`);
        if (data.data.Response !== 'False') {
            return data.data;
        } else {
            return { title: "N/A" };
        }
    }
}
