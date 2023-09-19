import {Controller, Get, Request, BadRequestException, Body, Put, HttpCode, HttpStatus, Param} from '@nestjs/common';
import { SearchService } from './search.service';
import { IsPublic } from 'src/auth/decorators/ispublic.decorator';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService){}

    @Get(":title")
    @IsPublic()
    async getmovie(@Param() movieName){
        console.log("movieName no controller", movieName);
        let movies = await this.searchService.searchMovie(movieName);
        console.log("movies do controle... o que esta retornando para o front =>", movies);
        return movies;
    }
<<<<<<< Updated upstream
=======

    @Get('filter/')
    @IsPublic()
    async filterMovies(@Body() req) {
        const movies = await this.searchService.findMoviesbyfilter(req.filter,req.value)
        return movies
    }

>>>>>>> Stashed changes
}
