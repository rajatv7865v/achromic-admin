import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Check, Eye, Linkedin, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import AddSpeaker from "../../components/modal/AddSpeaker";
import TableHeader from "../../components/common/TableHeader";
import { getSpeakers } from "../../services/speaker";
import { useAsync } from "../../hooks";

interface SpeakerInterface {
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
  designation: string;
  company: string;
  country: string;
  avatar: string;
  linkedin: string;
  eventId: string;
  createdAt?: string;
}

const columns: TableColumn<DataRow>[] = [
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
         <Linkedin/>
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
    key: "id",
    label: "Action",
    render: () => (
      <div className="flex items-center gap-3 text-[13px]">
        <Eye className="text-gray-600 cursor-pointer hover:text-gray-800" />
        <Check className="text-green-600 cursor-pointer hover:text-green-700" />
        <Trash2 className="text-red-600 cursor-pointer hover:text-red-700" />
      </div>
    ),
  },
];

const Speaker: React.FC<SpeakerInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { run } = useAsync(getSpeakers);

  const fetchSpeakers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await run();
      console.log("res", res);
      if (!res) {
        setData([]);
        setLoading(false);
        return;
      }

      // Map API response to DataRow shape
      const speakers = Array.isArray(res?.data?.data?.data)
        ? res.data.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      console.log("speakers", speakers);

      const mapped: DataRow[] = speakers.map((item: any) => ({
        id: item._id || item.id,
        name: item?.name || "",
        designation: item?.designation || "",
        company: item?.organization || "",
        country: item.country || "",
        avatar: item.avatar || "",
        linkedin: item.linkedin || "",
        eventName: item?.event?.name || "",
        createdAt: item.createdAt || "",
      }));
      console.log("map", mapped);
      setData(mapped);
    } catch (error: any) {
      console.error("Error fetching speakers:", error);
      setError(error?.message || "Failed to fetch speakers");
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  console.log("data", data);

  useEffect(() => {
    fetchSpeakers();
  }, [run]);

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
  return (
    <DashboardLayout>
      <section className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Speakers
          </h1>
          <p className="text-gray-600">Manage event speakers</p>
        </div>
        <TableHeader setIsModalShow={setIsModalShow} />
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
                <Table
                  columns={columns}
                  data={data}
                  rowKey="id"
                  selectedIds={selectedIds}
                  onCheckboxChange={handleCheckboxChange}
                />
              )}
            </>
          )}
        </div>
      </section>
      <AddSpeaker
        isModalShow={isModalShow}
        setIsModalShow={setIsModalShow}
        onSpeakerCreated={fetchSpeakers}
      />
    </DashboardLayout>
  );
};

export default Speaker;
