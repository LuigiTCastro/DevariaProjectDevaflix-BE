import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class TempSearchDto {
    @IsString()
    title: string;

    @IsString()
    type: string;

    @IsString()
    imdbID: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    videos: string;
}