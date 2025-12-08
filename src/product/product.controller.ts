import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Role } from "src/common/enums/role.enum";
import { Roles } from "src/common/decorators/roles.decorator";
import { Product } from "./entities/product.entity";
import { Category } from "src/category/entities/category.entity";
import { Supplier } from "src/supplier/entities/supplier.entity";
import { ProductService } from "./product.service";
import { FindProductByCategoryDto } from "./dto/find-product-by-category.dto";

@Controller("product")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post()
    @Roles(Role.ADMIN)
    public async create(@Body() createProductDto: CreateProductDto) {
        return await this.productService.createProduct(createProductDto);
    }

    @Get()
    public async findAll(): Promise<Product[]> {
        return await this.productService.findAll();
    }

    @Get("/byCategory")
    public async findByCategory(findByCategoryDto: FindProductByCategoryDto): Promise<Product[]> {
        return await this.productService.findProductByCategory(findByCategoryDto);
    }

    @Get("/:id")
    public async findOne(@Param("id", ParseIntPipe) productId: number): Promise<Product> {
        return await this.productService.findProduct(productId);
    }

    @Patch("/:id")
    @Roles(Role.ADMIN)
    public async updateProduct(
        @Param("id", ParseIntPipe) productId: number,
        @Body() updateProductDto: UpdateProductDto
    ): Promise<Product> {
        return await this.productService.updateProduct(productId, updateProductDto);
    }

    @Delete("/:id")
    @Roles(Role.ADMIN)
    public async deleteProduct(@Param("id", ParseIntPipe) productId: number): Promise<void> {
        return await this.productService.deleteProduct(productId);
    }
}
