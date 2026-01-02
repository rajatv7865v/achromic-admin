import { API_BASE_URL } from "../../utils/config";

export interface CreateGalleryData {
  title: string;
  filePath: string[];
  eventId: string;
  isActive: boolean;
}

export interface GetGalleriesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchFields?: string;
  eventId?: string;
}

export interface GalleryResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  status: boolean;
  data: {
    data: Array<{
      _id: string;
      title: string;
      filePath: string | string[];
      event: {
        _id: string;
        name: string;
      };
    }>;
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export async function getGalleries(params?: GetGalleriesParams) {
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
    const url = `${API_BASE_URL}/gallery${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch galleries: ${response.statusText}`);
    }

    const result: GalleryResponse = await response.json();
    return {
      data: result.data,
    };
  } catch (error) {
    console.error("Error fetching galleries:", error);
    throw error;
  }
}

export async function createGallery(data: CreateGalleryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/gallery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create gallery: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: {
        data: result.data || result,
      },
    };
  } catch (error) {
    console.error("Error creating gallery:", error);
    throw error;
  }
}

export async function deleteGallery(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete gallery: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: result,
    };
  } catch (error) {
    console.error("Error deleting gallery:", error);
    throw error;
  }
}
