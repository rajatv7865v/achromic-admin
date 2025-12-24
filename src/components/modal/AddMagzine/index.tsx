import React, { useState, useEffect } from "react";
import ModalLayout from "../../../layout/modalLayout";
import { createMagazine } from "../../../services/magzine";
import { getCategories } from "../../../services/category";
import { useAsync } from "../../../hooks";
import toast from "react-hot-toast";

interface AddMagazineInterface {
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddMagzine: React.FC<AddMagazineInterface> = ({
  isModalShow,
  setIsModalShow,
}) => {
  if (!isModalShow) return null;
  return (
    <ModalLayout title='Add Magazine' setIsModalShow={setIsModalShow}>
      <section className='py-4 px-5'>
        <AddMagazineForm onClose={() => setIsModalShow(false)} />
      </section>
    </ModalLayout>
  );
};

interface AddMagazineFormProps {
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

const AddMagazineForm: React.FC<AddMagazineFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    filePath: "",
    publishDate: "",
    categories: [] as string[],
  });
  const [_, setValidationError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );

  const { run, loading,  reset } = useAsync(createMagazine, {
    onSuccess: () => {
      toast.success("Magazine created successfully");
      setFormData({
        title: "",
        description: "",
        filePath: "",
        publishDate: "",
        categories: [],
      });
      onClose();
    },
    onError: () => {
      toast.error("Failed to create magazine");
    },
  });

  const { run: fetchCategories } = useAsync(getCategories);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      const res: any = await fetchCategories();
      if (res?.data?.data) {
        const categories = res.data.data.map((cat: any) => ({
          id: cat.id || cat._id,
          name: cat.name || cat.category,
          isActive: cat.isActive ?? true,
        }));
        setAvailableCategories(
          categories.filter((cat: Category) => cat.isActive)
        );
      }
    };
    loadCategories();
  }, [fetchCategories]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload the file and get back a path
      // For now, we'll simulate a file path
      setFormData((prev) => ({ ...prev, filePath: `/uploads/${file.name}` }));
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, categoryId]
        : prev.categories.filter((id) => id !== categoryId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reset();
    setValidationError(null);

    // Validation
    if (!formData.title.trim()) {
      setValidationError("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      setValidationError("Description is required");
      return;
    }
    if (!formData.filePath) {
      setValidationError("File is required");
      return;
    }
    if (!formData.publishDate) {
      setValidationError("Publish date is required");
      return;
    }

    if (formData.categories.length === 0) {
      setValidationError("At least one category is required");
      return;
    }

    const magazineData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      filePath: formData.filePath,
      publishDate: formData.publishDate,
      categories: formData.categories,
      isActive: true,
    };

    await run(magazineData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label htmlFor='title' className='text-[13px] px-1 text-gray-500'>
          Title <span className='text-red font-semibold'>*</span>
        </label>
        <input
          id='title'
          name='title'
          type='text'
          className='border-[1px] p-2 w-full rounded border-gray-400'
          placeholder='Magazine Title'
          value={formData.title}
          onChange={handleInputChange}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor='publishDate' className='text-[13px] px-1 text-gray-500'>
          Publish Date <span className='text-red font-semibold'>*</span>
        </label>
        <input
          id='publishDate'
          name='publishDate'
          type='date'
          className='border-[1px] p-2 w-full rounded border-gray-400'
          value={formData.publishDate}
          onChange={handleInputChange}
          disabled={loading}
        />
      </div>

      <div>
        <label className='text-[13px] px-1 text-gray-500'>
          Categories <span className='text-red font-semibold'>*</span>
        </label>
        <div className='border-[1px] p-3 w-full rounded border-gray-400 bg-white max-h-40 overflow-y-auto'>
          {availableCategories.length === 0 ? (
            <p className='text-gray-500 text-sm'>Loading categories...</p>
          ) : (
            <div className='space-y-2'>
              {availableCategories.map((category) => (
                <label
                  key={category.id}
                  className='flex items-center space-x-2 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={formData.categories.includes(category.id)}
                    onChange={(e) =>
                      handleCategoryChange(category.id, e.target.checked)
                    }
                    disabled={loading}
                    className='rounded border-gray-300'
                  />
                  <span className='text-sm text-gray-700'>{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {formData.categories.length > 0 && (
          <p className='text-xs text-gray-500 mt-1'>
            {formData.categories.length} category(ies) selected
          </p>
        )}
      </div>

      <div>
        <label htmlFor='file' className='text-[13px] px-1 text-gray-500'>
          File <span className='text-red font-semibold'>*</span>
        </label>
        <input
          id='file'
          type='file'
          accept='.pdf'
          className='border-[1px] p-2 w-full rounded border-gray-400 text-gray-500'
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor='description' className='text-[13px] px-1 text-gray-500'>
          Description <span className='text-red font-semibold'>*</span>
        </label>
        <textarea
          id='description'
          name='description'
          className='border-[1px] p-2 w-full rounded border-gray-400 text-gray-500'
          placeholder='Magazine Description'
          rows={5}
          value={formData.description}
          onChange={handleInputChange}
          disabled={loading}
        />
      </div>

  

      <button
        type='submit'
        className='bg-green py-2 w-full flex items-center text-white justify-center rounded-sm text-xl cursor-pointer disabled:opacity-60'
        disabled={loading}
      >
        {loading ? "Creating..." : "Submit"}
      </button>
    </form>
  );
};

export default AddMagzine;
