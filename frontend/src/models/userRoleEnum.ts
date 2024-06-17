
export enum UserRole {
    ADMIN = 'admin',
    VIEWER = 'viewer',
    EDITOR = 'editor',
}

export class UserRoleUtil {

    static to_int = (role: UserRole|string): number => {
        if(typeof role === 'string'){
            role = UserRole[role as keyof typeof UserRole] as UserRole;
        }
        switch (role) {
            case UserRole.ADMIN:
                return 10;
            case UserRole.EDITOR:
                return 5;
            case UserRole.VIEWER:
                return 1;
            default:
                return -1;
        }
    }
}