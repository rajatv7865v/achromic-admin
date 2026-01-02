import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Check, Eye, Linkedin, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import AddSpeaker from "../../components/modal/AddSpeaker";
import TableHeader, {
  type EventItem,
} from "../../components/common/TableHeader";
import { getSpeakers, deleteSpeaker } from "../../services/speaker";
import { useAsync } from "../../hooks";
import Pagination from "../../components/common/Pagonation";
import ConfirmModal from "../../components/modal/ConfirmModal";
import toast from "react-hot-toast";

interface SpeakerInterface {
  // Define your interface properties here
}
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface SpeakerItem {
  _id: string;
  name: string;
  designation: string;
  company: string;
  country: string;
  avatar: string;
  linkedin: string;
  eventId: {
    _id: string;
    name: string;
    id: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Speaker: React.FC<SpeakerInterface> = () => {
  const [data, setData] = useState<SpeakerItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speakerToEdit, setSpeakerToEdit] = useState<SpeakerItem | undefined>(
    undefined
  );
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (speaker: SpeakerItem) => {
    setSpeakerToEdit(speaker);
    setIsModalShow(true);
  };

  const handleCloseModal = () => {
    setIsModalShow(false);
    setSpeakerToEdit(undefined);
  };

  const columns: TableColumn<SpeakerItem>[] = [
    {
      key: "avatar",
      label: "Avatar",
      render: (value) =>
        value ? (
          <img
            src={value}
            alt="Speaker"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        ),
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "designation",
      label: "Designation",
    },
    {
      key: "company",
      label: "Company",
    },
    {
      key: "country",
      label: "Country",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      render: (value) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            <Linkedin />
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },

    {
      key: "createdAt",
      label: "Created At",
      render: (value) => {
        if (!value) return <span className="text-gray-400">-</span>;
        const date = new Date(value);
        if (isNaN(date.getTime()))
          return <span className="text-gray-400">-</span>;
        return date.toLocaleDateString();
      },
    },
    {
      key: "_id",
      label: "Action",
      render: (_, row) => (
        <div className="flex items-center gap-3 text-[13px]">
          <Eye
            className="text-gray-600 cursor-pointer hover:text-gray-800"
            onClick={() => handleEditClick(row)}
          />
          <Check className="text-green-600 cursor-pointer hover:text-green-700" />
          <Trash2 
            className="text-red-600 cursor-pointer hover:text-red-700" 
            onClick={() => handleDeleteClick(row._id, row.name)}
          />
        </div>
      ),
    },
  ];



  const fetchSpeakers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters for pagination
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(selectedEvent && { eventId: selectedEvent }), // Include selected event if available
      };
        
      const res: any = await getSpeakers(params);
      console.log("res", res);
      if (!res) {
        setData([]);
        setLoading(false);
        return;
      }
  
      // Map API response to SpeakerItem shape
      const speakers = Array.isArray(res?.data?.data?.data)
        ? res.data.data.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
          
      // Extract pagination info
      const meta = res?.data?.data?.meta || {};
      const totalPagesValue = Number(meta.totalPages) || 1;
      const totalValue = Number(meta.total) || speakers.length;
        
      setTotalPages(totalPagesValue);
      setTotal(totalValue);
  
      console.log("speakers", speakers);
  
      const mapped: SpeakerItem[] = speakers.map((item: any) => ({
        _id: item._id || item.id,
        name: item?.name || "",
        designation: item?.designation || "",
        company: item?.company || item?.organization || "",
        country: item?.country || "",
        avatar: item?.avatar || "",
        linkedin: item?.linkedin || "",
        eventId: item?.eventId ||
          item?.event || {
            _id: "",
            name: "",
            id: "",
          },
        createdAt: item?.createdAt || "",
        updatedAt: item?.updatedAt || "",
        __v: item?.__v || 0,
      }));
      setData(mapped);
    } catch (error: any) {
      console.error("Error fetching speakers:", error);
      setError(error?.message || "Failed to fetch speakers");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, [page, selectedEvent]);

  const handleEventSelect = (eventId: any) => {
    setSelectedEvent(eventId?._id);
    // Reset to first page when event changes
    setPage(1);
  };

  console.log("Selected event ID:", selectedEvent);

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

  const handleDeleteClick = (id: string, name: string) => {
    setSpeakerToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!speakerToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSpeaker(speakerToDelete.id);
      toast.success("Speaker deleted successfully");
      setDeleteModalOpen(false);
      setSpeakerToDelete(null);
      // Refresh the list
      fetchSpeakers();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete speaker";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSpeakerToDelete(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <DashboardLayout>
      <section className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Speakers
          </h1>
          <p className="text-gray-600">Manage event speakers</p>
        </div>
        <TableHeader
          setIsModalShow={setIsModalShow}
          onEventSelect={handleEventSelect}
        />
        <div className="mt-4">
          {loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-600">Loading speakers...</div>
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
                  <p className="mb-2">No speakers found.</p>
                  <p>Click "Add New" to create your first speaker.</p>
                </div>
              ) : (
                <>
                  <Table
                    columns={columns}
                    data={data}
                    rowKey="_id"
                    selectedIds={selectedIds}
                    onCheckboxChange={handleCheckboxChange}
                  />
                  <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        Showing {data.length} of {total} speakers
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
      <AddSpeaker
        isModalShow={isModalShow}
        setIsModalShow={handleCloseModal}
        onSpeakerCreated={fetchSpeakers}
        speakerToEdit={speakerToEdit}
        onSpeakerUpdated={fetchSpeakers}
      />
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Speaker"
        message={`Are you sure you want to delete the speaker "${speakerToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default Speaker;
