import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import TableHeader from "../../components/common/TableHeader";
import { useAsync } from "../../hooks";
import { getEnquiries, deleteEnquiry, type EnquiryItem } from "../../services/enquiry";
import ConfirmModal from "../../components/modal/ConfirmModal";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagonation";

interface EnquiryInterface {
  // Define your interface properties here
}
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

const Status = ({ status }: { status: string }) => {
  const color =
    status.toLowerCase() === "pending"
      ? "bg-yellow-500"
      : status.toLowerCase() === "resolved"
      ? "bg-green-600"
      : "bg-gray-500";

  return <span className={`h-3 w-3 ${color} rounded-full inline-block mr-2`} />;
};

const Enquiry: React.FC<EnquiryInterface> = () => {
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
  const [enquiryToDelete, setEnquiryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
console.log(error)
  const { run } = useAsync(getEnquiries);

  const fetchEnquiries = async () => {
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
      const enquiries = Array.isArray(res.data.data) ? res.data.data : [];
      const meta = res.data.meta || {};
      
      const totalPagesValue = Number(meta.totalPages) || 1;
      const totalValue = Number(meta.total) || enquiries.length;
      
      setTotalPages(totalPagesValue);
      setTotal(totalValue);
      
      const mapped: DataRow[] = enquiries.map((item: EnquiryItem) => ({
        id: item._id,
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        subject: item.subject || "",
        message: item.message || "",
        status: item.isActive ? "Active" : "Inactive",
        createdAt: item.createdAt || "",
      }));
      
      setData(mapped);
    } catch (error: any) {
      console.error("Error fetching enquiries:", error);
      setError(error?.message || "Failed to fetch enquiries");
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEnquiries();
  }, [page]);

  const handleDeleteClick = (id: string, name: string) => {
    setEnquiryToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!enquiryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEnquiry(enquiryToDelete.id);
      toast.success("Enquiry deleted successfully");
      setDeleteModalOpen(false);
      setEnquiryToDelete(null);
      // Refresh the list
      fetchEnquiries();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete enquiry";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setEnquiryToDelete(null);
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

  const columns: TableColumn<DataRow>[] = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "subject",
      label: "Subject",
    },
    {
      key: "message",
      label: "Message",
      render: (value) => (
        <span className="truncate max-w-xs">{value}</span>
      ),
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
            onClick={() => handleDeleteClick(row.id, row.name)}
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
            Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} enquiries
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
        title="Delete Enquiry"
        message={`Are you sure you want to delete the enquiry from "${enquiryToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default Enquiry;
