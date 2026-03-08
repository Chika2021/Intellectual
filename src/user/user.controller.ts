import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './model/register.dto';
import { LoginDto } from './model/login.dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService){}

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
        async profile(@Param('id') id: number, @Body() updateData: Partial<RegisterDto>){
            return await this.userService.updateProfile(id, updateData)
        }

}
