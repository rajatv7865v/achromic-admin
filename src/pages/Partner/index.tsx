import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/dashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Table } from "../../components/common/Table";
import AddPartner from "../../components/modal/AddPartner";
import TableHeader from "../../components/common/TableHeader";

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
  companyName: string;
  companyUrl: string;
  partnerType: string;
  eventId: string;
  bannerUrl: string;
  createdAt: string;
}

const Partner: React.FC<PartnerInterface> = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);

  useEffect(() => {
    // TODO: Fetch partners from API
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
      key: "bannerUrl",
      label: "Logo",
      render: (value) => (
        value ? <img src={value} alt="Logo" className="w-10 h-10" /> : <span className="text-gray-400">No image</span>
      ),
    },
    {
      key: "companyName",
      label: "Company Name",
    },
    {
      key: "companyUrl",
      label: "URL",
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
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
      <AddPartner isModalShow={isModalShow} setIsModalShow={setIsModalShow} />
    </DashboardLayout>
  );
};

export default Partner;
