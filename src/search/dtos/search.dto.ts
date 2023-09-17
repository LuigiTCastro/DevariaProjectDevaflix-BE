import { IsNumber, IsString } from "class-validator";

export class SearchDto {
    @IsString()
    title:string;

    @IsString()    
    poster:string;
    
    @IsString()
    imdbID:string;
    
    @IsString() // PASSEI DE 'ISNUMBER' PARA 'ISSTRING'
    year:string;
    
    @IsString()
    genre:string;
    
    @IsString()
    director:string;
    
    @IsString()
    actor:string;
    
    @IsNumber()
    imdbRating:string;
    
}