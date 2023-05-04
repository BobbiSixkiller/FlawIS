import { useRouter } from "next/router";
import { useState } from "react";
import { Search } from "semantic-ui-react";
import { useSearchAttendeeLazyQuery } from "../graphql/generated/schema";

export default function AttendeeSearch({
  conferenceId,
}: {
  conferenceId: string;
}) {
  const [value, setValue] = useState("");
  const [search, { loading, error, data }] = useSearchAttendeeLazyQuery();
  const router = useRouter();

  return (
    <Search
      placeholder="Hľadať..."
      fluid
      input={{ fluid: true }}
      loading={loading}
      onResultSelect={(e, data) => {
        setValue("");
        router.push(
          `/${router.query.slug}/dashboard/attendees/${data.result.id}`
        );
      }}
      onSearchChange={async (e, { value }) => {
        setValue(value as string);
        await search({ variables: { conferenceId, text: value as string } });
      }}
      results={data?.searchAttendee.map((attendee) => ({
        title: attendee.user.name,
        description: attendee.user.email,
        id: attendee.id,
      }))}
      value={value}
    />
  );
}
