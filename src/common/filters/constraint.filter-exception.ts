import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import e, { Response } from "express";
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class ConstraintExceptionFilter implements ExceptionFilter {
    private response: Response;

    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        this.response = ctx.getResponse<Response>();
        
        const code = (exception as any).driverError.code;
        
        if (code === '23505') this.send(409, exception.message);
        
        this.send(400, exception.message);
    }

    private send(status: number, message: string) {
        this.response.status(status).json({ 
            statusCode: status, 
            message,
            timestamp: new Date().toISOString()
        });
    }

}