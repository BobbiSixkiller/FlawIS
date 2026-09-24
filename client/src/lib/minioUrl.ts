export function minioDownloadHref(
  bucketName: string,
  urls: string | string[],
) {
  const params = new URLSearchParams({ bucketName });
  for (const url of Array.isArray(urls) ? urls : [urls]) {
    params.append("url", url);
  }
  return `/minio?${params}`;
}
