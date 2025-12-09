import { TestBuilder } from "./config/test-builder";
import { SignUpDto } from "../src/auth/dto/sign-up.dto";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Role } from "src/common/enums/role.enum";

const userTest: SignUpDto = {
    login: "test",
    address: "test",
    password: "test",
    phone: "+000000000",
    email: "test@gmail.com"
};

const adminTest: SignUpDto = {
    login: "admin",
    address: "test",
    password: "test",
    phone: "+000000000",
    email: "admin@gmail.com"
};

const moderatorTest: SignUpDto = {
    login: "moderator",
    address: "test",
    password: "test",
    phone: "+000000000",
    email: "moderator@gmail.com"
};

describe("User test", () => {
    let test: TestBuilder;
    let server: any;
    let tokens: Map<string, string>;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        tokens = new Map();
    });

    beforeEach(async () => {
        await request(server).post("/auth/register").send(userTest).expect(201);
        await request(server).post("/auth/register").send(moderatorTest).expect(201);
        await request(server).post("/auth/register").send(adminTest).expect(201);

        const userRepo = test.app.get<Repository<User>>(getRepositoryToken(User));

        await userRepo.update({ login: adminTest.login }, { role: Role.ADMIN});
        await userRepo.update({ login: moderatorTest.login }, { role: Role.MODERATOR});

        const userRes = await request(server).post("/auth/login").send(userTest).expect(201);
        const adminRes = await request(server).post("/auth/login").send(adminTest).expect(201);
        const moderatorRes = await request(server).post("/auth/login").send(moderatorTest).expect(201);

        tokens.set("user", userRes.body.accessToken);
        tokens.set("admin", adminRes.body.accessToken);
        tokens.set("moderator", moderatorRes.body.accessToken);
    });

    afterEach(async () => {
        await test.clearDb();
    });

    afterAll(async () => {
        await test.closeApp();
    });

    describe("findAll", () => {
        it("should be available for ADMIN and MODERATOR", async () => {
            const token1 = tokens.get("admin");
            const token2 = tokens.get("moderator");

            await request(server)
                    .get("/user")
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(200)
                    .expect((res) => res.body.length === 3);

            await request(server)
                    .get("/user")
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(200)
                    .expect((res) => res.body.length === 3);
        })

        it("should be unavailable for USER", async () => {
            const token = tokens.get("user");

            await request(server)
                    .get("/user")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(403);
        })
    })

    describe("findById", () => {
        it("should get cerialized user", async () => {
            const token = tokens.get("user");

            await request(server)
                    .get("/user/2")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.password).toBeUndefined()
                        expect(res.body.deletedAt).toBeUndefined()
                        expect(res.body.userId).toBeDefined()
                        expect(res.body.login).toBeDefined()
                        expect(res.body.address).toBeDefined()
                        expect(res.body.email).toBeDefined()
                        expect(res.body.phone).toBeDefined()
                        expect(res.body.imgUrl).toBeDefined()
                        expect(res.body.createdAt).toBeDefined()
                        expect(res.body.role).toBeDefined()    
                    });
        })
    })

    describe("changePasswd", () => {
        const changPassDto = {
            login: "test",
            oldPass: "test",
            newPass: "new"
        }

        it("should change password for user", async () => {
            await request(server)
                    .patch("/user/pass")
                    .send(changPassDto)
                    .expect(200);
            
            await request(server)
                    .post("/auth/login")
                    .send(userTest)
                    .expect(401);

            await request(server)
                    .post("/auth/login")
                    .send({ login: "test", password: "new"})
                    .expect(201)
        })
    })

    describe("updateUser", () => {
        const updatedDto = {
            address: "new-address",
            phone: "+309403940",
            email: "new@gmail.com"
        }

        it("should update data for user", async () => {
            const token = tokens.get("user");

            await request(server)
                    .patch("/user")
                    .set("Authorization", `Bearer ${token}`)
                    .send(updatedDto)
                    .expect(200);

            await request(server)
                    .get("/user/token")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.address).toBe(updatedDto.address)
                        expect(res.body.phone).toBe(updatedDto.phone)
                        expect(res.body.email).toBe(updatedDto.email)
                    });
            
        })
    })

    describe("deleteUser", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = tokens.get("user");
            const token2 = tokens.get("moderator");

            await request(server)
                    .delete("/user/1")
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(403);

            await request(server)
                    .delete("/user/1")
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(403);
        })

        it("should softly remove user", async () => {
            const token = tokens.get("admin");

            await request(server)
                    .delete("/user/1")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

            await request(server)
                    .get("/user/1")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(404);
        })
    })

    describe("changeRole", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = tokens.get("user");
            const token2 = tokens.get("moderator");

            await request(server)
                    .patch("/user/role/2")
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(403);

            await request(server)
                    .patch("/user/role/2")
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(403);
        })

        it("should change role for user", async () => {
            const token = tokens.get("admin");

            await request(server)
                    .patch("/user/role/2")
                    .set("Authorization", `Bearer ${token}`)
                    .send({ role: "user" })
                    .expect(200);

            await request(server)
                    .get("/user/2")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.role).toBe("user")
                    });
        })
    })
});
