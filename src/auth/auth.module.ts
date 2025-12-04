import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigType } from "src/config/config.types";
import { IJwtConfig } from "src/config/jwt.config";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AuthGuard } from "src/common/guards/auth.guard";
import { UserModule } from "src/user/user.module";
import { PasswordModule } from "src/password/password.module";

@Module({
    imports: [
        UserModule,
        PasswordModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService<ConfigType>) => {
                const jwtConfig = configService.get<IJwtConfig>("jwt") as IJwtConfig;

                return {
                    secret: jwtConfig.secret,
                    signOptions: {
                        expiresIn: jwtConfig.expiresIn as any
                    }
                }
            }
        })
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: "APP_GUARD",
            useClass: RolesGuard
        },
        {
            provide: "APP_GUARD",
            useClass: AuthGuard
        },
    ]
})
export class AuthModule {}