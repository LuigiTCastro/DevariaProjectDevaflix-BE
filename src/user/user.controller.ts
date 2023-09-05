import {Controller, Get, Request, BadRequestException, Body, Put, HttpCode, HttpStatus} from '@nestjs/common';
import { UpdateUserDto } from './dtos/updateuser.dto';
import { UserMessagesHelper } from './helpers/messages.helper';
import { UserService } from './user.service'

@Controller('user')
export class UserController{
    constructor(private readonly userService: UserService){}

    @Get()
    async getUser(@Request() req){
        const {userId} = req?.user;
        const user = await this.userService.getUserById(userId);

        if(!user){
            throw new BadRequestException(UserMessagesHelper.GET_USER_NOT_FOUND);
        }

        return {
            name: user.name,
            email: user.email,
            id: user._id
        }
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async updateUser(@Request() req, @Body() dto: UpdateUserDto){
        const {userId} = req?.user;
        await this.userService.updateUser(userId, dto);
    }
}