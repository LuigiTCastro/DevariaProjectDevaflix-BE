import { IsString } from "class-validator";

export class TempSearchDto {
    @IsString()
    title:string;

    @IsString()
    imdbID:string;

    @IsString()
    videos:string;
}