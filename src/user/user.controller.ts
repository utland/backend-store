import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
    HttpStatus,
    ParseIntPipe
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { ChangePassDto } from "./dto/change-pass.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { CurrentUserId } from "src/common/decorators/current-user-id.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { ChangeRoleDto } from "./dto/change-role.dto";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @Roles(Role.ADMIN, Role.MODERATOR)
    public async findAll(): Promise<User[]> {
        return await this.userService.findAll();
    }

    @Get("/:id")
    public async findById(@Param("id", ParseIntPipe) userId: number): Promise<User> {
        return await this.userService.findUser(userId);
    }

    @Public()
    @Patch("/pass")
    public async changePassword(@Body() changePassDto: ChangePassDto): Promise<void> {
        await this.userService.changePass(changePassDto);
    }

    @Patch()
    public async update(@Body() updateUserDto: UpdateUserDto, @CurrentUserId() userId: number): Promise<User> {
        return await this.userService.updateUser(userId, updateUserDto);
    }

    @Roles(Role.ADMIN)
    @Delete("/:id")
    public async delete(@Param("id", ParseIntPipe) userId: number): Promise<void> {
        await this.userService.deleteUser(userId);
    }

    @Roles(Role.ADMIN)
    @Patch("/role")
    public async changeRole(
        @Param("id", ParseIntPipe) userId: number,
        @Body() changeRoleDto: ChangeRoleDto
    ): Promise<void> {
        await this.userService.changeRole(userId, changeRoleDto.role);
    }
}
