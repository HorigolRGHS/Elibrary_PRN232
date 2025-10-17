import { DocumentStaffResponseListDTO } from "@/models/dtos/documentDTO";
import { ColumnConfig } from "./types";
import Badge from "@/components/ui/badge";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const documentColumns: ColumnConfig<DocumentStaffResponseListDTO>[] = [
  {
    key: "title",
    label: "Title",
    sortable: true,
    filterable: true,
    width: "min-w-[200px]",
  },
  {
    key: "categoryName",
    label: "Category",
    sortable: true,
    filterable: true,
    width: "min-w-[150px]",
    render: (value) => (
      <Badge variant="outline" className="font-normal">
        {value as string}
      </Badge>
    ),
  },
  {
    key: "subjectName",
    label: "Subject",
    sortable: true,
    filterable: true,
    width: "min-w-[150px]",
    render: (value) => (
      <Badge variant="outline" className="font-normal">
        {value as string}
      </Badge>
    ),
  },
  {
    key: "viewCount",
    label: "Views",
    sortable: true,
    width: "w-24",
    render: (value) => (
      <span className="font-medium">{value as number}</span>
    ),
  },
  {
    key: "downloadCount",
    label: "Downloads",
    sortable: true,
    width: "w-24",
    render: (value) => (
      <span className="font-medium">{value as number}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    width: "w-32",
    render: (value) => {
      const status = value as string;
      const variant = status === "Accepted" ? "success" : status === "Pending" ? "outline" : "error";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    key: "createdDate",
    label: "Created Date",
    sortable: true,
    width: "min-w-[120px]",
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(value as string)}
      </span>
    ),
  },
  {
    key: "createdByFullname",
    label: "Created By",
    sortable: false,
    width: "min-w-[120px]",
  },
];

// Filterable columns configuration
export const filterableColumns = documentColumns
  .filter((col) => col.filterable)
  .map((col) => ({
    key: col.key as string,
    label: col.label,
  }));
