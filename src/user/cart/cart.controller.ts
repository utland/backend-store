import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { CartService } from "./cart.service";
import { UpdateCartProductDto } from "./dto/update-cart-product.dto";
import { CartProduct } from "../entities/cartProduct.entity";
import { CurrentUserId } from "src/common/decorators/current-user-id.decorator";
import { number } from "joi";

@Controller("cart")
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post("/:id")
    public async addCartProduct(
        @Param("id") productId: number, 
        @CurrentUserId() userId: number
    ): Promise<CartProduct> {
        return await this.cartService.addCartProduct(userId, productId);
    }

    @Patch()
    public async updateCartProduct(
        @Body() updateCartProductDto: UpdateCartProductDto,
        @CurrentUserId() userId: number
    ): Promise<CartProduct> {
        return await this.cartService.updateCartProduct(userId, updateCartProductDto);
    }

    @Delete("/:id")
    public async deleteCartProduct(
        @Param("id", ParseIntPipe) productId: number,
        @CurrentUserId() userId: number
    ): Promise<void> {
        await this.cartService.deleteCartProduct(userId, productId);
    }
}
