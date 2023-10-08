<<<<<<< HEAD
import { IsString, IsNumber, IsArray } from "class-validator";
=======
import { ArrayMinSize, IsArray, IsString } from 'class-validator';
>>>>>>> 87b7b74a71ded3c53beb64c445c5947402ba814c

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

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    videos: string;
}