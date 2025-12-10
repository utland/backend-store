import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    login: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;
}
