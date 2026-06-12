import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "./user.service";
import { ConfigService } from "@nestjs/config";


@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService,
                private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!
            
        })
    }

    async validate(payload: any) {
        const user = await this.userService.findById(payload.id)
        if(!user) {
            throw new UnauthorizedException()
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role
        }

    }

   

}