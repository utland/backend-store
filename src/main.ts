import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { ConstraintExceptionFilter } from "./common/filters/constraint.filter-exception";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true
        })
    );

    app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));

    app.useGlobalFilters(new ConstraintExceptionFilter());

    await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
