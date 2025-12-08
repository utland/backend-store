import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { Supplier } from "./entities/supplier.entity";
import { SupplierService } from "./supplier.service";
import { SupplierSales } from "./entities/supplier-statistic.entity";
import { SupplierSalesDto } from "./dto/supplier-sales.dto";

@Controller("supplier")
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) {}

    @Get("sales")
    @Roles(Role.ADMIN)
    public async getInfoAboutSAles(@Body() supplierSalesDto: SupplierSalesDto): Promise<SupplierSales[]> {
        return await this.supplierService.getSupplierSalesForMonth(supplierSalesDto);
    }

    @Post()
    @Roles(Role.ADMIN)
    public async create(@Body() createSupplierDto: CreateSupplierDto) {
        return await this.supplierService.createSupplier(createSupplierDto);
    }

    @Get()
    public async findAll() {
        return await this.supplierService.findAll();
    }

    @Get("/:id")
    public async findOne(@Param("id", ParseIntPipe) supplierId: number) {
        return await this.supplierService.findSupplier(supplierId);
    }

    @Patch("/:id")
    @Roles(Role.ADMIN)
    public async update(
        @Param("id", ParseIntPipe) supplierId: number,
        @Body() updateSupplierDto: UpdateSupplierDto
    ): Promise<Supplier> {
        return await this.supplierService.updateSupplier(supplierId, updateSupplierDto);
    }

    @Delete("/:id")
    @Roles(Role.ADMIN)
    public async delete(@Param("id", ParseIntPipe) supplierId: number): Promise<void> {
        return await this.supplierService.deleteSupplier(supplierId);
    }
}
