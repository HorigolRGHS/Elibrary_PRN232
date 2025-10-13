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

export type JwtPayload = {
  sub?: string;
  name?: string; 
  email?: string;
  role?: string;
  image_url?: string; 
  exp?: number;
  iss?: string;
  aud?: string;
  raw?: Record<string, any>;
  [k: string]: any;
};