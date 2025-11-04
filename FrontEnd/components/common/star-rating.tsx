"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
  readonly?: boolean;
}

export function StarRating({
  value,
  onChange,
  interactive = false,
  readonly = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        const isFilled = rating <= value;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive || readonly}
            onClick={() => interactive && !readonly && onChange?.(rating)}
            onMouseEnter={() =>
              interactive && !readonly && onChange?.(rating)
            }
            className={`transition-all ${
              interactive && !readonly ? "cursor-pointer hover:scale-110" : ""
            }`}
            tabIndex={interactive && !readonly ? 0 : -1}
          >
            <Star
              className={`w-6 h-6 ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
