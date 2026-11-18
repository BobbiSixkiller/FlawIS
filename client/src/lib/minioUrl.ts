export function minioDownloadHref(bucketName: string, urls: string | string[]) {
  // A versioned manuscript may now live in the protected review bucket.
  const storedBucket =
    typeof urls === "string" &&
    /^http:\/\/minio:9000\/([^/]+)\//.exec(urls)?.[1];

  const params = new URLSearchParams({
    bucketName: storedBucket || bucketName,
  });

  for (const url of Array.isArray(urls) ? urls : [urls]) {
    params.append("url", url);
  }

  return `/minio?${params}`;
}
