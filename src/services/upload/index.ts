import { API_BASE_URL } from "../../utils/config";

interface UploadParams {
  file: File | Blob;
}

export async function uploadFile({ file }: UploadParams) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to upload file: ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Return the path from the API response
    return {
      data: {
        path: data.data?.path,
      },
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export interface MultipleUploadParams {
  files: File[];
}

export async function uploadMultipleFile({ files }: any) {
  try {
    const formData = new FormData();

    files.forEach((file: any) => {
      formData.append("files", file); // MUST match FilesInterceptor('files')
    });

    const url = `${API_BASE_URL}/upload/multiple`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData, 
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to upload files: ${response.statusText}`
      );
    }

    const data = await response.json();
    // API returns: { message: "...", data: [...] }
    return {
      data: data.data || { data: [] },
    };
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw error;
  }
}
