import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import TableHeader from "../../components/common/TableHeader";
import { useAsync } from "../../hooks";
import { getSubscribers, deleteSubscriber, type SubscriberItem } from "../../services/subscribe";
import ConfirmModal from "../../components/modal/ConfirmModal";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagonation";

interface SubscribeInterface {
  // Define your interface properties here
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataRow {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

const Subscribe: React.FC<SubscribeInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [_, setIsModalShow] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { run } = useAsync(getSubscribers);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      
      const res: any = await run(params);
      
      if (!res || !res.data) {
        setData([]);
        setLoading(false);
        return;
      }
      
      // Extract pagination info
      const subscribers = Array.isArray(res.data.data) ? res.data.data : [];
      const meta = res.data.meta || {};
      
      const totalPagesValue = Number(meta.totalPages) || 1;
      const totalValue = Number(meta.total) || subscribers.length;
      
      setTotalPages(totalPagesValue);
      setTotal(totalValue);
      
      const mapped: DataRow[] = subscribers.map((item: SubscriberItem) => ({
        id: item._id,
        email: item.email || "",
        status: item.isActive ? "Active" : "Inactive",
        createdAt: item.createdAt || "",
      }));
      
      setData(mapped);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      setError(error?.message || "Failed to fetch subscribers");
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSubscribers();
  }, [page]);

  const handleDeleteClick = (id: string, email: string) => {
    setSubscriberToDelete({ id, email });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subscriberToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSubscriber(subscriberToDelete.id);
      toast.success("Subscriber deleted successfully");
      setDeleteModalOpen(false);
      setSubscriberToDelete(null);
      // Refresh the list
      fetchSubscribers();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete subscriber";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSubscriberToDelete(null);
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCheckboxChange = (id: string) => {
    if (id === "-1") {
      setSelectedIds((prev) =>
        prev.length === data.length ? [] : data.map((d) => d.id)
      );
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const Status = ({ status }: { status: string }) => {
    const color =
      status.toLowerCase() === "active"
        ? "bg-green-500"
        : status.toLowerCase() === "inactive"
        ? "bg-red-500"
        : "bg-gray-500";

    return <span className={`h-3 w-3 ${color} rounded-full inline-block mr-2`} />;
  };

  const columns: TableColumn<DataRow>[] = [
    {
      key: "email",
      label: "Email",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className='flex items-center'>
          <Status status={value} />
          {value}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
    },
    {
      key: "id",
      label: "Action",
      render: (_, row) => (
        <div className='flex items-center gap-3 text-[13px]'>
          <Eye className='text-gray-600 cursor-pointer hover:text-gray-800' />
          <Trash2 
            className='text-red-600 cursor-pointer hover:text-red-700' 
            onClick={() => handleDeleteClick(row.id, row.email)}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <section>
        <TableHeader setIsModalShow={setIsModalShow} />
        <Table
          columns={columns}
          data={data}
          rowKey='id'
          selectedIds={selectedIds}
          onCheckboxChange={handleCheckboxChange}
          loading={loading}
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} subscribers
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Subscriber"
        message={`Are you sure you want to delete the subscriber "${subscriberToDelete?.email}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default Subscribe;