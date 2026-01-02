import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Link, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import AddPartner from "../../components/modal/AddPartner";
import TableHeader from "../../components/common/TableHeader";
import { useAsync } from "../../hooks";
import { getPartner, deletePartner } from "../../services/partner";
import ConfirmModal from "../../components/modal/ConfirmModal";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagonation";

interface PartnerInterface {
  // Define your interface properties here
}
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataRow {
  id: number;
  name: string;
  imagePath: string;
  partnerType: string;
  eventId: string;
  bannerUrl: string;
  createdAt: string;
}

const Partner: React.FC<PartnerInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [_, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<{ id: string | number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
console.log(error)
  const { run } = useAsync(getPartner);
  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search && { search, searchFields: "name,companyName" }),
      };

      const res: any = await run(params);

      if (!res || !res.data) {
        setData([]);
        setLoading(false);
        return;
      }
      console.log("res", res);

      // API response structure: { message: "...", data: { data: [...], meta: {...} } }
      const partners = Array.isArray(res.data.data) ? res.data.data : [];
      const meta = res.data.meta || {};
      
      // Update pagination info
      const totalPagesValue = Number(meta.totalPages) || 1;
      const totalValue = Number(meta.total) || partners.length;
      
      setTotalPages(totalPagesValue);
      setTotal(totalValue);

      const mapped: DataRow[] = partners.map((item: any) => {
        return {
          id: item._id || item.id,
          name: item.companyName || item.name || "",
          imagePath: item.imagePath || "",
          partnerType: item.partnerType || "",
          eventId: item.eventId || "",
          bannerUrl: item.companyUrl || item.bannerUrl || "",
          createdAt: item.createdAt || "",
        };
      });

      setData(mapped);
    } catch (error: any) {
      console.error("Error fetching partners:", error);
      setError(error?.message || "Failed to fetch partners");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleDeleteClick = (id: string | number, name: string) => {
    setPartnerToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partnerToDelete) return;

    setIsDeleting(true);
    try {
      await deletePartner(partnerToDelete.id);
      toast.success("Partner deleted successfully");
      setDeleteModalOpen(false);
      setPartnerToDelete(null);
      // Refresh the list
      fetchPartners();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete partner";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setPartnerToDelete(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCheckboxChange = (id: number) => {
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



  const columns: TableColumn<DataRow>[] = [
    {
      key: "bannerUrl",
      label: "Logo",
      render: (value) =>
        value ? (
          <img src={value} alt="Logo" className="w-10 h-10" />
        ) : (
          <span className="text-gray-400">No image</span>
        ),
    },
    {
      key: "name",
      label: "Company Name",
    },
    {
      key: "imagePath",
      label: "URL",
      render: (value) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          <Link />
        </a>
      ),
    },
    {
      key: "partnerType",
      label: "Partner Type",
    },
    {
      key: "createdAt",
      label: "Created At",
    },
    {
      key: "id",
      label: "Action",
      render: (_, row) => (
        <div className="flex items-center gap-3 text-[13px]">
          <Eye className="text-gray-600 cursor-pointer hover:text-gray-800" />
          <Trash2 
            className="text-red-600 cursor-pointer hover:text-red-700" 
            onClick={() => handleDeleteClick(row.id, row.name)}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <section>
        <TableHeader setIsModalShow={setIsModalShow} setSearch={setSearch} />
        <Table
          columns={columns}
          data={data}
          rowKey="id"
          selectedIds={selectedIds}
          onCheckboxChange={handleCheckboxChange}
        />
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              Showing {data.length} of {total} partners
              {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
            </div>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>
      <AddPartner isModalShow={isModalShow} setIsModalShow={setIsModalShow} />
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Partner"
        message={`Are you sure you want to delete the partner "${partnerToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default Partner;
