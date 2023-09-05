import {Controller, Post, HttpCode, HttpStatus, Body} from '@nestjs/common'
import { RegisterDto } from 'src/user/dtos/register.dto';
import { AuthService } from './auth.service';
import { IsPublic } from './decorators/ispublic.decorator';
import { LoginDto } from './dtos/login.dto';

@Controller("auth")
export class AuthController{
    constructor(private readonly authService: AuthService){}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    login(@Body() dto: LoginDto){
        return this.authService.login(dto);
    }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    register(@Body() dto: RegisterDto){
        return this.authService.register(dto);
    }
}