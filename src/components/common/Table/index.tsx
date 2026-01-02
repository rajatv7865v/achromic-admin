import React from "react";


export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  selectedIds: (string | number)[];
  onCheckboxChange: any;
  rowKey: keyof T;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  selectedIds,
  onCheckboxChange,
  rowKey,
  loading = false,
  onRowClick,
}: TableProps<T>) {

console.log(onCheckboxChange)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-red-500'>
            <tr>
              {columns?.map((col, idx) => (
                <th 
                  key={idx} 
                  className='px-6 py-3 text-left text-xs font-semibold text-gray-800 text-white font-bold uppercase tracking-wider'
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data?.map((row, rowIdx) => {
                const id = row[rowKey];
                const isSelected = selectedIds.includes(id);
                return (
                  <tr 
                    key={id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((col, colIdx) => {
                      const rawValue = row[col.key];

                      let content = col.render
                        ? col.render(rawValue, row)
                        : rawValue || <span className="text-gray-400">-</span>;

                      return (
                        <td
                          key={`${rowIdx}-${colIdx}`}
                          className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
