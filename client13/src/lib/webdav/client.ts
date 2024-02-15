import { createClient } from "webdav";

export const client = createClient(
  "http://nextcloud:80/remote.php/dav/files/root",
  {
    username: "root",
    password: "id7yS-4eJbL-3DFBB-bJMqF-ZyCH3",
  }
);
