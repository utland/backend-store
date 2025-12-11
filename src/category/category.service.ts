import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>
    ) {}

    public async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoryRepo.create(createCategoryDto);

        return await this.categoryRepo.save(category);
    }

    public async findAll(): Promise<Category[]> {
        return await this.categoryRepo.find();
    }

    public async findOne(categoryId: number): Promise<Category> {
        const category = await this.categoryRepo.findOne({
            where: { categoryId }
        });

        if (!category) throw new NotFoundException("This category doesn't exist");

        return category;
    }

    public async updateCategory(categoryId: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(categoryId);

        return await this.categoryRepo.save(Object.assign(category, updateCategoryDto));
    }

    public async deleteCategory(categoryId: number): Promise<void> {
        const category = await this.findOne(categoryId);

        await this.categoryRepo.remove(category);
    }
}
