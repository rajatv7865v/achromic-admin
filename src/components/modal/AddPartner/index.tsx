import React, { useEffect, useState } from "react";
import ModalLayout from "../../../layout/modalLayout";
import { createPartner } from "../../../services/partner";
import { useAsync } from "../../../hooks";
import toast from "react-hot-toast";
import { uploadFile } from "../../../services/upload";
import { getEvents } from "../../../services/event";

interface AddEventInterface {
  // Define your interface properties here
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddPartner: React.FC<AddEventInterface> = ({
  isModalShow,
  setIsModalShow,
}) => {
  if (!isModalShow) return null;
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [_, setValidationError] = useState<string | null>(null);
  const [availableEvents, setAvailableEvents] = useState<[]>([]);
  const { run: fetchEvent } = useAsync(getEvents);
  useEffect(() => {
    const loadEvents = async () => {
      const res: any = await fetchEvent();
      if (res?.data?.data) {
        const events = res.data.data.map((cat: any) => ({
          id: cat.id || cat._id,
          name: cat.name || cat.category,
          isActive: cat.isActive ?? true,
        }));
        setAvailableEvents(events.filter((cat: any) => cat.isActive));
      }
    };
    loadEvents();
  }, [fetchEvent]);

  const [formData, setFormData] = useState({
    companyName: "",
    companyUrl: "",
    partnerType: "",
    eventId: "",
  });

  const { run, loading } = useAsync(createPartner, {
    onSuccess: () => {
      toast.success("Event created successfully");
      setFormData({
        companyName: "",
        companyUrl: "",
        partnerType: "",
        eventId: "",
      });
      setBannerFile(null);
      setIsModalShow(false);
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });

  useEffect(() => {
    if (bannerFile) {
      (async () => {
        const res: any = await uploadFile({ file: bannerFile as File | Blob });
        if (res?.data) {
          setFormData((prev) => ({ ...prev, bannerUrl: res.data.path }));
        }
      })();
    }
  }, [bannerFile]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      run(formData);
      setValidationError(null);
      if (
        !formData.companyName ||
        !formData.companyUrl ||
        !formData.eventId ||
        !formData.partnerType
      ) {
        setValidationError("Please fill all required fields");
        return;
      }
    } catch (error) {
      toast.error("Failed to create speaker");
    }
  };

  const handleEventChange = (eventId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      eventId: checked ? eventId : "",
    }));
  };
  return (
    <ModalLayout title={"Add Partner"} setIsModalShow={setIsModalShow}>
      <section className="py-4 px-5">
        <form action="" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Choose Event <span className="text-red font-semibold">*</span>
            </label>
            <div className="border-[1px] p-3 w-full rounded border-gray-400 bg-white max-h-40 overflow-y-auto">
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
                        type="checkbox"
                        checked={formData.eventId.includes(event.id as string)}
                        onChange={(e) =>
                          handleEventChange(event.id, e.target.checked)
                        }
                        disabled={loading}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {event.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.eventId.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.eventId.length} event(s) selected
              </p>
            )}
          </div>{" "}
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Partner Type <span className="text-red font-semibold">*</span>
            </label>
            <div className="border-[1px] p-3 w-full rounded border-gray-400 bg-white max-h-40 overflow-y-auto">
              {availableEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">Loading Type...</p>
              ) : (
                <div className="space-y-2">
                <select name="partnerTyoe" id="" onChange={(e) =>
                setFormData({ ...formData, partnerType: e.target.value })
              }>
                {['sponsor','media','partner','other'].map((event: any) => (
                  <option value={event}>{event}</option>
                ))}
                </select>
                </div>
              )}
            </div>
            {formData.eventId.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.eventId.length} event(s) selected
              </p>
            )}
          </div>{" "}
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Name <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="text"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="Event Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              URL <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="text"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="Event Name"
              value={formData.companyUrl}
              onChange={(e) =>
                setFormData({ ...formData, companyUrl: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Image <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="file"
              className="border-[1px] p-2 w-full rounded border-gray-400 text-gray-500"
              placeholder="Event Name"
              value={formData.partnerType}
              onChange={(e) =>
                setFormData({ ...formData, partnerType: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <button className="bg-green py-2 w-full flex items-center text-white justify-center rounded-sm text-xl cursor-pointer">
            Submit
          </button>
        </form>
      </section>
    </ModalLayout>
  );
};

export default AddPartner;
