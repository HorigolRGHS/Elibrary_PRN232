export type User = {
    UserId: number;
    FullName: string;
    Email: string;
    PasswordHash: string;
    ImageUrl: string;
    Role: 'Customer' | 'Admin';
    Active: boolean;
    CreatedDate: string;
    UpdatedDate: string;
    DeletedDate: string | null;
    DeletedBy: string | null;
}