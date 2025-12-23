interface UploadParams {
  file: File | Blob;
}

export async function uploadFile({ file }: UploadParams) {
  const fakePath = `/uploads/${Date.now()}-${(file as any).name ?? "file"}`;

  // In a real implementation, you would POST the file to your backend here.
  return {
    data: {
      path: fakePath,
    },
  };
}


