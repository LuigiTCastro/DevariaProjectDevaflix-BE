import { IsArray, IsNumber, IsString } from 'class-validator'


export class RatingDto {

    @IsString()
    imdbID: string

    @IsArray()
    likes: string[]

    @IsNumber()
    totalLikes: number

    @IsArray()
    dislikes: string[]

    @IsNumber()
    totalDislikes: number

    @IsNumber()
    percentageLikes: number

    
   
}