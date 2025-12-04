import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSupplierDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    logo?: string;
}
