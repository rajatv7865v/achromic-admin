import { API_BASE_URL } from "../../utils/config";

export interface GetEnquiriesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchFields?: string;
}

export interface EnquiryItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface EnquiryResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  status: boolean;
  data: {
    data: EnquiryItem[];
    meta: {
      page: string;
      limit: string;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export async function getEnquiries(params?: GetEnquiriesParams) {
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

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/contact${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enquiries: ${response.statusText}`);
    }

    const data: EnquiryResponse = await response.json();
    return {
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    throw error;
  }
}

export async function deleteEnquiry(id: string | number) {
  try {
    const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete enquiry: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    throw error;
  }
}