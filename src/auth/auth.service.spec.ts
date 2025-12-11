import { PasswordService } from "src/password/password.service";
import { AuthService, ISignInReturn } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { Test } from "@nestjs/testing";
import { Role } from "src/common/enums/role.enum";
import { User } from "src/user/entities/user.entity";
import { NotAcceptableException, UnauthorizedException } from "@nestjs/common";
import { SignUpDto } from "./dto/sign-up.dto";

describe("AuthService", () => {
    let authService: AuthService;
    let passwordServiceMock: PasswordService;
    let jwtServiceMock: JwtService;
    let userServiceMock: UserService;

    const mockedUser = {
        userId: 0,
        login: "login",
        role: Role.USER,
        password: "hashedPass"
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn()
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findByLogin: jest.fn(),
                        isUserExist: jest.fn()
                    }
                },
                {
                    provide: PasswordService,
                    useValue: {
                        verify: jest.fn(),
                        hash: jest.fn()
                    }
                }
            ]
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        jwtServiceMock = moduleRef.get<JwtService>(JwtService);
        passwordServiceMock = moduleRef.get<PasswordService>(PasswordService);
        userServiceMock = moduleRef.get<UserService>(UserService);

        jest.spyOn(userServiceMock, "findByLogin").mockResolvedValueOnce(mockedUser as User);
        jest.spyOn(jwtServiceMock, "signAsync").mockResolvedValueOnce("testToken");
    });

    describe("signIn", () => {
        it("should return token and id after successful sign-in", async () => {
            jest.spyOn(passwordServiceMock, "verify").mockResolvedValueOnce(true);

            const res: ISignInReturn = await authService.signIn("login", "testPass");

            expect(res).toEqual({ id: 0, accessToken: "testToken" });
        });

        it("should throw error if password is incorrect", async () => {
            jest.spyOn(passwordServiceMock, "verify").mockResolvedValueOnce(false);

            expect(authService.signIn("login", "testPass")).rejects.toThrow(UnauthorizedException);
        });
    });

    describe("signUp", () => {
        it("should check if this user exists before creating", async () => {
            const hashed = "hashedPass";

            jest.spyOn(passwordServiceMock, "hash").mockResolvedValueOnce(hashed);
            jest.spyOn(userServiceMock, "isUserExist").mockResolvedValueOnce(true);

            const mockedSignUpto: SignUpDto = {
                login: "login",
                address: "address",
                password: "password",
                phone: "phone",
                email: "email"
            };

            expect(authService.signUp(mockedSignUpto)).rejects.toThrow(NotAcceptableException);
        });
    });
});
