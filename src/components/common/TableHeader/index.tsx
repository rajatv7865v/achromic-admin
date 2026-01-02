import React, { useState, useEffect, useRef } from "react";
import { getEventDropdown } from "../../../services/event";
import { useAsync } from "../../../hooks";

interface TableHeaderInterface {
  setIsModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  setSearch?: any;
  onEventSelect?: any;
}

export interface EventItem {
  id: string;
  name: string;
  isActive: boolean;
}

const TableHeader: React.FC<TableHeaderInterface> = ({
  setIsModalShow,
  setSearch,
  onEventSelect,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { run } = useAsync(getEventDropdown);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res: any = await run();
        if (res?.data?.data) {
          setEvents(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [run]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEventSelect = (event: EventItem) => {
    setSelectedEvent(event);
    setIsOpen(false);
    setSearchTerm("");
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center justify-between w-full">
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white rounded p-2 w-[300px]  border-red border-2 "
        />
      </div>

      <div
        className="flex items-center justify-between w-full relative"
        ref={dropdownRef}
      >
        <div
          className="bg-white rounded p-2 w-[300px] border-red border-2 cursor-pointer flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedEvent ? "text-gray-900" : "text-gray-500"}>
            {selectedEvent ? selectedEvent.name : "Select Event"}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border-b border-gray-200 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleEventSelect(event)}
                  >
                    {event.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No events found</div>
              )}
            </div>
          </div>
        )}
      </div>

        <button
          onClick={() => setIsModalShow(true)}
          className="bg-green py-2 px-4 rounded text-white cursor-pointer w-[300px]"
        >
          Add New
        </button>
       
    </nav>
  );
};

export default TableHeader;
