import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { CartController } from './cart/cart.controller';
import { CartService } from './cart/cart.service';
import { PasswordModule } from 'src/password/password.module';
import { CartProduct } from './entities/cartProduct.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, CartProduct]), PasswordModule],
    providers: [UserService, CartService],
    controllers: [UserController, CartController],
    exports: [UserService]
})
export class UserModule {}
