import { Module } from "@nestjs/common";
import { SupplierController } from "./supplier.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Supplier } from "./entities/supplier.entity";
import { SupplierService } from "./supplier.service";
import { SupplierSales } from "./entities/supplier-statistic.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Supplier, SupplierSales])],
    controllers: [SupplierController],
    providers: [SupplierService]
})
export class SupplierModule {}
