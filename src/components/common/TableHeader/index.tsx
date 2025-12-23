import React from "react";

interface TableHeaderInterface {
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  setSearch?:any
}

const TableHeader: React.FC<TableHeaderInterface> = ({ setIsModalShow ,setSearch}) => {
  return (
    <nav className='flex items-center justify-between p-4'>
      <div className='flex items-center justify-between w-full'>
        <input
          type='text'
          placeholder='Search'
          onChange={((e)=>setSearch(e.target.value))}
          className='bg-white rounded p-2 w-[300px]  border-red border-2 '
        />
      </div>
      <div className='w-[50%] flex items-center justify-center px-10 gap-6'>
        <button
          onClick={() => setIsModalShow(true)}
          className='bg-green py-2 w-full px-4 rounded text-white cursor-pointer'
        >
          Add New
        </button>
        <button className='bg-yellow-600 py-2 w-full px-4 rounded text-white cursor-pointer'>
          Export
        </button>
      </div>
    </nav>
  );
};

export default TableHeader;
