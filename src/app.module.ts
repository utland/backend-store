import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appSchema } from './config/schema.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigType } from './config/config.types';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        ...configService.get("database"),
        entities: []
      }),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: appSchema,
      load: [databaseConfig, jwtConfig],
      validationOptions: {
        abortEarly: true
      }
    })
  ]
})
export class AppModule {}
