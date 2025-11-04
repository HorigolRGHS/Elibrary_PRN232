import { SubjectResponseDTO } from "@/models/dtos/subjectDTO";
import { ColumnConfig } from "./types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const subjectColumns: ColumnConfig<SubjectResponseDTO>[] = [
  {
    key: "subjectId",
    label: "ID",
    sortable: true,
    width: "w-16",
  },
  {
    key: "imageUrl",
    label: "Image",
    width: "w-24",
    render: (value, row) => (
      <Dialog>
        <DialogTrigger asChild>
          <img
            src={row.imageUrl || "/placeholder-image.jpg"}
            alt={row.subjectName}
            className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition"
          />
        </DialogTrigger>
        <DialogContent className="flex justify-center items-center">
          <img
            src={row.imageUrl || "/placeholder-image.jpg"}
            alt={row.subjectName}
            className="max-h-[80vh] object-contain rounded-lg"
          />
        </DialogContent>
      </Dialog>
    ),
  },
  {
    key: "subjectName",
    label: "Subject Name",
    sortable: true,
    filterable: true,
    width: "min-w-[200px]",
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
    key: "updatedDate",
    label: "Updated Date",
    sortable: false,
    width: "min-w-[120px]",
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(value as string)}
      </span>
    ),
  },
];

export const filterableColumns = subjectColumns
  .filter((col) => col.filterable)
  .map((col) => ({
    key: col.key as string,
    label: col.label,
  }));
