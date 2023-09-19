import {Controller, Get, Request, BadRequestException, Body, Put, HttpCode, HttpStatus, Param, Query} from '@nestjs/common';
import { SearchService } from './search.service';
import { IsPublic } from 'src/auth/decorators/ispublic.decorator';
import { SearchDto } from './dtos/search.dto';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService){}

    // ESSA ROTA ESTÁ CONFLITANDO COM getMoviesByFilters
    // MUDAR DE :title PARA title
    // MUDAR DE @Param PARA @Query
    // @Get(":title")
    // @IsPublic()
    // async getmovie(@Param() params){
    //     const movieName = params;
    //     console.log("movieName no controller", movieName);
    //     let movies = await this.searchService.serchMovie(movieName);
    //     console.log("movies do controle... o que esta retornando para o front =>", movies);
    //     return movies;
    // }

    @Get('filter')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getMoviesByFilters(@Query() filters?: any) {
        const movies = await this.searchService.findMoviesByFilters(filters)
        return movies
    }

}
