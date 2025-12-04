import { PickType } from "@nestjs/mapped-types";
import { CreateOrderDto } from "./create-order.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateOrderAddressDto extends PickType(CreateOrderDto, [
    "address",
] as const) {
    @IsNotEmpty()
    @IsString()
    orderId: number;
}
