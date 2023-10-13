import axios from "axios";
import { TempSearchDto } from './dtos/tempsearch.dto';

export class AxiosService {

    async getNamesListOnTMDB(title: TempSearchDto) { // busca geral usando metodo multi do tmdb
        title.title = title.title.slice(0, 25) //verificar retorno se retorna type: movie || tv 
        const data = await axios.get(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        return data.data.results;
    }

    async getMovieByIdsOnTMDB(id: string) {  // pegar o objeto do movie pelo id
        const data = await axios.get(process.env.TMDB_MOVIE_DETAILS_URL + `movie/${id}&` + process.env.API_KEY);
        return data.data;
    }

    async getSeriesByIdsOnTMDB(id: string) { // pegar o objeto da série (tv) pelo id
        const data = await axios.get(process.env.TMDB_SERIES_DETAILS_URL + `${id}&` + process.env.API_KEY);
        return data.data;
    }
    async getMovieTrailer(id: string){  // busca trailer de filmes
        const data = await axios.get(process.env.TMDB_MOVIE_DETAILS_URL + `movie/${id}/videos` + process.env.API_KEY );
        return data.data.results;
    }

    async getSeriesTrailer(id: string){ // busca trailer de séries
        const data = await axios.get(process.env.TMDB_SERIES_DETAILS_URL + `${id}/videos`+ process.env.API_KEY);
        return data.data.results;
    }

    async getTranslatedPlotOnTmdb(title: TempSearchDto) {
        const url = process.env.TMDB_MOVIE_DETAILS_URL + title.type + "/" + title.tmdbId + process.env.API_KEY + "&" + process.env.TMDB_RESPONSE_LANGUAGE
        const data = await axios.get(url);
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
        const data = await axios.get(process.env.OMDB_PUBLIC_URL + `&s=${title}`);
        return data.data;
    }

    async getDetailedMoviesOnOMDB(imdbId: string) {
        console.log(process.env.OMDB_PUBLIC_URL + `&i=${imdbId}`);
        const data = await axios.get(process.env.OMDB_PUBLIC_URL + `&i=${imdbId}`);
        if (data.data.Response !== 'False') {
            return data.data;
        } else {
            return { title: "N/A" };
        }
    }
}
