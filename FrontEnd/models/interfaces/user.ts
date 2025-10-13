import { UserListItemDTO } from "../dtos/userDTO";

export interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItemDTO | null;
  editMode: boolean;
  onUpdated: (updatedUser: Partial<UserListItemDTO>) => void;
}