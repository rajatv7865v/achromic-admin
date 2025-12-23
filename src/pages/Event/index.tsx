import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import AddEvent from "../../components/modal/AddEvent";
import TableHeader from "../../components/common/TableHeader";
import Pagination from "../../components/common/Pagonation";
import { useAsync } from "../../hooks";
import { getEvents } from "../../services/event";

interface EventInterface {
  // Define your interface properties here
}
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataRow {
  id: string | number;
  bannerUrl: string;
  category: string;
  eventDate: string;
  location: string;
  venue: string;
  name: string;
  description: string;
  time: string;
  isActive: boolean;
  createdAt: string;
}
const Status = ({ status }: { status: boolean }) => {
  const color = status === false ? "bg-red-500" : "bg-green-600";

  return <span className={`h-3 w-3 ${color} rounded-full inline-block mr-2`} />;
};



const Event: React.FC<EventInterface> = () => {
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

  const { run } = useAsync(getEvents);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        eventType: "UPCOMING",
        ...(search && { search, searchFields: "name,description" }),
      };
      
      const res: any = await run(params);
      
      if (!res || !res.data) {
        setData([]);
        setLoading(false);
        return;
      }
      console.log("res", res);
      
      // API response structure: { message: "...", data: [...] }
      const events = Array.isArray(res.data) ? res.data : [];
      
      const mapped: DataRow[] = events.map((item: any) => {
        // Extract category names from categories array
        const categoryNames = Array.isArray(item.categories)
          ? item.categories.map((cat: any) => cat.name || cat).join(", ")
          : "";
        
        // Format date range
        const eventDate = item.dateFrom && item.dateTo
          ? `${item.dateFrom} to ${item.dateTo}`
          : item.dateFrom || item.dateTo || "";
        
        // Format time range
        const time = item.timeFrom && item.timeTo
          ? `${item.timeFrom} - ${item.timeTo}`
          : item.timeFrom || item.timeTo || "";

        return {
          id: item._id || item.id,
          bannerUrl: item.bannerUrl || "",
          category: categoryNames || "",
          eventDate: eventDate,
          location: item.location || "",
          venue: item.venue || "",
          name: item.name || "",
          description: item.description || "",
          time: time,
          isActive: item.isActive ?? true,
          createdAt: item.createdAt || "",
        };
      });
      
      setData(mapped);
      // Note: API response doesn't include pagination meta, so we'll estimate
      setTotal(events.length);
      setTotalPages(Math.ceil(events.length / limit) || 1);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setError(error?.message || "Failed to fetch events");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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

  const handleToggleStatus = (id: string | number) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const Toggle = ({
    isActive,
    onToggle,
  }: {
    isActive: boolean;
    onToggle: () => void;
  }) => {
    return (
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isActive ? "bg-green-600" : "bg-red-500"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  const columns: TableColumn<DataRow>[] = [
    {
      key: "bannerUrl",
      label: "Banner",
      render: (value) => (
        <img src={value} alt="Banner" className="w-10 h-10" />
      ),
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "eventDate",
      label: "Event Date",
    },
    {
      key: "location",
      label: "Event Location",
    },
    {
      key: "venue",
      label: "Venue",
    },
    {
      key: "name",
      label: "Title",
    },
    {
      key: "time",
      label: "Time",
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span className='flex items-center'>
          <Status status={value} />
          {value ? "Active" : "Inactive"}
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
          <Eye className='text-gray-600 cursor-pointer' />
          <Toggle
            isActive={row.isActive}
            onToggle={() => handleToggleStatus(row.id)}
          />
          <Trash2 className='text-red-600 cursor-pointer' />
        </div>
      ),
    },
  ];
  return (
    <DashboardLayout>
      <section className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Events</h1>
          <p className="text-gray-600">Manage your events</p>
        </div>
        <TableHeader setIsModalShow={setIsModalShow} setSearch={handleSearchChange} />
        <div className="mt-4">
          {loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-600">Loading events...</div>
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
                  <p className="mb-2">No events found.</p>
                  <p>Click "Add New" to create your first event.</p>
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
                        Showing {data.length} of {total} events
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
      <AddEvent 
        isModalShow={isModalShow} 
        setIsModalShow={setIsModalShow}
        onEventCreated={fetchEvents}
      />
    </DashboardLayout>
  );
};

export default Event;
