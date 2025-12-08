import { IsNotEmpty, IsString } from "class-validator";

export class SupplierSalesDto {
    @IsNotEmpty()
    @IsString()
    year: string;

    @IsNotEmpty()
    @IsString()
    month: string;
}
