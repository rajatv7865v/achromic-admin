import React, { useEffect, useState } from "react";
import ModalLayout from "../../../layout/modalLayout";
import { createEvent, type CreateEventData } from "../../../services/event";
import { createAgenda, type CreateAgendaData, type AgendaSession } from "../../../services/agenda";
import { useAsync } from "../../../hooks";
import toast from "react-hot-toast";
import { getCategories } from "../../../services/category";
import { uploadFile } from "../../../services/upload";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { getSpeakers } from "../../../services/speaker";
import { Plus, Trash2 } from "lucide-react";

interface AddEventInterface {
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  onEventCreated?: () => void;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface Speaker {
  id: string;
  name: string;
}

const AddEvent: React.FC<AddEventInterface> = ({
  isModalShow,
  setIsModalShow,
  onEventCreated,
}) => {
  if (!isModalShow) return null;

  const [activeTab, setActiveTab] = useState<"event" | "agenda">("event");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [agendaValidationError, setAgendaValidationError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [availableSpeakers, setAvailableSpeakers] = useState<Speaker[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);


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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    dateFrom: "",
    dateTo: "",
    bannerUrl: "",
    timeFrom: "",
    timeTo: "",
    slug: "",
    categories: [] as string[],
    isActive: true,
    location: "",
    venue: "",
  });

  const [agendaData, setAgendaData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    location: "",
    isActive: true,
    sessions: [] as AgendaSession[],
  });

  const { run, loading } = useAsync(createEvent, {
    onSuccess: (result: any) => {
      const eventId = result?.data?.data?._id || result?.data?.data?.id || result?.data?._id || result?.data?.id;
      if (eventId) {
        setCreatedEventId(eventId);
        toast.success("Event created successfully");
        setActiveTab("agenda");
      } else {
        toast.success("Event created successfully");
        resetForm();
        setIsModalShow(false);
        onEventCreated?.();
      }
    },
    onError: (err: any) => {
      const errorMessage = err?.message || "Failed to create event";
      toast.error(errorMessage);
    },
  });

  const { run: runCreateAgenda, loading: agendaLoading } = useAsync(createAgenda, {
    onSuccess: () => {
      toast.success("Agenda created successfully");
      resetForm();
      setIsModalShow(false);
      onEventCreated?.();
    },
    onError: (err: any) => {
      const errorMessage = err?.message || "Failed to create agenda";
      toast.error(errorMessage);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      content: "",
      dateFrom: "",
      dateTo: "",
      bannerUrl: "",
      timeFrom: "",
      timeTo: "",
      slug: "",
      categories: [] as string[],
      isActive: true,
      location: "",
      venue: "",
    });
    setAgendaData({
      title: "",
      description: "",
      date: "",
      venue: "",
      location: "",
      isActive: true,
      sessions: [],
    });
    setBannerFile(null);
    setCreatedEventId(null);
    setActiveTab("event");
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, categoryId]
        : prev.categories.filter((id) => id !== categoryId),
    }));
  };

  const { run: fetchCategories } = useAsync(getCategories);
  const { run: fetchSpeakers } = useAsync(getSpeakers);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      const res: any = await fetchCategories();
      if (res?.data?.data) {
        const categories = res.data.data.map((cat: any) => ({
          id: cat.id || cat._id,
          name: cat.name || cat.category,
          isActive: cat.isActive ?? true,
        }));
        setAvailableCategories(categories.filter((cat: any) => cat.isActive));
      }
    };
    loadCategories();
  }, [fetchCategories]);

  // Fetch speakers
  useEffect(() => {
    const loadSpeakers = async () => {
      const res: any = await fetchSpeakers();
      if (res?.data?.data) {
        // Handle response with nested data structure
        const speakers = res.data.data.map((speaker: any) => ({
          id: speaker.id || speaker._id,
          name: speaker.name || "",
        }));
        setAvailableSpeakers(speakers);
      } else if (Array.isArray(res?.data)) {
        // Handle response with direct array
        const speakers = res.data.map((speaker: any) => ({
          id: speaker.id || speaker._id,
          name: speaker.name || "",
        }));
        setAvailableSpeakers(speakers);
      }
    };
    loadSpeakers();
  }, [fetchSpeakers]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0]);
    }
  };

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.venue ||
      !formData.location ||
      !formData.dateFrom ||
      !formData.dateTo ||
      !formData.timeFrom ||
      !formData.timeTo ||
      !formData.bannerUrl ||
      formData.categories.length === 0
    ) {
      setValidationError("Please fill all required fields.");
      return;
    }

    // Generate slug from name if not provided
    const slug = formData.slug || formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setValidationError(null);

    const dataToSubmit: CreateEventData = {
      name: formData.name,
      description: formData.description,
      content: formData.content,
      venue: formData.venue,
      location: formData.location,
      dateFrom: formData.dateFrom,
      dateTo: formData.dateTo,
      bannerUrl: formData.bannerUrl,
      timeFrom: formData.timeFrom,
      timeTo: formData.timeTo,
      slug: slug,
      categories: formData.categories,
      isActive: formData.isActive,
    };

    await run(dataToSubmit);
  };

  const handleAgendaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAgendaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSession = () => {
    setAgendaData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          id: prev.sessions.length + 1,
          title: "",
          content: "",
          time: "",
          duration: "",
          location: "",
          type: "",
          description: "",
          speakers: [],
        },
      ],
    }));
  };

  const removeSession = (index: number) => {
    setAgendaData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index),
    }));
  };

  const updateSession = (index: number, field: keyof AgendaSession, value: any) => {
    setAgendaData((prev) => {
      const updatedSessions = [...prev.sessions];
      updatedSessions[index] = {
        ...updatedSessions[index],
        [field]: value,
      };
      return {
        ...prev,
        sessions: updatedSessions,
      };
    });
  };

  const toggleSessionSpeaker = (sessionIndex: number, speakerId: string) => {
    setAgendaData((prev) => {
      const updatedSessions = [...prev.sessions];
      const session = updatedSessions[sessionIndex];
      const speakers = session.speakers || [];
      const isSelected = speakers.includes(speakerId);
      
      updatedSessions[sessionIndex] = {
        ...session,
        speakers: isSelected
          ? speakers.filter((id) => id !== speakerId)
          : [...speakers, speakerId],
      };
      
      return {
        ...prev,
        sessions: updatedSessions,
      };
    });
  };

  const handleAgendaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createdEventId) {
      setAgendaValidationError("Please create the event first before adding agenda.");
      return;
    }

    if (
      !agendaData.title ||
      !agendaData.description ||
      !agendaData.date ||
      !agendaData.venue ||
      !agendaData.location ||
      agendaData.sessions.length === 0
    ) {
      setAgendaValidationError("Please fill all required fields and add at least one session.");
      return;
    }

    // Validate sessions
    const invalidSessions = agendaData.sessions.some(
      (session) =>
        !session.title ||
        !session.content ||
        !session.time ||
        !session.duration ||
        !session.location ||
        !session.type ||
        !session.description
    );

    if (invalidSessions) {
      setAgendaValidationError("Please fill all fields for each session.");
      return;
    }

    setAgendaValidationError(null);

    const dataToSubmit: CreateAgendaData = {
      title: agendaData.title,
      description: agendaData.description,
      date: agendaData.date,
      venue: agendaData.venue,
      location: agendaData.location,
      sessions: agendaData.sessions.map((session, index) => ({
        id: session.id || index + 1,
        title: session.title,
        content: session.content,
        time: session.time,
        duration: session.duration,
        location: session.location,
        type: session.type,
        description: session.description,
        speakers: session.speakers,
      })),
      eventId: createdEventId,
      isActive: agendaData.isActive,
    };

    await runCreateAgenda(dataToSubmit);
  };

  return (
    <ModalLayout title='Add Event' setIsModalShow={setIsModalShow} className="w-[80%] min-h-[70vh] max-h-[90vh] overflow-y-auto rounded-lg">
      {/* Tabs */}
      

      <section className='py-4 px-5'>
        {activeTab === "event" ? (
          <>
            {validationError && (
              <p className='text-red-500 text-sm mb-3'>{validationError}</p>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Banner Upload */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Banner<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='file'
              onChange={handleBannerChange}
              className='border p-2 w-full rounded border-gray-400'
            />
            {bannerFile && (
              <img
                src={URL.createObjectURL(bannerFile)}
                alt='banner preview'
                className='mt-2 w-32 h-20 object-cover rounded'
              />
            )}
          </div>

          {/* Dates */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Date From<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='date'
              name='dateFrom'
              value={formData.dateFrom}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
            />
          </div>
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Date To<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='date'
              name='dateTo'
              value={formData.dateTo}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
            />
          </div>

          {/* Time */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Time From<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='time'
              name='timeFrom'
              value={formData.timeFrom}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
            />
          </div>
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Time To<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='time'
              name='timeTo'
              value={formData.timeTo}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
            />
          </div>

          {/* Location & Venue */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Location<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='text'
              name='location'
              value={formData.location}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              placeholder='Location'
            />
          </div>
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Venue<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='text'
              name='venue'
              value={formData.venue}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              placeholder='Venue'
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
          {/* Title */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Title<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              placeholder='Event Title'
            />
          </div>

          {/* Description */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Description<span className='text-red-500 font-semibold'>*</span>
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              placeholder='Event Description'
              rows={4}
              disabled={loading}
            ></textarea>
          </div>

          {/* Content */}
          <div>
            <label className='text-[13px] px-1 text-gray-500 mb-2 block'>
              Content
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, content: value }))
              }
              placeholder='Enter event content...'
              disabled={loading}
            />
          </div>

          {/* Slug */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Slug
            </label>
            <input
              type='text'
              name='slug'
              value={formData.slug}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              placeholder='Auto-generated from title (optional)'
            />
            <p className='text-xs text-gray-500 mt-1'>
              Leave empty to auto-generate from title
            </p>
          </div>

          {/* Active Status */}
          <div>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                disabled={loading}
                className='h-4 w-4 text-green focus:ring-green border-gray-300 rounded'
              />
              <span className='text-[13px] text-gray-500'>Active</span>
            </label>
          </div>

          {/* Submit */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type='submit'
              disabled={loading}
              className='bg-green py-2.5 w-full flex items-center justify-center text-white rounded-md text-base font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'
            >
              {loading ? "Submitting..." : "Create Event"}
            </button>
          </div>
        </form>
          </>
        ) : (
          <>
            {agendaValidationError && (
              <p className='text-red-500 text-sm mb-3'>{agendaValidationError}</p>
            )}
            {!createdEventId && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  Please create the event first before adding agenda.
                </p>
              </div>
            )}

            <form onSubmit={handleAgendaSubmit} className='space-y-4'>
              {/* Agenda Title */}
              <div>
                <label className='text-[13px] px-1 text-gray-500'>
                  Agenda Title<span className='text-red-500 font-semibold'>*</span>
                </label>
                <input
                  type='text'
                  name='title'
                  value={agendaData.title}
                  onChange={handleAgendaChange}
                  className='border p-2 w-full rounded border-gray-400'
                  placeholder='e.g., Tech Conference 2024 - Day 1'
                  disabled={agendaLoading || !createdEventId}
                />
              </div>

              {/* Agenda Description */}
              <div>
                <label className='text-[13px] px-1 text-gray-500'>
                  Description<span className='text-red-500 font-semibold'>*</span>
                </label>
                <textarea
                  name='description'
                  value={agendaData.description}
                  onChange={handleAgendaChange}
                  className='border p-2 w-full rounded border-gray-400'
                  placeholder='Full day agenda description'
                  rows={3}
                  disabled={agendaLoading || !createdEventId}
                ></textarea>
              </div>

              {/* Date */}
              <div>
                <label className='text-[13px] px-1 text-gray-500'>
                  Date<span className='text-red-500 font-semibold'>*</span>
                </label>
                <input
                  type='date'
                  name='date'
                  value={agendaData.date}
                  onChange={handleAgendaChange}
                  className='border p-2 w-full rounded border-gray-400'
                  disabled={agendaLoading || !createdEventId}
                />
              </div>

              {/* Venue & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className='text-[13px] px-1 text-gray-500'>
                    Venue<span className='text-red-500 font-semibold'>*</span>
                  </label>
                  <input
                    type='text'
                    name='venue'
                    value={agendaData.venue}
                    onChange={handleAgendaChange}
                    className='border p-2 w-full rounded border-gray-400'
                    placeholder='Venue'
                    disabled={agendaLoading || !createdEventId}
                  />
                </div>
                <div>
                  <label className='text-[13px] px-1 text-gray-500'>
                    Location<span className='text-red-500 font-semibold'>*</span>
                  </label>
                  <input
                    type='text'
                    name='location'
                    value={agendaData.location}
                    onChange={handleAgendaChange}
                    className='border p-2 w-full rounded border-gray-400'
                    placeholder='Location'
                    disabled={agendaLoading || !createdEventId}
                  />
                </div>
              </div>

              {/* Sessions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className='text-[13px] px-1 text-gray-500'>
                    Sessions<span className='text-red-500 font-semibold'>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSession}
                    disabled={agendaLoading || !createdEventId}
                    className="flex items-center gap-1 text-sm text-green hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Session
                  </button>
                </div>

                {agendaData.sessions.length === 0 ? (
                  <div className="border border-gray-300 rounded p-4 text-center text-gray-500 text-sm">
                    No sessions added. Click "Add Session" to add one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agendaData.sessions.map((session, index) => (
                      <div key={index} className="border border-gray-300 rounded p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700">Session {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeSession(index)}
                            disabled={agendaLoading || !createdEventId}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className='text-[12px] px-1 text-gray-500'>
                              Title<span className='text-red-500 font-semibold'>*</span>
                            </label>
                            <input
                              type='text'
                              value={session.title}
                              onChange={(e) => updateSession(index, "title", e.target.value)}
                              className='border p-2 w-full rounded border-gray-400 text-sm'
                              placeholder='Session title'
                              disabled={agendaLoading || !createdEventId}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className='text-[12px] px-1 text-gray-500'>
                                Time<span className='text-red-500 font-semibold'>*</span>
                              </label>
                              <input
                                type='time'
                                value={session.time}
                                onChange={(e) => updateSession(index, "time", e.target.value)}
                                className='border p-2 w-full rounded border-gray-400 text-sm'
                                disabled={agendaLoading || !createdEventId}
                              />
                            </div>
                            <div>
                              <label className='text-[12px] px-1 text-gray-500'>
                                Duration<span className='text-red-500 font-semibold'>*</span>
                              </label>
                              <input
                                type='text'
                                value={session.duration}
                                onChange={(e) => updateSession(index, "duration", e.target.value)}
                                className='border p-2 w-full rounded border-gray-400 text-sm'
                                placeholder='e.g., 45 min'
                                disabled={agendaLoading || !createdEventId}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className='text-[12px] px-1 text-gray-500'>
                                Location<span className='text-red-500 font-semibold'>*</span>
                              </label>
                              <input
                                type='text'
                                value={session.location}
                                onChange={(e) => updateSession(index, "location", e.target.value)}
                                className='border p-2 w-full rounded border-gray-400 text-sm'
                                placeholder='e.g., Main Hall'
                                disabled={agendaLoading || !createdEventId}
                              />
                            </div>
                            <div>
                              <label className='text-[12px] px-1 text-gray-500'>
                                Type<span className='text-red-500 font-semibold'>*</span>
                              </label>
                              <input
                                type='text'
                                value={session.type}
                                onChange={(e) => updateSession(index, "type", e.target.value)}
                                className='border p-2 w-full rounded border-gray-400 text-sm'
                                placeholder='e.g., introduction'
                                disabled={agendaLoading || !createdEventId}
                              />
                            </div>
                          </div>

                          <div>
                            <label className='text-[12px] px-1 text-gray-500'>
                              Description<span className='text-red-500 font-semibold'>*</span>
                            </label>
                            <textarea
                              value={session.description}
                              onChange={(e) => updateSession(index, "description", e.target.value)}
                              className='border p-2 w-full rounded border-gray-400 text-sm'
                              placeholder='Session description'
                              rows={2}
                              disabled={agendaLoading || !createdEventId}
                            ></textarea>
                          </div>

                          <div>
                            <label className='text-[12px] px-1 text-gray-500 mb-2 block'>
                              Content<span className='text-red-500 font-semibold'>*</span>
                            </label>
                            <RichTextEditor
                              value={session.content}
                              onChange={(value) => updateSession(index, "content", value)}
                              placeholder='Session content...'
                              disabled={agendaLoading || !createdEventId}
                            />
                          </div>

                          <div>
                            <label className='text-[12px] px-1 text-gray-500 mb-2 block'>
                              Speakers
                            </label>
                            <div className='border-[1px] p-3 w-full rounded border-gray-400 bg-white max-h-32 overflow-y-auto'>
                              {availableSpeakers.length === 0 ? (
                                <p className='text-gray-500 text-xs'>No speakers available</p>
                              ) : (
                                <div className='space-y-2'>
                                  {availableSpeakers.map((speaker) => (
                                    <label
                                      key={speaker.id}
                                      className='flex items-center space-x-2 cursor-pointer'
                                    >
                                      <input
                                        type='checkbox'
                                        checked={session.speakers?.includes(speaker.id) || false}
                                        onChange={() => toggleSessionSpeaker(index, speaker.id)}
                                        disabled={agendaLoading || !createdEventId}
                                        className='rounded border-gray-300'
                                      />
                                      <span className='text-xs text-gray-700'>{speaker.name}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={agendaData.isActive}
                    onChange={(e) =>
                      setAgendaData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    disabled={agendaLoading || !createdEventId}
                    className='h-4 w-4 text-green focus:ring-green border-gray-300 rounded'
                  />
                  <span className='text-[13px] text-gray-500'>Active</span>
                </label>
              </div>

              {/* Submit */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  type='submit'
                  disabled={agendaLoading || !createdEventId}
                  className='bg-green py-2.5 w-full flex items-center justify-center text-white rounded-md text-base font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'
                >
                  {agendaLoading ? "Submitting..." : "Create Agenda"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </ModalLayout>
  );
};

export default AddEvent;
