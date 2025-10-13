
export async function uploadToImageKit(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  
  try {
    const privateKey = process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY;
    const url = process.env.NEXT_PUBLIC_IMAGEKIT_UPLOAD_URL;

    if (!privateKey) {
      throw new Error("IMAGEKIT_PRIVATE_KEY is not set in environment variables");
    }

    if (!url) {
      throw new Error("IMAGEKIT_UPLOAD_URL is not set in environment variables");
    }

    const basicAuth = btoa(privateKey + ":"); 

    console.log("Uploading to ImageKit:", {
      url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
      body: formData,
    });

    console.log("ImageKit response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("ImageKit upload failed:", error);
      throw new Error(`ImageKit upload failed: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("ImageKit upload success:", data.url);
    return data.url; 
  } catch (err) {
    console.error("ImageKit upload error:", err);
    throw new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}