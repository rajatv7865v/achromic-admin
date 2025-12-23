import React from "react";
import ModalLayout from "../../../layout/modalLayout";

interface AddEventInterface {
  // Define your interface properties here
  isModalShow: boolean;
  setIsModalShow: any;
}

const AddSponsor: React.FC<AddEventInterface> = ({
  isModalShow,
  setIsModalShow,
}) => {
  if (!isModalShow) return null;
  return (
    <ModalLayout title={"Add Sponsor"} setIsModalShow={setIsModalShow}>
      <section className='py-4 px-5'>
        <form action='' className='space-y-4'>
          <div>
            <label htmlFor='' className='text-[13px] px-1 text-gray-500'>
              Name <span className='text-red font-semibold'>*</span>
            </label>
            <input
              type='text'
              className='border-[1px] p-2 w-full rounded border-gray-400'
              placeholder='Event Name'
            />
          </div>

          <div>
            <label htmlFor='' className='text-[13px] px-1 text-gray-500'>
              URL <span className='text-red font-semibold'>*</span>
            </label>
            <input
              type='text'
              className='border-[1px] p-2 w-full rounded border-gray-400'
              placeholder='Event Name'
            />
          </div>
          <div>
            <label htmlFor='' className='text-[13px] px-1 text-gray-500'>
              Image <span className='text-red font-semibold'>*</span>
            </label>
            <input
              type='file'
              className='border-[1px] p-2 w-full rounded border-gray-400 text-gray-500'
              placeholder='Event Name'
            />
          </div>
          <button className='bg-green py-2 w-full flex items-center text-white justify-center rounded-sm text-xl cursor-pointer'>
            Submit
          </button>
        </form>
      </section>
    </ModalLayout>
  );
};

export default AddSponsor;
