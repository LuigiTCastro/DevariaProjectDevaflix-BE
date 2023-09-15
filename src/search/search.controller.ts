import {Controller, Get, Request, BadRequestException, Body, Put, HttpCode, HttpStatus, Param} from '@nestjs/common';
import { SearchService } from './search.service';
import { IsPublic } from 'src/auth/decorators/ispublic.decorator';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService){}

    @Get(":title")
    @IsPublic()
    async getmovie(@Param() params){
        const movieName = params;
        console.log("movieName no controller", movieName);
        let movies = await this.searchService.serchMovie(movieName);
        console.log("movies do controle... o que esta retornando para o front =>", movies);
        return movies;
    }
}
