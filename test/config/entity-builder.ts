import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { Category } from "src/category/entities/category.entity";
import { Role } from "src/common/enums/role.enum";
import { OrderStatus } from "src/common/enums/status.enum";
import { CreateOrderProductDto } from "src/order/dto/create-order-product.dto";
import { Order } from "src/order/entities/order.entity";
import { OrderProduct } from "src/order/entities/orderProduct.entity";
import { Product } from "src/product/entities/product.entity";
import { Review } from "src/review/entities/review.entity";
import { Supplier } from "src/supplier/entities/supplier.entity";
import { CartProduct } from "src/user/entities/cartProduct.entity";
import { User } from "src/user/entities/user.entity";
import request from "supertest";
import { Repository } from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings.js";

export const productTest = {
    name: "product",
    description: "desc",
    price: 100
}

export const supplierTest = {
    name: "supplier",
    phone: "+0000000",
    email: "example@gmail.com"
}

export const categoryTest = {
    name: "category",
    img_url: "img_url"
}

export const reviewTest = {
    evaluation: 4,
    comment: "comment"
}

export interface ITestPayload {
    token: string,
    id: number,
    login: string
}

export const userTest: SignUpDto = {
    login: `user`,
    address: "test",
    password: "test",
    phone: "+000000000",
    email: `useremail@gmail.com`
};

export const adminTest: SignUpDto = {
    login: `admin`,
    address: "test",
    password: "test",
    phone: "+000000000",
    email: `adminemail@gmail.com`
};


export const moderatorTest: SignUpDto = {
    login: `moderator`,
    address: "test",
    password: "test",
    phone: "+000000000",
    email: `moderatoremail@gmail.com`
};

export class EntityBuilder {
    private readonly server: any;
    private readonly app: INestApplication<any>;

    constructor(app: INestApplication, server: any) {
        this.server = server;
        this.app = app;
    }

    public async createUsers(): Promise<Map<string, ITestPayload>> {
        const tokens = new Map<string, ITestPayload>;

        await request(this.server).post("/auth/register").send(userTest).expect(201);
        await request(this.server).post("/auth/register").send(adminTest).expect(201);
        await request(this.server).post("/auth/register").send(moderatorTest).expect(201);

        const userRepo = this.app.get<Repository<User>>(getRepositoryToken(User));

        await userRepo.update({ login: adminTest.login }, { role: Role.ADMIN});
        await userRepo.update({ login: moderatorTest.login }, { role: Role.MODERATOR});

        const userRes = await request(this.server).post("/auth/login").send(userTest).expect(201);
        const adminRes = await request(this.server).post("/auth/login").send(adminTest).expect(201);
        const moderatorRes = await request(this.server).post("/auth/login").send(moderatorTest).expect(201);

        tokens.set("user", { 
            token: userRes.body.accessToken,
            id: userRes.body.id,
            login: userTest.login
        });

        tokens.set("admin", { 
            token: adminRes.body.accessToken,
            id: adminRes.body.id,
            login: adminTest.login
        });

        tokens.set("moderator", { 
            token: moderatorRes.body.accessToken,
            id: moderatorRes.body.id,
            login: moderatorTest.login
        });

        return tokens;
    }

    public async createUser(): Promise<ITestPayload> {
        await request(this.server).post("/auth/register").send(userTest).expect(201);
        const userRes = await request(this.server).post("/auth/login").send(userTest).expect(201);

        return { token: userRes.body.accessToken, id: userRes.body.id, login: userTest.login };
    }

    public async createCategory(): Promise<number> {
        const categoryRepo = this.app.get<Repository<Category>>(getRepositoryToken(Category));

        const { categoryId } = await categoryRepo.save({
            name: categoryTest.name,
            img_url: categoryTest.img_url
        });

        return categoryId;
    }

    public async createSupplier(): Promise<number> {
        const categoryRepo = this.app.get<Repository<Supplier>>(getRepositoryToken(Supplier));

        const { supplierId } = await categoryRepo.save({
           name: supplierTest.name,
           phone: supplierTest.phone,
           email: supplierTest.email 
        });

        return supplierId;
    }

    public async createProduct(supplierId: number, categoryId: number): Promise<number> {
        const productRepo = this.app.get<Repository<Product>>(getRepositoryToken(Product));

        const { productId } = await productRepo.save({ ...productTest, supplierId, categoryId });

        return productId;
    }

    public async createOrder(userId: number, status?: OrderStatus): Promise<number> {
        const orderRepo = this.app.get<Repository<Order>>(getRepositoryToken(Order));
        const { orderId } = await orderRepo.save({ userId, address: "address"});

        if (status) {
            await orderRepo.update({ orderId }, { status });
        }

        return orderId;
    }

    public async createOrderProduct(orderId: number, productId: number): Promise<void> {
        const orderProductRepo = this.app.get<Repository<OrderProduct>>(getRepositoryToken(OrderProduct));
        await orderProductRepo.save({ orderId, productId, amount: 1, price: 100})
    }

    public async createCartProduct(userId: number, productId: number): Promise<void> {
        const cartRepo = this.app.get<Repository<CartProduct>>(getRepositoryToken(CartProduct));
        await cartRepo.save({ userId, productId, amount: 1 })
    }

    public async createReview(userId: number, productId: number): Promise<number> {
        const reviewRepo = this.app.get<Repository<Review>>(getRepositoryToken(Review));

        const { reviewId } = await reviewRepo.save({ ...reviewTest, userId, productId });

        return reviewId;
    }
}