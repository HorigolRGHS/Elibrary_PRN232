import { DocumentStaffResponseListDTO } from "@/models/dtos/documentDTO";
import { ColumnConfig } from "./types";
import Badge from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Loader2, FileText } from "lucide-react";

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
      const status = (value as string) || "";
      const map: Record<string, { classes: string; Icon: any; label: string } > = {
        Accepted: {
          classes:
            "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
          Icon: CheckCircle2,
          label: "Accepted",
        },
        Pending: {
          classes:
            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
          Icon: Clock,
          label: "Pending",
        },
        Rejected: {
          classes:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
          Icon: XCircle,
          label: "Rejected",
        },
        Reviewing: {
          classes:
            "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
          Icon: Loader2,
          label: "Reviewing",
        },
        Draft: {
          classes:
            "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-900",
          Icon: FileText,
          label: "Draft",
        },
      };

      const { classes, Icon, label } =
        map[status] || map["Reviewing"]; // default styling

      return (
        <Badge
          variant="outline"
          className={`gap-1.5 px-2.5 py-0.5 font-medium ${classes}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Badge>
      );
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
