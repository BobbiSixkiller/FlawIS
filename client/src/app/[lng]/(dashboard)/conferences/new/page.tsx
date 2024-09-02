import NewConferenceForm from "./NewConferenceForm";

export default async function NewConference({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return (
    <div className="flex justify-center">
      <NewConferenceForm lng={lng} />
    </div>
  );
}
