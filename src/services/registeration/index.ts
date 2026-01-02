import { API_BASE_URL } from "../../utils/config";

export interface CreateRegistrationData {
  name: string;
  description: string;
  industryPriceINR: number;
  industryPriceUSD: number;
  industryStrikePriceINR: number;
  industryStrikePriceUSD: number;
  consultingPriceINR: number;
  consultingPriceUSD: number;
  consultingStrikePriceINR: number;
  consultingStrikePriceUSD: number;
  eventId: string;
  benifits: string[];
  isActive: boolean;
}

export async function createRegistration(data: CreateRegistrationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/registeration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to create registration: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      data: {
        data: result.data || result,
      },
    };
  } catch (error) {
    console.error("Error creating registration:", error);
    throw error;
  }
}

export async function getRegistrations() {
  try {
    const response = await fetch(`${API_BASE_URL}/registeration`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch registrations: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("red", result);
    return {
      data: result.data.data || result || [],
    };
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error;
  }
}

export async function deleteRegistration(id: string | number) {
  try {
    const response = await fetch(`${API_BASE_URL}/registeration/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete registration: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting registration:", error);
    throw error;
  }
}