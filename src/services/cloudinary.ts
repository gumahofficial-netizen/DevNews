/**
 * Helper to convert a browser File object to a Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Uploads a file (Image/Video) to Cloudinary via our full-stack server proxy endpoint
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video" = "image"
): Promise<{ secure_url: string; public_id: string }> {
  try {
    const base64Data = await fileToBase64(file);
    
    const response = await fetch("/api/cloudinary/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Data,
        resource_type: resourceType,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Upload proxy returned an error");
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
}
