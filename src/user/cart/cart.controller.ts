import { Controller, Delete, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddProductDto } from "./dto/add-product.dto";
import { UpdateCartProductDto } from "./dto/update-cart-product.dto";
import { DeleteResult } from "typeorm";
import { CartProduct } from "../entities/cartProduct.entity";
import { CurrentUserId } from "src/common/decorators/current-user-id.decorator";

@Controller("cart")
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post()
    public async addCartProduct(addProductDto: AddProductDto, @CurrentUserId() userId: number): Promise<CartProduct> {
        return await this.cartService.addCartProduct(userId, addProductDto.productId);
    }

    @Patch()
    public async updateCartProduct(
        updateCartProductDto: UpdateCartProductDto,
        @CurrentUserId() userId: number
    ): Promise<CartProduct> {
        return await this.cartService.updateCartProduct(userId, updateCartProductDto.amount);
    }

    @Delete("/:id")
    public async deleteCartProduct(@Param("id", ParseIntPipe) id: number): Promise<void> {
        await this.cartService.deleteCartProduct(id);
    }
}
