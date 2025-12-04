import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateCartProductDto {
    @IsOptional()
    @IsNumber()
    @IsPositive()
    amount: number
}
