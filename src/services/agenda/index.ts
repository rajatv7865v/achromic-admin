import { API_BASE_URL } from "../../utils/config";

export interface AgendaSession {
  id?: number;
  title: string;
  content: string;
  time: string;
  duration: string;
  location: string;
  type: string;
  description: string;
  speakers: string[];
}

export interface CreateAgendaData {
  title: string;
  description: string;
  date: string;
  venue: string;
  location: string;
  sessions: AgendaSession[];
  eventId: string;
  isActive: boolean;
}

export interface GetAgendasParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchFields?: string;
  eventId?: string;
}

export async function getAgendas(params?: GetAgendasParams) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.searchFields) {
      queryParams.append("searchFields", params.searchFields);
    }
    if (params?.eventId) {
      queryParams.append("eventId", params.eventId);
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/agenda${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agendas: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data: data.data || { data: [], meta: {} },
    };
  } catch (error) {
    console.error("Error fetching agendas:", error);
    throw error;
  }
}

export async function createAgenda(data: CreateAgendaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/agenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create agenda: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: {
        data: result.data || result,
      },
    };
  } catch (error) {
    console.error("Error creating agenda:", error);
    throw error;
  }
}

