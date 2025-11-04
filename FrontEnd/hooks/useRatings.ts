"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RatingService } from "@/services/rating/Rating";
import { RatingSelect } from "@/models/dtos/ratingDTO";
import { useCurrentUserId } from "./useCurrentUserId";

const DEFAULT_PAGE_SIZE = 10;

export const useRatings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = useCurrentUserId();

  const [ratings, setRatings] = useState<RatingSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = DEFAULT_PAGE_SIZE;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await RatingService.getAll();
        
        let filtered = data || [];
        if (searchTerm) {
          filtered = filtered.filter(
            (r) =>
              r.DocumentId.toString().includes(searchTerm) ||
              r.StarRating.toString().includes(searchTerm)
          );
        }

        setTotalCount(filtered.length);
        const start = (page - 1) * pageSize;
        setRatings(filtered.slice(start, start + pageSize));
      } catch (err: any) {
        setError(err?.message || "Failed to load ratings");
        setRatings([]);
      } finally {
        setLoading(false);
      }
    };

    loadRatings();
  }, [page, searchTerm]);

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}`);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    router.push("?page=1");
  };

  return {
    ratings,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    searchTerm,
    onPageChange: handlePageChange,
    onSearch: handleSearch,
  };
};
