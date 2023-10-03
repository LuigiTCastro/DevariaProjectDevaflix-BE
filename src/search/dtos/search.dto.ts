import { IsString, IsNumber, IsArray } from "class-validator";

export class SearchDto {
    @IsString()
    title: string;

    @IsString()
    translatedTitle: string;

    @IsString()
    poster: string;

    @IsString()
    imdbID: string;

    @IsString()
    year: string;

    @IsString()
    genre: string;

    @IsString()
    director: string;

    @IsString()
    actor: string;

    @IsString()
    imdbRating: string;

    @IsString()
    plot: string;
}