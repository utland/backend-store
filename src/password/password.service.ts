import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

Injectable();
export class PasswordService {
    private saltRounds = 10;

    public async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    public async verify(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        if (password === hashedPassword) return true;
        return await bcrypt.compare(password, hashedPassword);
    }
}
