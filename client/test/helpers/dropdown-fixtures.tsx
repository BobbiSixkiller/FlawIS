import { Suspense, type Ref, type ReactElement } from "react";
import Dropdown from "../../src/components/Dropdown";
import ExportButton from "../../src/components/ExportButton";
import ModalTrigger from "../../src/components/ModalTrigger";

// Next.js can stream labels and icons into a client ModalTrigger.
const streamedContent = Promise.resolve(<>Streamed edit</>);
const streamedLink = Promise.resolve(<a href="#streamed">Streamed link</a>);

export function StreamedLinkDropdown() {
  return (
    <Suspense fallback="Loading links">
      <Dropdown
        trigger="Streamed links"
        // Model the runtime value delivered across the RSC boundary.
        items={[streamedLink as unknown as ReactElement]}
      />
    </Suspense>
  );
}

export function StreamedActionDropdown({
  buttonRef,
}: {
  buttonRef: Ref<HTMLButtonElement>;
}) {
  return (
    <Suspense fallback="Loading action">
      <Dropdown
        trigger="Streamed actions"
        items={[
          <ModalTrigger key="edit" dialogId="streamed-edit" ref={buttonRef}>
            {streamedContent}
          </ModalTrigger>,
        ]}
      />
    </Suspense>
  );
}

export function LanguageDropdown({ onClick }: { onClick: () => void }) {
  return (
    <Dropdown
      trigger="Language"
      items={[
        <a key="en" href="#english" onClick={onClick}>
          English
        </a>,
      ]}
    />
  );
}

export function ActionDropdown({
  onClick,
  buttonRef,
}: {
  onClick: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}) {
  return (
    <Dropdown
      trigger="Actions"
      items={[
        <ModalTrigger
          key="edit"
          dialogId="edit"
          ref={buttonRef}
          onClick={onClick}
        >
          Edit
        </ModalTrigger>,
        <ExportButton key="export" fetchUrl="/export" />,
      ]}
    />
  );
}
