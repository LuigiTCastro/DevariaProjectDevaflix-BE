import {Controller, HttpCode, HttpStatus ,Get, Post, Param} from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService){}

    @Get(':title')
    async getmovies(@Param() params){
        const movieName = params;
        console.log("movieName no comtroller", movieName);
        let movies = await this.searchService.serchMovie(movieName);
        console.log("movies do controle... o que esta retornando para o front =>", movies);
        return movies;
    }
}
