import {UserRole} from "./userRoleEnum";

export type UserType = {
    id: number;
    username: string;
    email: string;
    last_login: string;
    created_at: string;
    updated_at: string;
    disabled_at: string|null;
    role: UserRole;
}