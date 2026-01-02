import React, { useState, useEffect } from "react";
import ModalLayout from "../../../layout/modalLayout";
import { createGallery } from "../../../services/gallery";
import { useAsync } from "../../../hooks";
import toast from "react-hot-toast";
import { getEvents } from "../../../services/event";
import { uploadMultipleFile } from "../../../services/upload";

interface AddGalleryInterface {
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddGallery: React.FC<AddGalleryInterface> = ({
  isModalShow,
  setIsModalShow,
}) => {
  if (!isModalShow) return null;
  return (
    <ModalLayout title="Add Gallery" setIsModalShow={setIsModalShow}>
      <section className="py-4 px-5">
        <AddGalleryForm onClose={() => setIsModalShow(false)} />
      </section>
    </ModalLayout>
  );
};

interface AddGalleryFormProps {
  onClose: () => void;
}

const AddGalleryForm: React.FC<AddGalleryFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    eventId: "",
    filePath: [] as string[],
  });
  const [_, setValidationError] = useState<string | null>(null);
  const [availableEvents, setAvailableEvents] = useState<[]>([]);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  const { run, loading, reset } = useAsync(createGallery, {
    onSuccess: () => {
      toast.success("Gallery created successfully");
      setFormData({
        title: "",
        eventId: "",
        filePath: [],
      });
      onClose();
    },
    onError: () => {
      toast.error("Failed to create gallery");
    },
  });
  const { run: fetchEvent } = useAsync(getEvents);
  useEffect(() => {
    const loadEvents = async () => {
      const res: any = await fetchEvent({ eventType: "PAST",limit:100 });
      console.log("events", res.data);
      if (res?.data) {
        const events = await res.data.map((cat: any) => ({
          id: cat.id || cat._id,
          name: cat.name || cat.category,
          isActive: cat.isActive ?? true,
        }));
        setAvailableEvents(events);
      }
    };
    loadEvents();
  }, [fetchEvent]);



  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: any) => {
    const files = Array.from(e.target.files);
    if (files && files.length > 0) {
      setFileUploadLoading(true);
      try {
        const ck: any = await uploadMultipleFile({ files });
        setFormData({
          ...formData,
          filePath: [...ck.data.files.map((item: any) => item.path)]
        });
        console.log("after upload", ck.data.files);
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setFileUploadLoading(false);
      }
    }
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

    if (!formData.filePath || formData.filePath.length === 0) {
      setValidationError("At least one file is required");
      return;
    }


    const galleryData = {
      title: formData.title.trim(),
      filePath: formData.filePath,
      eventId: formData.eventId,
      isActive: true,
    };

    await run(galleryData);
  };
  const handleEventChange = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      eventId: eventId,
    }));
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="" className="text-[13px] px-1 text-gray-500">
          Choose Event <span className="text-red font-semibold">*</span>
        </label>
        <div className="border-[1px] p-3 w-full rounded border-gray-400 bg-white max-h-40 overflow-y-auto" >
          {availableEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading events...</p>
          ) : (
            <div className="space-y-2">
              {availableEvents.map((event: any) => (
                <label
                  key={event.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="eventId"
                    checked={formData.eventId === String(event.id)}
                    onChange={() => handleEventChange(String(event.id))}
                    disabled={loading}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{event.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {formData.eventId && (
          <p className="text-xs text-gray-500 mt-1">Event selected</p>
        )}
      </div>
      <div>
        <label htmlFor="title" className="text-[13px] px-1 text-gray-500">
          Title <span className="text-red font-semibold">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="border-[1px] p-2 w-full rounded border-gray-400"
          placeholder="Gallery Title"
          value={formData.title}
          onChange={handleInputChange}
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="galleryFiles"
          className="text-sm font-medium text-gray-600"
        >
          Upload Gallery Files <span className="text-red-500">*</span>
        </label>

        <div className="relative flex items-center justify-center w-full">
          <label
            htmlFor="galleryFiles"
            className="flex flex-col items-center justify-center w-full h-36
        border-2 border-dashed border-gray-300 rounded-xl
        cursor-pointer bg-white
        hover:border-blue-500 hover:bg-blue-50
        transition-all"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5 5 5M12 15V5"
                />
              </svg>

              <p className="text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag &
                drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF (Multiple allowed)
              </p>
            </div>

            <input
              id="galleryFiles"
              name="galleryFiles"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="bg-green py-2 w-full flex items-center text-white justify-center rounded-sm text-xl cursor-pointer disabled:opacity-60"
        disabled={loading || fileUploadLoading}
      >
        {loading ? "Creating..." : fileUploadLoading ? "Processing..." : "Submit"}
      </button>
    </form>
  );
};

export default AddGallery;