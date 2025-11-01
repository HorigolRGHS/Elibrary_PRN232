"use client";
import { FC } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { PaginationBarProps } from "@/models/interfaces/common";

export const PaginationBar: FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalCount = 0,
  loading = false,
  onChange,
}) => {
  const pages: Array<number | string> = [];
  const total = totalPages;
  const cur = currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    const left = Math.max(2, cur - 1);
    const right = Math.min(total - 1, cur + 1);
    if (left > 2) pages.push("left-ellipsis");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("right-ellipsis");
    pages.push(total);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">Total: {totalCount}</div>

      <Pagination aria-label="Pagination">
        <PaginationContent>
          <PaginationPrevious
            onClick={() => onChange(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1 || loading}
            className={`${
              currentPage === 1 || loading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          />

          {pages.map((p, idx) => {
            if (typeof p === "string") {
              return (
                <li key={p + idx}>
                  <PaginationEllipsis />
                </li>
              );
            }

            return (
              <li key={p}>
                <PaginationLink
                  isActive={p === currentPage}
                  onClick={() => !loading && onChange(p)}
                >
                  {p}
                </PaginationLink>
              </li>
            );
          })}

          <PaginationNext
            onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages || loading}
            className={`${
              currentPage === totalPages || loading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          />
        </PaginationContent>
      </Pagination>
    </div>
  );
};
