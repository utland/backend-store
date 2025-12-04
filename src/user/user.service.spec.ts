import { Repository } from "typeorm";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test } from "@nestjs/testing";
import { Role } from "src/common/enums/role.enum";
import { BadRequestException, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { PasswordService } from "src/password/password.service";
import { ChangePassDto } from "./dto/change-pass.dto";

describe("UserService", () => {
    let userService: UserService;
    let userRepo: Repository<User>;
    let passwordService: PasswordService;

    const testUser = {
        userId: 0,
        login: "login",
        password: "password",
        address: "address",
        phone: "phone",
        email: "email",
        role: Role.USER,
    }

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: PasswordService,
                    useValue: {
                        verify: jest.fn(),
                        hash: jest.fn()
                    }
                },
                UserService
            ]
        }).compile();

        userService = moduleRef.get<UserService>(UserService);
        userRepo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
        passwordService = moduleRef.get<PasswordService>(PasswordService);
    })

    describe("findBy", () => {
        it("should throw exception if user is not found (by login)", async () => {
            jest.spyOn(userRepo, "findOne").mockResolvedValueOnce(null);
    
            await expect(userService.findByLogin("login"))
                .rejects
                .toThrow(NotFoundException);
        })
    
        it("should throw exception if user is not found (by id)", async () => {
            jest.spyOn(userRepo, "findOne").mockResolvedValueOnce(null);
    
            await expect(userService.findUser(0))
                .rejects
                .toThrow(NotFoundException);
        })
    
        it("should throw exception if user is not found (by id)", async () => {
            jest.spyOn(userRepo, "findOne").mockResolvedValueOnce(null);
    
            await expect(userService.findUser(0))
                .rejects
                .toThrow(NotFoundException);
        })
    })


    describe("changeRole", () => {
        it ("should throw exception if user's role is the same", async () => {
            jest.spyOn(userRepo, "findOne").mockResolvedValueOnce(testUser as User);

            await expect(userService.changeRole(0, Role.USER))
                .rejects
                .toThrow(BadRequestException)
        })

        it ("should throw exception if setting role is ADMIN", async () => {
            jest.spyOn(userRepo, "findOne").mockResolvedValueOnce(testUser as User);

            await expect(userService.changeRole(0, Role.ADMIN))
                .rejects
                .toThrow(BadRequestException)
        })

        it ("should throw exception if changing role of ADMIN", async () => {
            jest.spyOn(userRepo, "findOne").mockResolvedValueOnce(
                {...testUser, role: Role.ADMIN} as User
            );

            await expect(userService.changeRole(0, Role.MODERATOR))
                .rejects
                .toThrow(BadRequestException)
        })

        it ("should execute successfully if everything is OK", async () => {
            jest.spyOn(userRepo, "findOne").mockResolvedValueOnce({
                ...testUser, role: Role.USER
            } as User);

            const saveSpy = jest.spyOn(userRepo, "save").mockResolvedValueOnce({
                ...testUser, role: Role.MODERATOR
            } as User);

            await userService.changeRole(0, Role.MODERATOR);

            expect(saveSpy).toHaveBeenCalled()
        })
    })

    describe("changePass", () => {
        const changePassDto: ChangePassDto = { 
            oldPass: "old", 
            newPass: "new", 
            login: "login"
        }

        beforeEach(() => {
            jest.spyOn(userRepo, "findOne").mockResolvedValue({ userId: 1, password: 'old_hash' } as User);
        })

        it("should throw exception if password is incorrect", async () => {
            jest.spyOn(passwordService, "verify").mockResolvedValueOnce(false);
    
    
            await expect(userService.changePass(changePassDto))
                .rejects
                .toThrow(NotAcceptableException)
        })

        it("it should change password if everything is ok", async () => {
            jest.spyOn(passwordService, "verify").mockResolvedValueOnce(true);
            const saveSpy = jest.spyOn(passwordService, "hash").mockResolvedValue("new_hashed_pass");

            await userService.changePass(changePassDto);

            expect(saveSpy).toHaveBeenCalled();
        })

    })

})
