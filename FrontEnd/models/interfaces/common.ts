interface SearchBarProps {
  value: string;
  loading?: boolean;
  placeholder?: string;
  onChange: (val: string) => void;
  onSearch: () => void;
}


interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  loading?: boolean;
  onChange: (page: number) => void;
}


interface ConfirmDeleteDialogProps {
  name: string;
  onConfirm: () => Promise<void> | void;
  trigger: React.ReactNode;
}