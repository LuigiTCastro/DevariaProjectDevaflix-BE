import { ArrayMinSize, IsArray, IsNumber, IsString } from 'class-validator';

export class ScoreDto {

    @IsString()
    imdbID: string;
    
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    likes: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    dislikes: string;
    
    @IsNumber()
    average: number;

}