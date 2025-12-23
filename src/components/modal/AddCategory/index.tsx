import React, { useState } from "react";
import ModalLayout from "../../../layout/modalLayout";
import { createCategory } from "../../../services/category";
import toast from "react-hot-toast";
import { useAsync } from "../../../hooks";

interface AddCategoryInterface {
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  onCategoryCreated?: () => void;
}

const AddCategory: React.FC<AddCategoryInterface> = ({
  isModalShow,
  setIsModalShow,
  onCategoryCreated,
}) => {
  if (!isModalShow) return null;
  return (
    <ModalLayout title='Add Category' setIsModalShow={setIsModalShow}>
      <section className='py-4 px-5'>
        <AddCategoryForm 
          onClose={() => setIsModalShow(false)} 
          onCategoryCreated={onCategoryCreated}
        />
      </section>
    </ModalLayout>
  );
};

export default AddCategory;

interface AddCategoryFormProps {
  onClose: () => void;
  onCategoryCreated?: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onClose, onCategoryCreated }) => {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { run, loading, error, reset } = useAsync(createCategory, {
    onSuccess: () => {
      toast.success("Category created successfully");
      setName("");
      setIsActive(true);
      onClose();
      onCategoryCreated?.();
    },
    onError: (err: any) => {
      const errorMessage = err?.message || "Failed to create category";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reset();
    setValidationError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError("Category name is required");
      return;
    }
    await run({ 
      name: trimmed,
      isActive: isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='categoryName'
          className='text-[13px] px-1 text-gray-500'
        >
          Category Name <span className='text-red font-semibold'>*</span>
        </label>
        <input
          id='categoryName'
          type='text'
          className='border-[1px] p-2 w-full rounded border-gray-400'
          placeholder='Category Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='checkbox'
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={loading}
            className='h-4 w-4 text-green focus:ring-green border-gray-300 rounded'
          />
          <span className='text-[13px] text-gray-500'>Active</span>
        </label>
      </div>

      {(validationError !== null || error != null) && (
        <p className='text-red-500 text-sm px-1'>
          {validationError || (error as any)?.message || "Failed to create category"}
        </p>
      )}

      <div className="mt-4">
        <button
          type='submit'
          className='bg-green py-2.5 w-full flex items-center text-white justify-center rounded-md text-base font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};
