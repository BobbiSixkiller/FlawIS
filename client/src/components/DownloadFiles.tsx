import React from "react";
import JSZip from "jszip";
import { Button, ButtonProps } from "semantic-ui-react";

interface FileDownloaderProps extends ButtonProps {
  fileUrls: string[]; // Array of file URLs to download
}

const FileDownloader: React.FC<FileDownloaderProps> = ({
  fileUrls,
  ...props
}) => {
  const downloadFilesAsZip = async () => {
    const zip = new JSZip();

    // Loop through each URL in the array
    for (const url of fileUrls) {
      try {
        // Fetch the file data
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${url}`);
        }

        // Convert the response data to an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // Get the file name from the URL
        const fileName = url.substring(url.lastIndexOf("/") + 1);

        // Add the file to the zip archive
        zip.file(fileName, arrayBuffer);
      } catch (error) {
        console.error(error);
      }
    }

    // Generate the zip file
    zip.generateAsync({ type: "blob" }).then((content: any) => {
      // Create a download link
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "submissions.zip"; // Set the zip file name
      document.body.appendChild(a);

      // Trigger a click event to download the zip file
      a.click();

      // Clean up the download link
      document.body.removeChild(a);
    });
  };

  return (
    <Button {...props} onClick={downloadFilesAsZip} icon="download">
      Prispevky.zip
    </Button>
  );
};

export default FileDownloader;
