import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { FindProductByCategoryDto } from "./dto/find-product-by-category.dto";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepo: Repository<Product>
    ) {}

    public async createProduct(createProductDto: CreateProductDto): Promise<Product> {
        const { name, description, price, supplierId, categoryId } = createProductDto;

        const product = this.productRepo.create({
            name,
            description,
            price,
            categoryId,
            supplierId
        });

        return await this.productRepo.save(product);
    }

    public async findAll(): Promise<Product[]> {
        return await this.productRepo.find({
            relations: ["category", "supplier"]
        });
    }

    public async findProductByCategory(findByDto: FindProductByCategoryDto): Promise<Product[]> {
        const { orderBy, categoryId, isInStock } = findByDto;

        const products = await this.productRepo.find({
            where: { categoryId, isInStock },
            relations: { supplier: true },
            order: { [orderBy]: "DESC" }
        });

        return products;
    }

    public async findProduct(productId: number): Promise<Product> {
        const product = await this.productRepo.findOne({
            where: { productId },
            relations: ["reviews", "supplier", "category"]
        });

        if (!product) throw new NotFoundException();

        return product;
    }

    public async updateProduct(productId: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findProduct(productId);
        return await this.productRepo.save(Object.assign(product, updateProductDto));
    }

    public async deleteProduct(productId: number): Promise<void> {
        const product = await this.findProduct(productId);

        await this.productRepo.remove(product);
    }
}
