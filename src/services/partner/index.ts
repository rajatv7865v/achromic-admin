import { API_BASE_URL } from "../../utils/config";

export interface CreatePartnerData {
  companyName: string;
  companyUrl: string;
  partnerType: string;
  eventId: string;
  imagePath: string;
}
export interface GetPartnerParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchFields?: string;
  partnerType?: string;
  eventId?: string;
}

export async function getPartner(params?: GetPartnerParams) {
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
    if (params?.partnerType) {
      queryParams.append("eventType", params.partnerType);
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/partner${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    // API returns: { message: "...", data: [...] }
    return {
      data: data.data || { data: [] },
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

export async function deletePartner(id: string | number) {
  try {
    const response = await fetch(`${API_BASE_URL}/partner/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete partner: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting partner:", error);
    throw error;
  }
}


export async function createPartner(data: CreatePartnerData) {
  try {
    const response = await fetch(`${API_BASE_URL}/partner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create event: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: {
        data: result.data || result,
      },
    };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}
