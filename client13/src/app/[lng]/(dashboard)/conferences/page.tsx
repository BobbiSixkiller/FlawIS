import { getMe } from "../../(auth)/actions";
import Heading from "@/components/Heading";
import { useTranslation } from "@/lib/i18n";
import { client } from "@/lib/webdav/client";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { createReadStream, unlink, writeFile } from "fs";
import { join } from "path";

export default async function Conferences({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "conferences");

  const user = await getMe();

  // const initialData = await getUsers(undefined, 5);

  async function upload(data: FormData) {
    "use server";

    const file: File | null = data.get("file-upload") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    console.log(file);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // With the file data in the buffer, you can do whatever you want with it.
    // For this, we'll just write it to the filesystem in a new location
    const path = join(process.cwd(), "tmp", file.name);
    writeFile(path, buffer, (err) => {
      if (err) console.log(err);
    });

    const dirExists = await client.exists("/testDir");
    if (!dirExists) {
      await client.createDirectory("/testDir");
    }

    createReadStream(path).pipe(
      client.createWriteStream(
        `/testDir/${file.name}`,
        {
          // data: `<?xml version="1.0" encoding="UTF-8"?>
          // <oc:tag>test</oc:tag>`,
        }
        // () =>
        //   unlink(path, (err) => {
        //     if (err) {
        //       console.error(err);
        //     } else {
        //       console.log("File is deleted.");
        //     }
        //   })
      )
    );
    console.log(`open ${path} to see the uploaded file`);

    return { success: true };
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        actions={<></>}
      />
      <form action={upload}>
        <div className="col-span-full">
          <label
            htmlFor="cover-photo"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Cover photo
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
              <PhotoIcon
                className="mx-auto h-12 w-12 text-gray-300"
                aria-hidden="true"
              />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>
        <button type="reset">reset</button>
        <button type="submit">SUBMIT</button>
      </form>
    </div>
  );
}
