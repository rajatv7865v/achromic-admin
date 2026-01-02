import React, { useEffect, useState } from "react";
import ModalLayout from "../../../layout/modalLayout";
import { createRegistration } from "../../../services/registeration";
import { useAsync } from "../../../hooks";
import toast from "react-hot-toast";
import { getEvents } from "../../../services/event";

interface AddRegistrationInterface {
  isModalShow: boolean;
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  onRegistrationCreated?: () => void;
}

const AddRegistration: React.FC<AddRegistrationInterface> = ({
  isModalShow,
  setIsModalShow,
  onRegistrationCreated,
}) => {
  if (!isModalShow) return null;
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availableEvents, setAvailableEvents] = useState<[]>([]);
  const { run: fetchEvent } = useAsync(getEvents);
  useEffect(() => {
    const loadEvents = async () => {
      const res: any = await fetchEvent({ eventType: "UPCOMING" });
      if (res?.data) {
        const events = res.data.map((cat: any) => ({
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
    name: "",
    description: "",
    industryPriceINR: 0,
    industryPriceUSD: 0,
    industryStrikePriceINR: 0,
    industryStrikePriceUSD: 0,
    consultingPriceINR: 0,
    consultingPriceUSD: 0,
    consultingStrikePriceINR: 0,
    consultingStrikePriceUSD: 0,
    eventId: "",
    benifits: [""], // Initialize with one empty benefit
  });

  const { run, loading, reset } = useAsync(createRegistration, {
    onSuccess: () => {
      toast.success("Registration created successfully");
      setFormData({
        name: "",
        description: "",
        industryPriceINR: 0,
        industryPriceUSD: 0,
        industryStrikePriceINR: 0,
        industryStrikePriceUSD: 0,
        consultingPriceINR: 0,
        consultingPriceUSD: 0,
        consultingStrikePriceINR: 0,
        consultingStrikePriceUSD: 0,
        eventId: "",
        benifits: [""],
      });
      setIsModalShow(false);
      onRegistrationCreated?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create registration");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reset();
    setValidationError(null);

    // Validation
    if (!formData.name.trim()) {
      setValidationError("Name is required");
      return;
    }
    
    if (!formData.description.trim()) {
      setValidationError("Description is required");
      return;
    }
    
    if (!formData.eventId) {
      setValidationError("Event is required");
      return;
    }
    
    if (formData.industryPriceINR < 0) {
      setValidationError("Industry price INR must be a positive number");
      return;
    }
    
    if (formData.industryPriceUSD < 0) {
      setValidationError("Industry price USD must be a positive number");
      return;
    }
    
    if (formData.industryStrikePriceINR < 0) {
      setValidationError("Industry strike price INR must be a positive number");
      return;
    }
    
    if (formData.industryStrikePriceUSD < 0) {
      setValidationError("Industry strike price USD must be a positive number");
      return;
    }
    
    if (formData.consultingPriceINR < 0) {
      setValidationError("Consulting price INR must be a positive number");
      return;
    }
    
    if (formData.consultingPriceUSD < 0) {
      setValidationError("Consulting price USD must be a positive number");
      return;
    }
    
    if (formData.consultingStrikePriceINR < 0) {
      setValidationError("Consulting strike price INR must be a positive number");
      return;
    }
    
    if (formData.consultingStrikePriceUSD < 0) {
      setValidationError("Consulting strike price USD must be a positive number");
      return;
    }
    
    // Filter out empty benefits
    const filteredBenefits = formData.benifits.filter(benefit => benefit.trim() !== "");
    
    const registrationData = {
      ...formData,
      benifits: filteredBenefits,
      isActive: true,
    };
    
    await run(registrationData);
  };

  const handleEventChange = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      eventId: eventId,
    }));
  };
  return (
    <ModalLayout title={"Add Registration"} setIsModalShow={setIsModalShow}>
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
            <label htmlFor="name" className="text-[13px] px-1 text-gray-500">
              Name <span className="text-red font-semibold">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="Registration Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="description" className="text-[13px] px-1 text-gray-500">
              Description <span className="text-red font-semibold">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="border-[1px] p-2 w-full rounded border-gray-400"
              placeholder="Registration Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="industryPriceINR" className="text-[13px] px-1 text-gray-500">
                Industry Price (INR) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="industryPriceINR"
                name="industryPriceINR"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Industry Price INR"
                value={formData.industryPriceINR}
                onChange={(e) =>
                  setFormData({ ...formData, industryPriceINR: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="industryPriceUSD" className="text-[13px] px-1 text-gray-500">
                Industry Price (USD) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="industryPriceUSD"
                name="industryPriceUSD"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Industry Price USD"
                value={formData.industryPriceUSD}
                onChange={(e) =>
                  setFormData({ ...formData, industryPriceUSD: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="industryStrikePriceINR" className="text-[13px] px-1 text-gray-500">
                Industry Strike Price (INR) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="industryStrikePriceINR"
                name="industryStrikePriceINR"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Industry Strike Price INR"
                value={formData.industryStrikePriceINR}
                onChange={(e) =>
                  setFormData({ ...formData, industryStrikePriceINR: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="industryStrikePriceUSD" className="text-[13px] px-1 text-gray-500">
                Industry Strike Price (USD) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="industryStrikePriceUSD"
                name="industryStrikePriceUSD"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Industry Strike Price USD"
                value={formData.industryStrikePriceUSD}
                onChange={(e) =>
                  setFormData({ ...formData, industryStrikePriceUSD: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="consultingPriceINR" className="text-[13px] px-1 text-gray-500">
                Consulting Price (INR) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="consultingPriceINR"
                name="consultingPriceINR"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Consulting Price INR"
                value={formData.consultingPriceINR}
                onChange={(e) =>
                  setFormData({ ...formData, consultingPriceINR: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="consultingPriceUSD" className="text-[13px] px-1 text-gray-500">
                Consulting Price (USD) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="consultingPriceUSD"
                name="consultingPriceUSD"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Consulting Price USD"
                value={formData.consultingPriceUSD}
                onChange={(e) =>
                  setFormData({ ...formData, consultingPriceUSD: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="consultingStrikePriceINR" className="text-[13px] px-1 text-gray-500">
                Consulting Strike Price (INR) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="consultingStrikePriceINR"
                name="consultingStrikePriceINR"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Consulting Strike Price INR"
                value={formData.consultingStrikePriceINR}
                onChange={(e) =>
                  setFormData({ ...formData, consultingStrikePriceINR: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="consultingStrikePriceUSD" className="text-[13px] px-1 text-gray-500">
                Consulting Strike Price (USD) <span className="text-red font-semibold">*</span>
              </label>
              <input
                id="consultingStrikePriceUSD"
                name="consultingStrikePriceUSD"
                type="number"
                className="border-[1px] p-2 w-full rounded border-gray-400"
                placeholder="Consulting Strike Price USD"
                value={formData.consultingStrikePriceUSD}
                onChange={(e) =>
                  setFormData({ ...formData, consultingStrikePriceUSD: Number(e.target.value) })
                }
                disabled={loading}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[13px] px-1 text-gray-500">
              Benefits <span className="text-red font-semibold">*</span>
            </label>
            <div className="space-y-2">
              {formData.benifits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="border-[1px] p-2 w-full rounded border-gray-400"
                    placeholder={`Benefit ${index + 1}`}
                    value={benefit}
                    onChange={(e) => {
                      const newBenefits = [...formData.benifits];
                      newBenefits[index] = e.target.value;
                      setFormData({ ...formData, benifits: newBenefits });
                    }}
                    disabled={loading}
                  />
                  {formData.benifits.length > 1 && (
                    <button
                      type="button"
                      className="bg-red-500 text-white px-3 rounded disabled:opacity-60"
                      onClick={() => {
                        const newBenefits = formData.benifits.filter((_, i) => i !== index);
                        setFormData({ ...formData, benifits: newBenefits });
                      }}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm disabled:opacity-60 mt-2"
                onClick={() => {
                  setFormData({
                    ...formData,
                    benifits: [...formData.benifits, ""],
                  });
                }}
                disabled={loading}
              >
                Add Benefit
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-green py-2 w-full flex items-center text-white justify-center rounded-sm text-xl cursor-pointer disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating..." : "Submit"}
          </button>
          {validationError && (
            <p className="text-red-500 text-sm mt-2">{validationError}</p>
          )}
        </form>
      </section>
    </ModalLayout>
  );
};

export default AddRegistration;