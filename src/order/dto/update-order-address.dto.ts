import { PickType } from "@nestjs/mapped-types";
import { CreateOrderDto } from "./create-order.dto";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateOrderAddressDto {
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @IsNotEmpty()
    @IsString()
    address: string;
}
