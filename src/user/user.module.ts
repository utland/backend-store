import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { CartController } from "./cart/cart.controller";
import { CartService } from "./cart/cart.service";
import { CartProduct } from "./entities/cartProduct.entity";
import { PasswordService } from "src/password/password.service";
import { TopUsers } from "./entities/user-statistic.entity";

@Module({
    imports: [TypeOrmModule.forFeature([User, CartProduct, TopUsers])],
    providers: [UserService, CartService, PasswordService],
    controllers: [UserController, CartController],
    exports: [UserService]
})
export class UserModule {}
