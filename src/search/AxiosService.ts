import axios from 'axios';
import { SearchDto } from './dtos/search.dto';
import { TempSearchDto } from './dtos/tempsearch.dto';

export class AxiosService{

    async getMoviesOnTMDB(title:TempSearchDto){
        title.title = title.title.slice(0,25)
        console.log(title);
        // console.log(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        const data = await axios.get(process.env.TMDB_PUBLIC_URL + process.env.API_KEY + `&query=${title.title}`);
        // console.log('captou o Data usando axios pelo TMDB', data.data.results);
        const dados = data.data.results;
        // console.log('exibindo os dados da variavel dados '); 

        const movieList =[];
        for (const movie of dados) {
            const object = {
                title:movie.title
            }
            // console.log("object = > ", object);
            movieList.push(object);
            // console.log("movieList => ", movieList);
        }
        return movieList;

    }

    async getPreviewMoviesOnOMDB(title:TempSearchDto){  // Trazer um for para cá ---. QUal? Não sei!
        // console.log(title);
        console.log(process.env.OMDB_PUBLIC_URL+ `&s=${title.title}`);
        const data = await axios.get(process.env.OMDB_PUBLIC_URL+ `&s=${title.title}`);
        // console.log("Data => ", data.data.Search);
        let dados = [];
        if (!data.data.Response){
            // console.log("search do axios",data.data.Search);
            dados.push(data.data.Search);
        }
        if (!data.data.Search){
        // console.log("response do axios",data.data.Response); 
        }
        // console.log('captou o Data usando axios Pelo OMDB ', dados);
        // console.log('captou o Data usando axios Pelo OMDB ', dados);
        return dados;
    }

    async getDetailedMoviesOnOMDB(imdbId){
        console.log(imdbId);
        // console.log(process.env.OMDB_PUBLIC_URL+ `&i=${imdbId}`);
        const data = await axios.get(process.env.OMDB_PUBLIC_URL+ `&i=${imdbId}`);
        // console.log("Data => ", data.data.Search);
        // console.log('captou o Data usando axios Pelo OMDB ');
        // console.log(data.data);
        const dados = data.data.Search;
        return dados;
        // return "ok";
        // return data.data;
    }
}
