import {Controller, Get, Request, BadRequestException, Body, Put, HttpCode, HttpStatus, Param} from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService){}

    @Get(':title')

    async getmovie(@Param() params){
        const movieName = params;
        console.log("movieName no comtroller", movieName);
        let movies = await this.searchService.serchMovie(movieName);
        // console.log("movies do controle... o que esta retornando para o front =>", movies);
        return movies;
        // return movieName;
    }
    // async (@Request() req){
    //     const {movieName} = req?.search;
    //     let movie = "buscando filme"
    //     // let movie = await this.searchService.searchByName(movieName);

    //     if(!movie){
    //         // throw new BadRequestException(UserMessagesHelper.GET_USER_NOT_FOUND);
    //         // await this.searchService.getInfoByName(movieName);

    //     }
    //     // movie = await this.searchService.searchByName(movieName);

    // }    
}
