import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IRequest } from "../interfaces/request.i";

export const CurrentUserId = createParamDecorator(
    (data: any, context: ExecutionContext) => {
        const { user } = context.switchToHttp().getRequest() as IRequest;
        return user.id;
    },
);
