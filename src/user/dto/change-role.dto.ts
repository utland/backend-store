import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "src/common/enums/role.enum";

export class ChangeRoleDto {
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
}