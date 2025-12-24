import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import TableHeader from "../../components/common/TableHeader";

interface RegisterationInterface {
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
  email: string;
  phone: string;
  eventName: string;
  status: string;
  createdAt: string;
}

const Status = ({ status }: { status: string }) => {
  const color =
    status.toLowerCase() === "pending"
      ? "bg-yellow-500"
      : status.toLowerCase() === "cancelled"
      ? "bg-red-600"
      : "bg-green-600";

  return <span className={`h-3 w-3 ${color} rounded-full inline-block mr-2`} />;
};

const Registeration: React.FC<RegisterationInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [_ , setIsModalShow] = useState(false);

  useEffect(() => {
    // TODO: Fetch registrations from API
    // For now, using empty data
    setData([]);
  }, []);

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
      key: "eventName",
      label: "Event",
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
      render: () => (
        <div className='flex items-center gap-3 text-[13px]'>
          <Eye className='text-gray-600 cursor-pointer' />
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
    </DashboardLayout>
  );
};

export default Registeration;
