import React, { useEffect, useState } from "react";
import ModalLayout from "../../../layout/modalLayout";
import {
  createSpeaker,
  updateSpeaker,
  type CreateSpeakerData,
} from "../../../services/speaker";
import { useAsync } from "../../../hooks";
import toast from "react-hot-toast";
import { getEvents } from "../../../services/event";
import { uploadFile } from "../../../services/upload";

interface AddSpeakerInterface {
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  onSpeakerCreated?: () => void;
  speakerToEdit?: {
    _id: string;
    name: string;
    designation: string;
    company: string;
    country: string;
    avatar: string;
    linkedin: string;
    eventId: {
      _id: string;
      name: string;
      id: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  onSpeakerUpdated?: () => void;
}

const AddSpeaker: React.FC<AddSpeakerInterface> = ({
  isModalShow,
  setIsModalShow,
  onSpeakerCreated,
  speakerToEdit,
  onSpeakerUpdated,
}) => {
  if (!isModalShow) return null;
  const [availableEvents, setAvailableEvents] = useState<[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { run: fetchEvent } = useAsync(getEvents);
  useEffect(() => {
    const loadEvents = async () => {
      const res: any = await fetchEvent({eventType: "UPCOMING"});
      console.log("events",res.data)
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

  const [formData, setFormData] = useState<CreateSpeakerData>({
    name: speakerToEdit?.name || "",
    designation: speakerToEdit?.designation || "",
    company: speakerToEdit?.company || "",
    country: speakerToEdit?.country || "",
    avatar: speakerToEdit?.avatar || "",
    linkedin: speakerToEdit?.linkedin || "",
    eventId: speakerToEdit?.eventId?._id || "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle avatar file upload
  useEffect(() => {
    if (avatarFile) {
      (async () => {
        try {
          const res: any = await uploadFile({
            file: avatarFile as File | Blob,
          });
          if (res?.data) {
            setFormData((prev) => ({ ...prev, avatar: res.data.path }));
          }
        } catch (error) {
          toast.error("Failed to upload avatar");
        }
      })();
    }
  }, [avatarFile]);

  const { run: createRun, loading } = useAsync(createSpeaker, {
    onSuccess: () => {
      toast.success("Speaker created successfully");
      setFormData({
        name: "",
        designation: "",
        company: "",
        country: "",
        avatar: "",
        linkedin: "",
        eventId: "",
      });
      setAvatarFile(null);
      setIsModalShow(false);
      onSpeakerCreated?.();
    },
    onError: (err: any) => {
      const errorMessage = err?.message || "Failed to create speaker";
      toast.error(errorMessage);
    },
  });
  
  const { run: updateRun } = useAsync(updateSpeaker, {
    onSuccess: () => {
      toast.success("Speaker updated successfully");
      setFormData({
        name: "",
        designation: "",
        company: "",
        country: "",
        avatar: "",
        linkedin: "",
        eventId: "",
      });
      setAvatarFile(null);
      setIsModalShow(false);
      onSpeakerUpdated?.();
    },
    onError: (err: any) => {
      const errorMessage = err?.message || "Failed to update speaker";
      toast.error(errorMessage);
    },
  });

  const handleEventChange = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      eventId: eventId,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (
      !formData.name ||
      !formData.designation ||
      !formData.company ||
      !formData.country ||
      !formData.avatar ||
      !formData.linkedin ||
      !formData.eventId
    ) {
      setValidationError("Please fill all required fields");
      return;
    }

    try {
      if (speakerToEdit) {
        // Update existing speaker
        updateRun(speakerToEdit._id, formData);
      } else {
        // Create new speaker
        createRun(formData);
      }
    } catch (error) {
      const message = speakerToEdit ? "Failed to update speaker" : "Failed to create speaker";
      toast.error(message);
    }
  };

  return (
    <ModalLayout title={speakerToEdit ? "Edit Speaker" : "Add Speaker"} setIsModalShow={setIsModalShow}>
      <section className="py-4 px-5">
        <form onSubmit={handleSubmit} className="space-y-4">
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
                        type="radio"
                        name="eventId"
                        checked={formData.eventId === String(event.id)}
                        onChange={() => handleEventChange(String(event.id))}
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
            {formData.eventId && (
              <p className="text-xs text-gray-500 mt-1">Event selected</p>
            )}
          </div>
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Name <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="text"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="Speaker Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Designation <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="text"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="Designation"
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Country <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="text"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="COUNTRY NAME"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Company <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="text"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="Company Name"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              disabled={loading}
            />
          </div>{" "}
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              LinkedIn <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="url"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="" className="text-[13px] px-1 text-gray-500">
              Avatar <span className="text-red font-semibold">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              className="border-[1px] p-2 w-full rounded border-gray-400 text-gray-500"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAvatarFile(file);
                }
              }}
              disabled={loading}
            />
            {formData.avatar && (
              <p className="text-xs text-gray-500 mt-1">
                Avatar uploaded: {formData.avatar}
              </p>
            )}
            {validationError && !formData.avatar && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
          </div>
          {/* {(validationError || error) && (
            <div className="text-red-500 text-sm px-1">
              {validationError || (error as any)?.message || "Failed to create speaker"}
            </div>
          )} */}
          <div className="mt-4">
            <button
              className="bg-green py-2.5 w-full flex items-center text-white justify-center rounded-md text-base font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              disabled={loading}
              type="submit"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </section>
    </ModalLayout>
  );
};

export default AddSpeaker;
