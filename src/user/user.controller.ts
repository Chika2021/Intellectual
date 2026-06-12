import { Body, Controller, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './model/register.dto';
import { LoginDto } from './model/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get()
    async users() {
        return await this.userService.users()
    }

    @Post('register')
    async register(@Body() user: RegisterDto) {
        return await this.userService.register(user)
    }

    @Put('login')
    async login(@Body() user: LoginDto) {
        return await this.userService.login(user)
    }

    @Patch(':id')
    async profile(@Param('id') id: number, @Body() updateData: Partial<RegisterDto>) {
        return await this.userService.updateProfile(id, updateData)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/purchased')
    async getPurchasedCourses(@Req() req) {
        const userId = req.user.id;
        return this.userService.getPurchasedCourseIds(userId);
    }

}
