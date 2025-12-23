import React, { useEffect, useState } from "react";
import ModalLayout from "../../../layout/modalLayout";
import { createAgenda, type CreateAgendaData, type AgendaSession } from "../../../services/agenda";
import { useAsync } from "../../../hooks";
import toast from "react-hot-toast";
import { getEvents } from "../../../services/event";
import { getSpeakers } from "../../../services/speaker";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { Plus, Trash2 } from "lucide-react";

interface AddAgendaInterface {
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  onAgendaCreated?: () => void;
}

interface Event {
  id: string;
  name: string;
}

interface Speaker {
  id: string;
  name: string;
}

const AddAgenda: React.FC<AddAgendaInterface> = ({
  isModalShow,
  setIsModalShow,
  onAgendaCreated,
}) => {
  if (!isModalShow) return null;

  const [validationError, setValidationError] = useState<string | null>(null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [availableSpeakers, setAvailableSpeakers] = useState<Speaker[]>([]);

  const [agendaData, setAgendaData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    location: "",
    eventId: "6943cd46b39cb8ee4ad23fc8",
    isActive: true,
    sessions: [] as AgendaSession[],
  });

  const { run: fetchEvents } = useAsync(getEvents);
  const { run: fetchSpeakers } = useAsync(getSpeakers);

  // Fetch events
  useEffect(() => {
    const loadEvents = async () => {
      const res: any = await fetchEvents();
      if (res?.data?.data) {
        const events = res.data.data.map((event: any) => ({
          id: event.id || event._id,
          name: event.name || "",
        }));
        setAvailableEvents(events);
      }
    };
    loadEvents();
  }, [fetchEvents]);

  // Fetch speakers
  useEffect(() => {
    const loadSpeakers = async () => {
      const res: any = await fetchSpeakers();
      if (res?.data?.data) {
        const speakers = res.data.data.map((speaker: any) => ({
          id: speaker.id || speaker._id,
          name: speaker.name || "",
        }));
        setAvailableSpeakers(speakers);
      }
    };
    loadSpeakers();
  }, [fetchSpeakers]);

  const { run, loading } = useAsync(createAgenda, {
    onSuccess: () => {
      toast.success("Agenda created successfully");
      setAgendaData({
        title: "",
        description: "",
        date: "",
        venue: "",
        location: "",
        eventId: "",
        isActive: true,
        sessions: [],
      });
      setIsModalShow(false);
      onAgendaCreated?.();
    },
    onError: (err: any) => {
      const errorMessage = err?.message || "Failed to create agenda";
      toast.error(errorMessage);
    },
  });

  const handleChange = (
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !agendaData.title ||
      !agendaData.description ||
      !agendaData.date ||
      !agendaData.venue ||
      !agendaData.location ||
      !agendaData.eventId ||
      agendaData.sessions.length === 0
    ) {
      setValidationError("Please fill all required fields and add at least one session.");
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
      setValidationError("Please fill all fields for each session.");
      return;
    }

    setValidationError(null);

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
      eventId: agendaData.eventId,
      isActive: agendaData.isActive,
    };

    await run(dataToSubmit);
  };

  return (
    <ModalLayout title='Add Agenda' setIsModalShow={setIsModalShow}>
      <section className='py-4 px-5'>
        {validationError && (
          <p className='text-red-500 text-sm mb-3'>{validationError}</p>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Event Selection */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Event<span className='text-red-500 font-semibold'>*</span>
            </label>
            <select
              name='eventId'
              value={agendaData.eventId}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              disabled={loading}
            >
              <option value=''>Select an event</option>
              {availableEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {/* Agenda Title */}
          <div>
            <label className='text-[13px] px-1 text-gray-500'>
              Agenda Title<span className='text-red-500 font-semibold'>*</span>
            </label>
            <input
              type='text'
              name='title'
              value={agendaData.title}
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              placeholder='e.g., Tech Conference 2024 - Day 1'
              disabled={loading}
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
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              placeholder='Full day agenda description'
              rows={3}
              disabled={loading}
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
              onChange={handleChange}
              className='border p-2 w-full rounded border-gray-400'
              disabled={loading}
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
                onChange={handleChange}
                className='border p-2 w-full rounded border-gray-400'
                placeholder='Venue'
                disabled={loading}
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
                onChange={handleChange}
                className='border p-2 w-full rounded border-gray-400'
                placeholder='Location'
                disabled={loading}
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
                disabled={loading}
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
                        disabled={loading}
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
                          disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                          disabled={loading}
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
                          disabled={loading}
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
                                    disabled={loading}
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
              {loading ? "Submitting..." : "Create Agenda"}
            </button>
          </div>
        </form>
      </section>
    </ModalLayout>
  );
};

export default AddAgenda;

