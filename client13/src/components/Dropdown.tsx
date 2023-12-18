import { Menu, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

export function DropdownItem({
  children,
  handleClick,
}: {
  children: ReactNode;
  handleClick?: () => void;
}) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={handleClick}
          className={`${
            active ? "bg-primary-500 text-white" : "text-gray-900"
          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
}

export default function Dropdown({ trigger, children }: DropdownProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="h-full px-2 py-1 flex items-center rounded hover:bg-gray-700 hover:bg-opacity-10">
        {trigger}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 min-w-max w-32 origin-top-right rounded-md bg-white shadow-lg divide-y divide-gray-100 ring-1 ring-black/5 focus:outline-none">
          {children}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
