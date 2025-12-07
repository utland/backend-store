import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePassDto } from "./dto/change-pass.dto";
import { PasswordService } from "src/password/password.service";
import { Role } from "src/common/enums/role.enum";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        private readonly passService: PasswordService
    ) {}

    public async findByLogin(login: string): Promise<User> {
        const user = await this.userRepo.findOne({
            where: {
                login
            }
        });

        if (!user) throw new NotFoundException("User is not found");

        return user;
    }

    public async createUser(
        login: string,
        hashed: string,
        address: string,
        phone: string,
        email: string
    ): Promise<User> {
        const user = this.userRepo.create({
            login,
            password: hashed,
            address,
            phone,
            email
        });

        await this.userRepo.save(user);

        return user;
    }

    public async findAll(): Promise<User[]> {
        const users = await this.userRepo.find();
        return users;
    }

    public async findUser(userId: number): Promise<User> {
        const user = await this.userRepo.findOne({
            where: { userId },
            relations: ["cartProducts.product"]
        });

        if (!user) throw new NotFoundException("This user doesn't exist");

        return user;
    }

    public async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findUser(userId);

        return await this.userRepo.save(Object.assign(user, updateUserDto));
    }

    public async changeRole(userId: number, role: Role): Promise<void> {
        const user = await this.findUser(userId);

        if (role === user.role) {
            throw new BadRequestException("This user has already this role");
        }
        if (role === Role.ADMIN) {
            throw new BadRequestException("Setting admin role is forbidden");
        }
        if (user.role === Role.ADMIN) {
            throw new BadRequestException("Changing role of admin is unavailable");
        }

        user.role = role;
        await this.userRepo.save(user);
    }

    public async changePass(changePassDto: ChangePassDto): Promise<void> {
        const { oldPass, newPass, login } = changePassDto;

        const user = await this.findByLogin(login);

        const isPasswordCorrect = await this.passService.verify(oldPass, user.password);
        if (!isPasswordCorrect) throw new NotAcceptableException("Password is invalid");

        user.password = await this.passService.hash(newPass);

        await this.userRepo.save(user);
    }

    public async deleteUser(userId: number): Promise<void> {
        const user = await this.findUser(userId);

        await this.userRepo.softRemove(user);
    }
}
