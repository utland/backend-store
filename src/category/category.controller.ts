import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
} from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { CategoryService } from "./category.service";

@Controller("category")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @Roles(Role.ADMIN)
    public async createCategory(
        @Body() createCategoryDto: CreateCategoryDto,
    ): Promise<Category> {
        return await this.categoryService.createCategory(createCategoryDto);
    }

    @Get()
    public async findAll(): Promise<Category[]> {
        return await this.categoryService.findAll();
    }

    @Get("/:id")
    public async findCategory(
        @Param("id", ParseIntPipe) categoryId: number,
    ): Promise<Category> {
        return await this.categoryService.findOne(categoryId);
    }

    @Patch("/:id")
    @Roles(Role.ADMIN)
    public async updateCategory(
        @Param("id", ParseIntPipe) categoryId: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<Category> {
        return await this.categoryService.updateCategory(
            categoryId,
            updateCategoryDto,
        );
    }

    @Roles(Role.ADMIN)
    @Delete("/:id")
    public async deleteCategory(
        @Param("id", ParseIntPipe) categoryId: number,
    ): Promise<void> {
        return await this.categoryService.deleteCategory(categoryId);
    }
}
