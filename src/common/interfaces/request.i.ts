import { Role } from "../enums/role.enum";

export interface IRequest {
    user: IPayload;
}

export interface IPayload {
    id: number;
    login: string;
    role: Role;
}
