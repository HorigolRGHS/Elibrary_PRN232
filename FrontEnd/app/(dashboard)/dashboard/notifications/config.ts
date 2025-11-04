import { FilterState } from "./types";

export const filterableColumns: { key: keyof FilterState; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
];
