import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IRequest } from "../interfaces/request.i";
import { Role } from "../enums/role.enum";

export const isAdmin = createParamDecorator(
    (data: any, context: ExecutionContext) => {
        const { user } = context.switchToHttp().getRequest() as IRequest;
        return user.role === Role.ADMIN || user.role === Role.MODERATOR;
    }
)