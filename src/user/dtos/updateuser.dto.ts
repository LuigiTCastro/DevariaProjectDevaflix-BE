import { IsEmail, MinLength } from "class-validator";
import { UserMessagesHelper } from "../helpers/messages.helper";

export class UpdateUserDto {
    @MinLength(2, {message: UserMessagesHelper.REGISTER_NAME_NOT_VALID})
    name: string;

    @IsEmail({}, {message: UserMessagesHelper.REGISTER_EMAIL_NOT_VALID})
    email:string;

}