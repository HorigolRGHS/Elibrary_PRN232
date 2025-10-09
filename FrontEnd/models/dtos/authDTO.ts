import z from "zod";

export interface LoginRequestDTO {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponseDTO {
  accessToken: string;
  expiresAtUtc: string; 
  user: UserInfoDTO;
  permissions: string[];
}

export interface UserInfoDTO {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  imageUrl?: string | null; 
}

export const registerSchema = z
  .object({
    email: z.email("Email is invalid"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        "Password must include at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(6, "Confirm password is invalid"),
    fullName: z.string().min(1, "Please enter your full name"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterDTO = z.infer<typeof registerSchema>;
