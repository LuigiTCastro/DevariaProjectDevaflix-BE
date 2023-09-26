import { Controller, Get, Request, BadRequestException, Body, Put, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UpdateUserDto } from './dtos/updateuser.dto';
import { UserMessagesHelper } from './helpers/messages.helper';
import { UserService } from './user.service'
import { IsPublic } from 'src/auth/decorators/ispublic.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async getUser(@Request() req) {
        const { userId } = req?.user;
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new BadRequestException(UserMessagesHelper.GET_USER_NOT_FOUND);
        }

        return {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            id: user._id
        }
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const user = await this.userService.getUserById(id)

        if (!user) {
            throw new BadRequestException(UserMessagesHelper.GET_USER_NOT_FOUND)
        }

        return user
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async updateUser(@Request() req, @Body() dto: UpdateUserDto) {
        const { userId } = req?.user;
        await this.userService.updateUser(userId, dto);
    }
}