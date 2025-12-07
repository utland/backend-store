import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IRequest } from "../interfaces/request.i";

export const CurrentUser = createParamDecorator((data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest() as IRequest;
    return request.user;
});
