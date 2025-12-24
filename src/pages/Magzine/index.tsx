import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import AddMagzine from "../../components/modal/AddMagzine";
import TableHeader from "../../components/common/TableHeader";
import { useAsync } from "../../hooks";
import { getMagazines } from "../../services/magzine";

interface SpeakerInterface {
  // Define your interface properties here
}
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataRow {
  id: number;
  filePath: string;
  contentType: string;
  title: string;
  description: string;
  tags: string[];
  isActive: boolean;
  date: string;
}

const Status = ({ status }: { status: boolean }) => {
  const color = status === false ? "bg-red-500" : "bg-green-600";

  return <span className={`h-3 w-3 ${color} rounded-full inline-block mr-2`} />;
};

const Magzine: React.FC<SpeakerInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);

  const { run, loading, error } = useAsync(getMagazines);
  console.log(loading,error)
  useEffect(() => {
    const fetch = async () => {
      const res: any = await run();
      if (!res) return;
      // Map API response to DataRow shape
      const mapped: DataRow[] = (
        Array.isArray(res?.data.data) ? res.data.data : res.data.data
      ).map((item: any, index: number) => ({
        id: item.id ?? index + 1,
        filePath: item.filePath ?? "",
        contentType: item.contentType ?? "",
        title: item.title ?? "",
        description: item.description ?? "",
        tags: item.tags ?? [],
        isActive: Boolean(item.isActive ?? item.active ?? true),
        date: (() => {
          const raw = item.createdAt ?? item.date ?? "";
          if (!raw) return "";
          const d = new Date(raw);
          if (isNaN(d.getTime())) return "";
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        })(),
      }));
      setData(mapped);
    };
    fetch();
  }, [run]);
  console.log("data", data);
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

  const handleToggleStatus = (id: number) => {
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
      key: "filePath",
      label: "File",
      render: (value) => (
        <div className='flex items-center'>
          <img src={value} alt='File' className='w-10 h-10' />
        </div>
      ),
    },
    {
      key: "contentType",
      label: "Content Type",
    },
    {
      key: "title",
      label: "Title",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "tags",
      label: "Tags",
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
      key: "date",
      label: "Date",
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
      <section>
        <TableHeader setIsModalShow={setIsModalShow} />
        <Table
          columns={columns}
          data={data}
          rowKey='id'
          selectedIds={selectedIds}
          onCheckboxChange={handleCheckboxChange}
        />
      </section>
      <AddMagzine isModalShow={isModalShow} setIsModalShow={setIsModalShow} />
    </DashboardLayout>
  );
};

export default Magzine;
