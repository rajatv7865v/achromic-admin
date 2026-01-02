import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number | string;
  totalPages: number | string;
  totalItems?: number;
  onPageChange: (page: number) => void;
  showPages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  showPages = 5,
}) => {
  // Ensure numbers
  const page = Number(currentPage);
  const total = Number(totalPages);

  if (total <= 1) return null;

  // Calculate page numbers to show
  const half = Math.floor(showPages / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(total, start + showPages - 1);

  if (end - start + 1 < showPages) {
    start = Math.max(1, end - showPages + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center gap-3 justify-between w-full">
      {totalItems !== undefined && (
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalItems)} of {totalItems} items
        </div>
      )}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`flex items-center py-2 px-3 rounded gap-2 ${
            page === 1
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-green text-white cursor-pointer"
          }`}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Page Numbers */}
        <ul className="flex items-center gap-2">
          {pages.map((p) => (
            <li key={p}>
            <button
              onClick={() => onPageChange(p)}
              className={`py-2 px-3 rounded cursor-pointer ${
                p === page ? "bg-yellow-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {p}
            </button>
          </li>
        ))}
        </ul>

        {/* Next Button */}
        <button
          disabled={page === total}
          onClick={() => onPageChange(page + 1)}
          className={`flex items-center py-2 px-3 rounded gap-2 ${
            page === total
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-green text-white cursor-pointer"
          }`}
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;