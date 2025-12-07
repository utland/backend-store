import { OmitType, PartialType } from "@nestjs/mapped-types";
import { SignUpDto } from "src/auth/dto/sign-up.dto";

export class UpdateUserDto extends PartialType(OmitType(SignUpDto, ["login", "password"] as const)) {}
