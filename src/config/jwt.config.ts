import { registerAs } from "@nestjs/config";

export interface IJwtConfig {
    secret: string,
    expiresIn: string
}

export const jwtConfig = registerAs("jwt", (): IJwtConfig => ({
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN as string
}))