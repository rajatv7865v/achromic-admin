import { X } from "lucide-react";
import React, { type ReactNode } from "react";

interface indexInterface {
  children: ReactNode;
  title: string;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalLayout: React.FC<indexInterface> = ({
  children,
  title,
  setIsModalShow,
}) => {
  return (
    <section className='absolute top-0 left-0 right-0 bottom-0 z-10 flex items-center justify-center bg-black/50 '>
      <div className='bg-white w-[35%] min-h-[200px] max-h-[600px] overflow-y-scroll scroll-auto  rounded'>
        <h3 className='bg-[#ECF0F4] p-2  text-xl text-gray-600 flex items-center justify-between'>
          {title}
          <button
            onClick={() => setIsModalShow(false)}
            className='cursor-pointer'
          >
            <X color='red' size={22} />
          </button>
        </h3>
        {children}
      </div>
    </section>
  );
};

export default ModalLayout;
