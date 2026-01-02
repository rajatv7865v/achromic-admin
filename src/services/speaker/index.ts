import { API_BASE_URL } from "../../utils/config";

export interface CreateSpeakerData {
  name: string;
  designation: string;
  company: string;
  country: string;
  avatar: string;
  linkedin: string;
  eventId: string;
}

export interface GetSpeakersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchFields?: string;
  eventId?: string;
}

export async function getSpeakers(params?: GetSpeakersParams) {
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
    const url = `${API_BASE_URL}/speaker${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch speakers: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data: {
        data: data.data || data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching speakers:", error);
    throw error;
  }
}

export async function createSpeaker(data: CreateSpeakerData) {
  try {
    const response = await fetch(`${API_BASE_URL}/speaker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create speaker: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: {
        data: result.data || result,
      },
    };
  } catch (error) {
    console.error("Error creating speaker:", error);
    throw error;
  }
}

export async function updateSpeaker(id: string, data: CreateSpeakerData) {
  try {
    const response = await fetch(`${API_BASE_URL}/speaker/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update speaker: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: {
        data: result.data || result,
      },
    };
  } catch (error) {
    console.error("Error updating speaker:", error);
    throw error;
  }
}

export async function deleteSpeaker(id: string | number) {
  try {
    const response = await fetch(`${API_BASE_URL}/speaker/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete speaker: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting speaker:", error);
    throw error;
  }
}
