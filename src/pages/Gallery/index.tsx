import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import TableHeader from "../../components/common/TableHeader";
import AddGallery from "../../components/modal/AddGallery";
import { getGalleries, deleteGallery } from "../../services/gallery";
import { useAsync } from "../../hooks";
import toast from "react-hot-toast";
import Pagonation from "../../components/common/Pagonation";
import ConfirmModal from "../../components/modal/ConfirmModal";

interface GalleryInterface {
  // Define your interface properties here
}
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface GalleryItem {
  _id: string;
  title: string;
  filePath: string | string[];
  event: {
    _id: string; // Event ID
    name: string;
  };
}



const Gallery: React.FC<GalleryInterface> = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<GalleryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<{ id: string; title: string } | null>(null);

  // Extract the event ID from the row to navigate to event-specific galleries
  const getEventIdFromRow = (row: GalleryItem) => {
    // Return the actual event ID from the gallery item
    return row.event._id; // Using the event ID from the event object
  };

  const { run: fetchGalleries, loading: fetching } = useAsync(getGalleries, {
    onSuccess: (result: any) => {
      if (result?.data) {
        setData(result.data.data);
        setTotalPages(result.data.meta.totalPages);
        setTotalItems(result.data.meta.total);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to fetch galleries");
    },
  });

  const { run: deleteGalleryApi, loading: deleting } = useAsync(deleteGallery, {
    onSuccess: (result: any) => {
      toast.success("Gallery deleted successfully");
      setDeleteModalOpen(false);
      setGalleryToDelete(null);
      fetchGalleryData(); // Refresh the data
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete gallery");
    },
  });

  const handleDelete = (id: string, title: string) => {
    setGalleryToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (galleryToDelete) {
      deleteGalleryApi(galleryToDelete.id);
    }
  };

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      await fetchGalleries({
        page,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search,
        eventId: "694e150db72a7f3e44d05bdf" // Default event ID as per requirement
      });
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search,page]);

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

  const columns: TableColumn<GalleryItem>[] = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "event",
      label: "Event Name",
      render: (value, row) => row.event?.name || "N/A",
    },
    {
      key: "filePath",
      label: "File Count",
      render: (value) => (Array.isArray(value) ? value.length : 1),
    },
    {
      key: "_id",
      label: "Action",
      render: (value, row) => (
        <div className='flex items-center gap-3 text-[13px]'>
          <Eye 
            className='text-gray-600 cursor-pointer' 
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              navigate(`/gallery/${row.event._id}`); // Navigate to gallery detail using event ID
            }}
          />
          <Trash2 
            className='text-red-600 cursor-pointer' 
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              handleDelete(row._id, row.title);
            }}
          />
        </div>
      ),
    },
  ];

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <DashboardLayout>
      <section>
        <TableHeader setIsModalShow={setIsModalShow} setSearch={setSearch} />
        <Table
          columns={columns}
          data={data}
          rowKey='_id'
          selectedIds={selectedIds}
          onCheckboxChange={handleCheckboxChange}
          loading={loading}
          onRowClick={(row) => {
            // Navigate to gallery detail page for this specific event
            const eventId = getEventIdFromRow(row);
            navigate(`/gallery/${eventId}`);
          }}
        />
        <div className="mt-4 flex justify-end">
          <Pagonation
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
      <AddGallery isModalShow={isModalShow} setIsModalShow={setIsModalShow}/>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setGalleryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Gallery"
        message={`Are you sure you want to delete gallery "${galleryToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
      />
    </DashboardLayout>
  );
};

export default Gallery;
