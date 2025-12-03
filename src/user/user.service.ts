import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
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
        login: string, hashed: string, address: string, phone: string, email: string
    ): Promise<User> {
        const user = this.userRepo.create({
            login,
            password: hashed,
            address,
            phone,
            email
        })

        await this.userRepo.save(user);

        return user;
    } 
}