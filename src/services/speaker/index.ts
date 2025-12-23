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

export async function getSpeakers() {
  try {
    const response = await fetch(`${API_BASE_URL}/speaker`, {
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


