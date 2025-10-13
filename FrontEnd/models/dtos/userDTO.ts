export interface UserInfoDTO {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  imageUrl?: string | null; 
}

export interface UpdateUserRequestDTO {
  fullName: string;
  email: string;
  imageUrl?: string;
}

export interface UserListItemDTO {
  userId: number;
  fullName: string;
  email: string;
  imageUrl?: string;
  role: string;
  active: boolean;
  createdDate: string;
  updatedDate: string | null;
  deletedDate?: string | null;
}

export interface UpdateUserAccountDTO {
  userId: number;
  fullName: string;
  active: boolean;
}

