import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { AddProductDto } from "./dto/add-product.dto";
import { UpdateCartProductDto } from "./dto/update-cart-product.dto";
import { CartProduct } from "../entities/cartProduct.entity";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartProduct)
        private cartProductRepo: Repository<CartProduct>
    ) {}

    public async addCartProduct(userId: number, productId: number): Promise<CartProduct> {
        return await this.cartProductRepo.save({
            user: { userId },
            product: { productId },
            amount: 1
        });
    }

    public async updateCartProduct(
        userId: number, 
        updateCartProductDto: UpdateCartProductDto
    ): Promise<CartProduct> {
        const { productId, amount } = updateCartProductDto;
        const cartProduct = await this.findCartProduct(userId, productId);

        return await this.cartProductRepo.save({ ...cartProduct, amount });
    }

    public async deleteCartProduct( userId: number, productId: number): Promise<void> {
        const cartProduct = await this.findCartProduct(userId, productId);

        await this.cartProductRepo.remove(cartProduct);
    }

    private async findCartProduct(userId: number, productId: number): Promise<CartProduct> {
        const cartProduct = await this.cartProductRepo.findOne({
            where: { userId, productId }
        });

        if (!cartProduct) throw new NotFoundException("This cartItem doesn't exist");

        return cartProduct;
    }
}
