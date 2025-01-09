import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Fragment, ReactNode } from "react";

interface DrawerProps {
  title?: string | ReactNode;
  children: ReactNode;
  visible: boolean;
  setVisible: (val: boolean) => void;
  rounded?: boolean;
  toggleStart?: "left" | "right" | "top" | "bottom";
  size?: "md" | "sm" | "xs";
}

const drawerSize = (size: string) => {
  switch (size) {
    case "xs":
      return "max-w-xs";
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";

    default:
      throw new Error("Invalid size prop!");
  }
};

export default function Drawer({
  title,
  children,
  visible,
  setVisible,
  rounded = false,
  toggleStart = "right",
  size = "sm",
}: DrawerProps) {
  const drawerStyles = () => {
    switch (toggleStart) {
      case "right":
        return {
          transition: {
            enterFrom: "translate-x-full",
            enterTo: "translate-x-0",
            leaveFrom: "translate-x-0",
            leaveTo: "translate-x-full",
          },
          dialogContainer:
            "pointer-events-none flex max-w-full fixed inset-y-0 right-0 pl-10",
          dialogPanel: `pointer-events-auto overflow-y-auto w-screen ${drawerSize(
            size
          )} ${rounded ? "rounded-l-3xl" : ""}`,
        };
      case "left":
        return {
          transition: {
            enterFrom: "-translate-x-full",
            enterTo: "translate-x-0",
            leaveFrom: "translate-x-0",
            leaveTo: "-translate-x-full",
          },
          dialogContainer:
            "pointer-events-none flex max-w-full fixed inset-y-0 left-0 pr-10",
          dialogPanel: `pointer-events-auto overflow-y-auto w-screen ${drawerSize(
            size
          )} ${rounded ? "rounded-r-3xl" : ""}`,
        };
      case "top":
        return {
          transition: {
            enterFrom: "-translate-y-full",
            enterTo: "translate-y-0",
            leaveFrom: "translate-y-0",
            leaveTo: "-translate-y-full",
          },
          dialogContainer:
            "pointer-events-none flex max-w-full fixed inset-x-0 top-0",
          dialogPanel: `pointer-events-auto overflow-y-auto w-screen h-fit max-h-96 ${
            rounded ? "rounded-b-3xl" : ""
          }`,
        };
      case "bottom":
        return {
          transition: {
            enterFrom: "translate-y-full",
            enterTo: "translate-y-0",
            leaveFrom: "translate-y-0",
            leaveTo: "translate-y-full",
          },
          dialogContainer:
            "pointer-events-none flex max-w-full fixed inset-x-0 bottom-0",
          dialogPanel: `pointer-events-auto overflow-y-auto w-screen max-h-96 ${
            rounded ? "rounded-t-3xl" : ""
          }`,
        };
      default:
        throw new Error("Unhandled toggleStart prop!");
    }
  };

  return (
    <Transition show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-20"
        onClose={() => setVisible(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={drawerStyles().dialogContainer}>
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom={drawerStyles().transition.enterFrom}
                enterTo={drawerStyles().transition.enterTo}
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom={drawerStyles().transition.leaveFrom}
                leaveTo={drawerStyles().transition.leaveTo}
              >
                <DialogPanel className={drawerStyles().dialogPanel}>
                  <div className="h-full flex flex-col gap-6 bg-primary-500 text-white shadow-xl px-4 py-6 sm:px-6">
                    <div className="sticky top-6 flex justify-between">
                      {title && (
                        <DialogTitle className="text-lg font-medium">
                          {title}
                        </DialogTitle>
                      )}
                      <div className="flex h-7 items-center">
                        <button
                          type="button"
                          className="relative -m-2 p-2 hover:text-primary-700 outline-none	focus:ring-2 focus:ring-inset focus:ring-white rounded-md"
                          onClick={() => setVisible(false)}
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 overflow-y-scroll pointer-events-auto">
                      {children}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
