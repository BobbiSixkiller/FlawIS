import { objectToFormData } from "@/components/WIzzardForm";
import { deleteFiles } from "@/lib/minio";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function displayDate(utc?: string) {
  if (!utc) return "N/A";

  const date = new Date(utc);

  return date.toLocaleString("sk-SK", {
    weekday: "long", // Display the full name of the day
    year: "numeric",
    month: "long", // Full month name
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
    timeZoneName: "short", // Include time zone abbreviation (e.g., CET or CEST)
    timeZone: "Europe/Bratislava", // Explicit time zone for Slovakia
  });
}

export async function fetchFromMinio(bucketName: string, fileUrl: string) {
  try {
    // Fetch the file from the Next.js route handler
    const response = await fetch(
      `/minio?bucketName=${bucketName}&url=${fileUrl}`
    );

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      const errorMessage = await response.json(); // Parse the JSON body
      throw new Error(errorMessage.message || "Unknown error occurred");
    }

    // Convert response to blob
    const blob = await response.blob();
    const fileType = blob.type || "application/octet-stream";

    // Generate the file name from the URL
    const fileName = fileUrl?.split("/").pop() || "file";
    const fileNameArr = fileName.split("-");

    // Create and return a JavaScript File instance
    return new File([blob], fileNameArr[fileNameArr.length - 1], {
      type: fileType,
    });
  } catch (error) {
    console.error("Error fetching file from MinIO:", error);
    throw error; // Re-throw the error so calling code can handle it
  }
}

export async function uploadToMinio(
  bucketName: string,
  path: string,
  file: File
) {
  try {
    const formData = objectToFormData({ bucketName, path, file });
    const response = await fetch("/minio", { method: "POST", body: formData });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Unknown error occurred");
    }

    const data = await response.json();

    return data.url as string;
  } catch (error) {
    console.error("Error uploading file to MinIO:", error);
    throw error;
  }
}

export async function uploadOrDelete(
  bucketName: string,
  fileUrl?: string | null,
  file?: File,
  path?: string
): Promise<{ url?: string | null; error?: string }> {
  try {
    let url;
    if (!fileUrl && file) {
      url = await uploadToMinio(
        bucketName,
        path ? `${path}/${file.name}` : file.name,
        file
      );
    }
    if (fileUrl && !file) {
      await deleteFiles([fileUrl]);
      url = null;
    }
    if (fileUrl && file && file.name !== fileUrl.split("-").pop()) {
      await deleteFiles([fileUrl]);
      url = await uploadToMinio(
        bucketName,
        path ? `${path}/${file.name}` : file.name,
        file
      );
    }

    return { url };
  } catch (error: any) {
    return { error: error.message };
  }
}
