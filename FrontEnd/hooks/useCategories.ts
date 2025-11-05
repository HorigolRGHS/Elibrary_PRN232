import { useState, useEffect } from "react";
import { CategorySelect } from "@/models/dtos/categoryDTO";
import { CategoryService } from "@/services/category/Category";

export function useCategories() {
  const [categories, setCategories] = useState<CategorySelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CategoryService.getSelectCategories();
        setCategories(data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch categories";
        setError(errorMessage);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
