import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AddAgenda from "../../components/modal/AddAgenda";
import TableHeader from "../../components/common/TableHeader";
import Pagination from "../../components/common/Pagonation";
import { getAgendas } from "../../services/agenda";
import { useAsync } from "../../hooks";
import toast from "react-hot-toast";

interface AgendaInterface {
  // Define your interface properties here
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataRow {
  id: string | number;
  title: string;
  description: string;
  date: string;
  venue: string;
  location: string;
  eventId: string;
  sessionsCount: number;
  isActive: boolean;
  createdAt?: string;
}

const Status = ({ status }: { status: boolean }) => {
  const color = status === false ? "bg-red-500" : "bg-green-600";
  return <span className={`h-3 w-3 ${color} rounded-full inline-block mr-2`} />;
};

const Agenda: React.FC<AgendaInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
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
  const [agendaToDelete, setAgendaToDelete] = useState<{ id: string | number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { run } = useAsync(getAgendas);

  const fetchAgendas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search && { search, searchFields: "title,description" }),
      };
      
      const res: any = await run(params);
      
      if (!res || !res.data) {
        setData([]);
        setLoading(false);
        return;
      }
      
      // API response structure: { data: { data: [...], meta: {...} } }
      const agendas = Array.isArray(res.data.data) ? res.data.data : [];
      const meta = res.data.meta || {};
      
      // Update pagination info
      const totalPagesValue = Number(meta.totalPages) || 1;
      const totalValue = Number(meta.total) || agendas.length;
      
      setTotalPages(totalPagesValue);
      setTotal(totalValue);
      
      const mapped: DataRow[] = agendas.map((item: any) => ({
        id: item._id || item.id,
        title: item.title || "",
        description: item.description || "",
        date: item.date || "",
        venue: item.venue || "",
        location: item.location || "",
        eventId: item.eventId || "",
        sessionsCount: Array.isArray(item.sessions) ? item.sessions.length : 0,
        isActive: item.isActive ?? true,
        createdAt: item.createdAt || "",
      }));
      
      setData(mapped);
    } catch (error: any) {
      console.error("Error fetching agendas:", error);
      setError(error?.message || "Failed to fetch agendas");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCheckboxChange = (id: string | number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDeleteClick = (id: string | number, title: string) => {
    setAgendaToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agendaToDelete) return;
    setIsDeleting(true);
    try {
      // TODO: Implement deleteAgenda service function
      // await deleteAgenda(agendaToDelete.id);
      toast.success(`Agenda "${agendaToDelete.title}" deleted successfully!`);
      fetchAgendas();
      setDeleteModalOpen(false);
      setAgendaToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete agenda");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setAgendaToDelete(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const columns: TableColumn<DataRow>[] = [
    { key: "title", label: "Title" },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-2">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value) => formatDate(value),
    },
    { key: "venue", label: "Venue" },
    { key: "location", label: "Location" },
    {
      key: "sessionsCount",
      label: "Sessions",
      render: (value) => (
        <span className="text-sm text-gray-600">{value || 0}</span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span className="flex items-center">
          <Status status={value} />
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
    {
      key: "id",
      label: "Action",
      render: (_, row) => (
        <div className="flex items-center gap-3 text-[13px]">
          <Eye className="text-gray-600 cursor-pointer hover:text-gray-800" />
          <Trash2
            className="text-red-600 cursor-pointer hover:text-red-700"
            onClick={() => handleDeleteClick(row.id, row.title)}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <section className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Agendas</h1>
          <p className="text-gray-600">Manage your event agendas</p>
        </div>
        <TableHeader setIsModalShow={setIsModalShow} setSearch={handleSearchChange} />
        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading agendas...</div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <>
              {data.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No agendas found.</p>
                </div>
              ) : (
                <>
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
                        Showing {data.length} of {total} agendas
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
                </>
              )}
            </>
          )}
        </div>
      </section>
      <AddAgenda
        isModalShow={isModalShow}
        setIsModalShow={setIsModalShow}
        onAgendaCreated={fetchAgendas}
      />
      {agendaToDelete && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Agenda"
          message={`Are you sure you want to delete the agenda "${agendaToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonColor="bg-red-600"
          isLoading={isDeleting}
        />
      )}
    </DashboardLayout>
  );
};

export default Agenda;

