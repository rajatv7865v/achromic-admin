import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import TableHeader from "../../components/common/TableHeader";
import AddRegistration from "../../components/modal/AddRegisteration";
import { getRegistrations, deleteRegistration } from "../../services/registeration";
import { useAsync } from "../../hooks";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/modal/ConfirmModal";

interface RegisterationInterface {
  // Define your interface properties here
}
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface RegistrationItem {
  _id: string;
  name: string;
  description: string;
  industryPrice: number;
  industryStrikePrice: number;
  consultingPrice: number;
  consultingStrikePrice: number;
  benifits: string[];
  eventId: {
    _id: string;
    name: string;
    id: string;
  };
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Registeration: React.FC<RegisterationInterface> = () => {
  const [data, setData] = useState<RegistrationItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { run: fetchRegistrations, loading } = useAsync(getRegistrations, {
    onSuccess: (result: any) => {
      console.log("ck result", result?.data);
      if (result?.data) {
        setData(result.data);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to fetch registrations");
    },
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleDeleteClick = (id: string, name: string) => {
    setRegistrationToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!registrationToDelete) return;

    setIsDeleting(true);
    try {
      await deleteRegistration(registrationToDelete.id);
      toast.success("Registration deleted successfully");
      setDeleteModalOpen(false);
      setRegistrationToDelete(null);
      // Refresh the list
      fetchRegistrations();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete registration";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setRegistrationToDelete(null);
  };

  const handleCheckboxChange = (id: string) => {
    if (id === "-1") {
      setSelectedIds((prev) =>
        prev.length === data.length ? [] : data.map((d) => d._id)
      );
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const onRegistrationCreated = () => {
    // Refresh the data after creating a new registration
    fetchRegistrations();
  };
console.log("ddtdt",data)
  const columns: TableColumn<RegistrationItem>[] = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "industryPrice",
      label: "Industry Price",
    },
    {
      key: "industryStrikePrice",
      label: "Industry Strike Price",
    },
    {
      key: "consultingPrice",
      label: "Consulting Price",
    },
    {
      key: "consultingStrikePrice",
      label: "Consulting Strike Price",
    },
    {
      key: "eventId",
      label: "Event Name",
      render: (_, row) => row.eventId?.name || "N/A",
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs text-white ${
            value ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
    },
    {
      key: "_id",
      label: "Action",
      render: (_, row) => (
        <div className="flex items-center gap-3 text-[13px]">
          <Eye className="text-gray-600 cursor-pointer hover:text-gray-800" />
          <Trash2 
            className="text-red-600 cursor-pointer hover:text-red-700" 
            onClick={() => handleDeleteClick(row._id, row.name)}
          />
        </div>
      ),
    },
  ];
  console.log("DADA", data);
  return (
    <DashboardLayout>
      <section>
        <TableHeader setIsModalShow={setIsModalShow} />
        <Table
          columns={columns}
          data={data}
          rowKey="_id"
          selectedIds={selectedIds}
          onCheckboxChange={handleCheckboxChange}
          loading={loading}
        />
      </section>
      <AddRegistration
        isModalShow={isModalShow}
        setIsModalShow={setIsModalShow}
        onRegistrationCreated={onRegistrationCreated}
      />
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Registration"
        message={`Are you sure you want to delete the registration "${registrationToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default Registeration;
