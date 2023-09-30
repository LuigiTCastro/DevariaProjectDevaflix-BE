import { IsArray, IsNumber } from 'class-validator'


export class LikeMovieDto {

    @IsArray()
    likes: string[]

    @IsNumber()
    totalLikes: number
   
}