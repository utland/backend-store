import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PasswordService } from "../password/password.service";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { IPayload } from "src/common/interfaces/request.i";
import { UserService } from "src/user/user.service";

export interface ISignInReturn {
    accessToken: string;
    id: number;
}

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private passService: PasswordService
    ) {}

    public async signIn(login: string, password: string): Promise<ISignInReturn> {
        const user = await this.userService.findByLogin(login);

        const isPasswordCorrect = await this.passService.verify(password, user.password);
        if (!isPasswordCorrect) throw new UnauthorizedException("Password is incorrect");

        const payload: IPayload = { id: user.userId, login, role: user.role };

        const token = await this.jwtService.signAsync(payload, {
            secret: process.env.SECRET
        });
        return {
            accessToken: token,
            id: payload.id
        };
    }

    public async signUp(signUpDto: SignUpDto): Promise<void> {
        const { login, password, address, email, phone } = signUpDto;

        const hashed = await this.passService.hash(password);

        const isExisted = await this.userService.findByLogin(login);
        if (isExisted) throw new NotAcceptableException("This login exists already");

        await this.userService.createUser(login, hashed, address, phone, email);
    }
}
