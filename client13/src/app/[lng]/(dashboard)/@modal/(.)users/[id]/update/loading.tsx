import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <Modal title={"gsgs"}>
      <div className="h-full flex flex-col items-center justify-center">
        <Spinner />
      </div>
    </Modal>
  );
}
