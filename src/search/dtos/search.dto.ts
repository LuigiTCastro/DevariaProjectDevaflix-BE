import { IsString } from "class-validator";

export class SearchDto {
    @IsString()
    title:string;

    @IsString()    
    poster:string;
    
    @IsString()
    imdbID:string;
    
<<<<<<< Updated upstream
    @IsNumber()
=======
    @IsString() 
>>>>>>> Stashed changes
    year:string;
    
    @IsString()
    genre:string;
    
    @IsString()
    director:string;
    
    @IsString()
    actor:string;
    
    @IsString()
    imdbRating:string;
    
}