import {Controller, Get, BadRequestException, HttpCode, HttpStatus, Query} from '@nestjs/common';
import { SearchService } from './search.service';
import { IsPublic } from 'src/auth/decorators/ispublic.decorator';
import { MovieMessagesHelper } from './helpers/messages.helper';


@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService){}

    @Get("title/")
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getmovie(@Query() movieName){
        const movies = await this.searchService.searchMovie(movieName);
        if (movies?.length < 1){
            throw new BadRequestException(MovieMessagesHelper.NO_RESULTS_FOUND);
        }else{
            return movies;
        }
    }

    @Get('filter/')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getFilteredMovies(@Query() filters?:any) {
        const movies = await this.searchService.findMoviesbyfilter(filters);
        if (movies?.length < 1){
            throw new BadRequestException(MovieMessagesHelper.NO_RESULTS_FOUND);
        }else{
            return movies;
        }
    }

    @Get('random/db')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getRandomMovieFromMyDb() {
        const randomMovie = await this.searchService.findRandomMovieFromMyDb()

        if (!randomMovie) {
            throw new BadRequestException(MovieMessagesHelper.NO_RESULTS_FOUND)
        }

        return randomMovie
    }

    @Get('random/omdb')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getRandomMovieFromOMDB() {
        const randomMovie = await this.searchService.findRandomMovieFromOMDB()

        if (!randomMovie) {
            throw new BadRequestException(MovieMessagesHelper.NO_RESULTS_FOUND)
        }

        return randomMovie
    }

}
