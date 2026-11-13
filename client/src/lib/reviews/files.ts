export async function uploadReviewFile(
  file: File,
  options: {
    kind: string;
    assignment?: string;
    submission?: string;
    conference?: string;
    reviewerToken?: string;
    revisionToken?: string;
    note?: string;
    onProgress?: (percent: number) => void;
  },
) {
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Maximum file size: 20 MiB.");
  const params = new URLSearchParams({ kind: options.kind });
  for (const key of ["submission", "conference", "note", "assignment"] as const)
    if (options[key]) params.set(key, options[key]!);
  const headers = new Headers();
  if (options.reviewerToken)
    headers.set("x-review-token", options.reviewerToken);
  if (options.revisionToken)
    headers.set("x-revision-token", options.revisionToken);
  const form = new FormData();
  form.set("file", file);
  if (options.onProgress) {
    return new Promise<{ id: string }>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `/api/conference-review/files?${params}`);
      request.timeout = 120000;
      request.ontimeout = () =>
        reject(new Error("Upload timed out. Try again."));
      headers.forEach((value, key) => request.setRequestHeader(key, value));
      request.upload.onprogress = (event) => {
        if (event.lengthComputable)
          options.onProgress!(Math.round((event.loaded * 100) / event.total));
      };
      request.onload = () => {
        try {
          const data = JSON.parse(request.responseText);
          if (request.status >= 200 && request.status < 300) resolve(data);
          else reject(new Error(data.error || "File upload failed."));
        } catch {
          reject(new Error("File upload failed."));
        }
      };
      request.onerror = () =>
        reject(new Error("Upload interrupted. Try again."));
      request.onabort = () => reject(new Error("Upload cancelled."));
      request.send(form);
    });
  }
  const response = await fetch(`/api/conference-review/files?${params}`, {
    method: "POST",
    headers,
    body: form,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "File upload failed.");
  return result as { id: string };
}
export async function downloadReviewerFile(id: string, token: string) {
  const response = await fetch(`/api/conference-review/files/${id}`, {
    headers: { "x-review-token": token },
  });
  if (!response.ok)
    throw new Error((await response.json()).error || "Download failed.");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download =
    /filename="([^"]+)"/.exec(
      response.headers.get("content-disposition") || "",
    )?.[1] || "document.docx";
  link.click();
  URL.revokeObjectURL(url);
}
