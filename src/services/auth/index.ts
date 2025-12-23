import { API_BASE_URL } from "../../utils/config";

export interface SignInData {
  email: string;
  password: string;
}

export interface SignInResponse {
  token?: string;
  accessToken?: string;
  user?: any;
  [key: string]: any;
}

export async function signIn(data: SignInData): Promise<SignInResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/sign-In`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to sign in: ${response.statusText}`
      );
    }

    const result = await response.json();
    const token = result.token || result.accessToken || result.data?.token || result.data?.accessToken;

    // Store token in localStorage
    if (token) {
      localStorage.setItem("token", token);
    }

    // Store user data if available
    if (result.user || result.data?.user) {
      localStorage.setItem("user", JSON.stringify(result.user || result.data.user));
    }

    return result;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

