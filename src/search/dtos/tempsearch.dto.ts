import { IsString } from "class-validator";

export class TempSearchDto {
    @IsString()
    title:string;
}