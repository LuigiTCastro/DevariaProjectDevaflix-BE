import { Controller, Get, BadRequestException, HttpCode, HttpStatus, Query, Put, Param, Request } from '@nestjs/common';
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

    @Put('like/:id')
    @HttpCode(HttpStatus.OK)
    async putLikeMovie(@Request() req, @Param('id') movieId: string) {
        const { userId } = req?.user
        const result = await this.searchService.registerLikeMovie(userId, movieId)

        if(!result) {
            throw new BadRequestException(MovieMessagesHelper.LIKE_MOVIE_INVALID)
        }

        return result
    }

    @Put('dislike/:id')
    @HttpCode(HttpStatus.OK)
    async putDislikeMovie(@Request() req, @Param('id') movieId: string) {
        const { userId } = req?.user
        const result = await this.searchService.registerDislikeMovie(userId, movieId)

        if(!result) {
            throw new BadRequestException(MovieMessagesHelper.DISLIKE_MOVIE_INVALID)
        }

        return result
    }

    @Get('rating/:id')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getRating(@Param('id') movieId: string) {
        let result = await this.searchService.getMovieRating(movieId);
        if (!result) {
            throw new BadRequestException(MovieMessagesHelper.MOVIE_RATING_NOT_FOUND)
        }
        return result
    }

    @Get("movie/")
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    async getDetails(@Query() imdbID){
        const movieObject = await this.searchService.searchOnMyDb(imdbID.imdbID);
        if (!movieObject){
            throw new BadRequestException(MovieMessagesHelper.NO_RESULTS_FOUND);
        }else{
            return movieObject[0];
        }
    }
}
