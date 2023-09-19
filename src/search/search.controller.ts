import {Controller, Get, BadRequestException, HttpCode, HttpStatus, Query} from '@nestjs/common';
import { SearchService } from './search.service';
import { IsPublic } from 'src/auth/decorators/ispublic.decorator';


@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService){}

    @Get("title/")
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getmovie(@Query() movieName){
        const movies = await this.searchService.searchMovie(movieName);
        if (movies.length < 1){
            throw new BadRequestException(process.env.NO_RESULTS_FOUND);
        }else{
            return movies;
        }
    }

    @Get('filter/')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getFilteredMovies(@Query() filters?:any) {
        const movies = await this.searchService.findMoviesbyfilter(filters);
        if (movies.length < 1){
            throw new BadRequestException(process.env.NO_RESULTS_FOUND);
        }else{
            return movies;
        }
    }

}
