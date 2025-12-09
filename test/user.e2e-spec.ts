import { TestBuilder } from "./config/test-builder";
import { SignUpDto } from "../src/auth/dto/sign-up.dto";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Role } from "src/common/enums/role.enum";
import { EntityBuilder, ITestPayload } from "./config/entity-builder";

describe("User test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;
    let tokens: Map<string, ITestPayload>;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        entityBuilder = new EntityBuilder(test.app, server);
    });

    beforeEach(async () => {
        tokens = await entityBuilder.createUsers();
    });

    afterEach(async () => {
        await test.clearDb();
    });

    afterAll(async () => {
        await test.closeApp();
    });

    describe("findAll", () => {
        it("should be available for ADMIN and MODERATOR", async () => {
            const token1 = tokens.get("admin")?.token;
            const token2 = tokens.get("moderator")?.token;

            await request(server)
                    .get("/user")
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(200)
                    .expect((res) => expect(res.body.length).toBe(3));

            await request(server)
                    .get("/user")
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(200)
                    .expect((res) => expect(res.body.length).toBe(3));
        })

        it("should be unavailable for USER", async () => {
            const token = tokens.get("user")?.token;

            await request(server)
                    .get("/user")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(403);
        })
    })

    describe("findById", () => {
        it("should get cerialized user", async () => {
            const token = tokens.get("user")?.token;

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
        it("should change password for user", async () => {
            const changPassDto = {
                login: tokens.get("user")?.login,
                oldPass: "test",
                newPass: "new"
            }

            await request(server)
                    .patch("/user/pass")
                    .send(changPassDto)
                    .expect(200);
            
            await request(server)
                    .post("/auth/login")
                    .send({ login: changPassDto.login, password: "test"})
                    .expect(401);

            await request(server)
                    .post("/auth/login")
                    .send({ login: changPassDto.login, password: "new"})
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
            const token = tokens.get("user")?.token;

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
            const token1 = tokens.get("user")?.token;
            const token2 = tokens.get("moderator")?.token;

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
            const token = tokens.get("admin")?.token;

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
            const token1 = tokens.get("user")?.token;
            const token2 = tokens.get("moderator")?.token;
            const moderatorId = tokens.get("moderator")?.id;

            await request(server)
                    .patch(`/user/role/${moderatorId}`)
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(403);

            await request(server)
                    .patch(`/user/role/${moderatorId}`)
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(403);
        })

        it("should change role for user", async () => {
            const token = tokens.get("admin")?.token;
            const moderatorId = tokens.get("moderator")?.id;

            await request(server)
                    .patch(`/user/role/${moderatorId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ role: "user" })
                    .expect(200);

            await request(server)
                    .get(`/user/${moderatorId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.role).toBe("user")
                    });
        })
    })
});
