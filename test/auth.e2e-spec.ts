import { TestBuilder } from "./config/test-builder";
import { SignUpDto } from "../src/auth/dto/sign-up.dto";
import { SignInDto } from "../src/auth/dto/sign-in.dto";
import request from "supertest";

const testSignUp: SignUpDto = {
    login: "test-auth",
    address: "test",
    password: "test",
    phone: "+000000",
    email: "test@gmail.com"
};

const testSignIn: SignInDto = {
    login: "test-auth",
    password: "test"
};

describe("Authorization", () => {
    let test: TestBuilder;
    let server: any;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
    });

    afterEach(async () => {
        await test.clearDb();
    });

    afterAll(async () => {
        await test.closeApp();
    });

    it("should require authorization", async () => {
        await request(server).get("/product").expect(401);
    });

    it("should successfully register user", async () => {
        await request(server).post("/auth/register").send(testSignUp).expect(201);
    });

    it("should successfully allow for user to login", async () => {
        await request(server).post("/auth/register").send(testSignUp);

        await request(server)
            .post("/auth/login")
            .send(testSignIn)
            .expect(201)
            .expect((res) => {
                expect(res.body.accessToken).toBeDefined();
                expect(res.body.id).toBeDefined();
            });
    });
});
