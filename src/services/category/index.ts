import { API_BASE_URL } from "../../utils/config";

export interface CategoryData {
  name: string;
  isActive: boolean;
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchFields?: string;
}

export async function getCategories(params?: GetCategoriesParams) {
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
    const url = `${API_BASE_URL}/category${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const data = await response.json();
    // API returns: { statusCode, message, timestamp, status, data: { data: [...], meta: {...} } }
    return {
      data: data.data || { data: [], meta: {} },
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function createCategory(data: CategoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create category: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: {
        data: result.data || result,
      },
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function deleteCategory(id: string | number) {
  try {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete category: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}


