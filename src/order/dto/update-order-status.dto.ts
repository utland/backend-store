import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "src/common/enums/status.enum";
import { IsNull } from "typeorm/browser";

export class UpdateOrderStatusDto {
    @IsNumber()
    @IsNotEmpty()
    orderId: number;

    @IsEnum(OrderStatus)
    @IsOptional()
    status: OrderStatus;
}
