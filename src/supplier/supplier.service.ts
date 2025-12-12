import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Supplier } from "./entities/supplier.entity";
import { Repository } from "typeorm";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { SupplierSales } from "./entities/supplier-statistic.entity";
import { DataSource } from "typeorm";
import { SupplierSalesDto } from "./dto/supplier-sales.dto";

@Injectable()
export class SupplierService {
    constructor(
        @InjectRepository(Supplier)
        private readonly supplierRepo: Repository<Supplier>,

        @InjectRepository(SupplierSales)
        private readonly supplierSalesRepo: Repository<SupplierSales>,

        private readonly dataSource: DataSource
    ) {}

    public async createSupplier(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
        const supplier = this.supplierRepo.create(createSupplierDto);

        await this.supplierRepo.save(supplier);

        return supplier;
    }

    public async findAll() {
        return await this.supplierRepo.find();
    }

    public async findSupplier(supplierId: number): Promise<Supplier> {
        const supplier = await this.supplierRepo.findOne({
            where: { supplierId },
            relations: ["products"]
        });

        if (!supplier) throw new NotFoundException("This supplier doesn't exist");

        return supplier;
    }

    public async updateSupplier(supplierId: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
        const supplier = await this.findSupplier(supplierId);

        return await this.supplierRepo.save(Object.assign(supplier, updateSupplierDto));
    }

    public async deleteSupplier(supplierId: number): Promise<void> {
        const supplier = await this.findSupplier(supplierId);
        await this.supplierRepo.remove(supplier);
    }

    public async getSupplierSalesForMonth(supplierSalesDto: SupplierSalesDto): Promise<SupplierSales[]> {
        const { year, month } = supplierSalesDto;
        const supplierSalesTable = await this.supplierSalesRepo.find({
            where: { month: `${year}-${month}` }
        });

        

        return supplierSalesTable;
    }
}
