import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import AddCategory from "../../components/modal/AddCategory";
import ConfirmModal from "../../components/modal/ConfirmModal";
import TableHeader from "../../components/common/TableHeader";
import Pagination from "../../components/common/Pagonation";
import { getCategories, deleteCategory } from "../../services/category";
import { useAsync } from "../../hooks";
import toast from "react-hot-toast";

interface CategoryInterface {
  // Define your interface properties here
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataRow {
  id: string | number;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

const Category: React.FC<CategoryInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<{ id: string | number; name: string; isActive: boolean } | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string | number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { run } = useAsync(getCategories);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search && { search, searchFields: "name" }),
      };
      
      const res: any = await run(params);
      
      if (!res || !res.data) {
        setData([]);
        setLoading(false);
        return;
      }
      
      // API response structure: { data: { data: [...], meta: {...} } }
      const categories = Array.isArray(res.data.data) ? res.data.data : [];
      const meta = res.data.meta || {};
      
      // Update pagination info
      const totalPagesValue = Number(meta.totalPages) || 1;
      const totalValue = Number(meta.total) || categories.length;
      
      setTotalPages(totalPagesValue);
      setTotal(totalValue);
      
      const mapped: DataRow[] = categories.map((item: any) => ({
        id: item._id || item.id,
        name: item.name || "",
        isActive: item.isActive ?? true,
        createdAt: item.createdAt || "",
      }));
      
      setData(mapped);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setError(error?.message || "Failed to fetch categories");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleCheckboxChange = (id: string | number) => {
    if (id === -1) {
      setSelectedIds((prev) =>
        prev.length === data.length ? [] : data.map((d) => d.id)
      );
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleEditClick = (category: DataRow) => {
    setCategoryToEdit(category);
    setIsModalShow(true);
  };

  const handleDeleteClick = (id: string | number, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalShow(false);
    setCategoryToEdit(undefined); // Reset category to edit when modal closes
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Category deleted successfully");
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      // Refresh the list
      fetchCategories();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete category";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const columns: TableColumn<DataRow>[] = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value) => {
        if (!value) return <span className="text-gray-400">-</span>;
        const date = new Date(value);
        if (isNaN(date.getTime())) return <span className="text-gray-400">-</span>;
        return date.toLocaleDateString();
      },
    },
    {
      key: "id",
      label: "Action",
      render: (_, row) => (
        <div className='flex items-center gap-3 text-[13px]'>
          <Eye 
            className='text-gray-600 cursor-pointer hover:text-gray-800' 
            onClick={() => handleEditClick(row)}
          />
          <Trash2 
            className='text-red-600 cursor-pointer hover:text-red-700' 
            onClick={() => handleDeleteClick(row.id, row.name)}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <section className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Categories</h1>
          <p className="text-gray-600">Manage your event categories</p>
        </div>
        <TableHeader setIsModalShow={setIsModalShow} setSearch={handleSearchChange} />
        <div className="mt-4">
          {loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-600">Loading categories...</div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
              {error}
            </div>
          )}
          {!loading && !error && (
            <>
              {data.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
                  <p className="mb-2">No categories found.</p>
                  <p>Click "Add New" to create your first category.</p>
                </div>
              ) : (
                <>
                  <Table
                    columns={columns}
                    data={data}
                    rowKey='id'
                    selectedIds={selectedIds}
                    onCheckboxChange={handleCheckboxChange}
                  />
                  <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        Showing {data.length} of {total} categories
                        {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                      </div>
                    </div>
                    {/* {totalPages > 1 && ( */}
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    {/* )} */}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
      <AddCategory 
        isModalShow={isModalShow} 
        setIsModalShow={handleCloseModal}
        onCategoryCreated={fetchCategories}
        categoryToEdit={categoryToEdit}
        onCategoryUpdated={fetchCategories}
      />
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default Category;







