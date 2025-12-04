import { Body, Controller, Post } from "@nestjs/common";
import { AuthService, ISignInReturn } from "./auth.service";
import { Public } from "src/common/decorators/public.decorator";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post("login")
    public async signIn(@Body() signInDto: SignInDto): Promise<ISignInReturn> {
        return await this.authService.signIn(
            signInDto.login,
            signInDto.password,
        );
    }
    @Public()
    @Post("/register")
    public async signUp(@Body() signUpDto: SignUpDto): Promise<void> {
        return await this.authService.signUp(signUpDto);
    }
}
