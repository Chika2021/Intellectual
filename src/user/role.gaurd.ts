import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "./model/user.model";
import { ROLES_KEY } from "./role.decorators";


@Injectable()

export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if(!requiredRoles){
            return true
        }
        const { user }  = context.switchToHttp().getResponse();

        if(!user) {
            return false
        }

        return requiredRoles.some((role) => user.role === role )
        
    }
}