import type { ComponentPropsWithRef } from "react";
import AcademicCapIcon from "@heroicons/react/24/outline/AcademicCapIcon";
import ArrowDownTrayIcon from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import ArrowLeftStartOnRectangleIcon from "@heroicons/react/24/outline/ArrowLeftStartOnRectangleIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import ArrowRightStartOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightStartOnRectangleIcon";
import ArrowsRightLeftIcon from "@heroicons/react/24/outline/ArrowsRightLeftIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import Bars3CenterLeftIcon from "@heroicons/react/24/outline/Bars3CenterLeftIcon";
import BoldIcon from "@heroicons/react/24/outline/BoldIcon";
import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import BuildingLibraryIcon from "@heroicons/react/24/outline/BuildingLibraryIcon";
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon";
import ChatBubbleBottomCenterTextIcon from "@heroicons/react/24/outline/ChatBubbleBottomCenterTextIcon";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronDownIconSolid from "@heroicons/react/20/solid/ChevronDownIcon";
import ChevronLeftIcon from "@heroicons/react/24/outline/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
import CodeBracketIcon from "@heroicons/react/24/outline/CodeBracketIcon";
import ComputerDesktopIcon from "@heroicons/react/24/outline/ComputerDesktopIcon";
import DocumentArrowDownIcon from "@heroicons/react/24/outline/DocumentArrowDownIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import EllipsisHorizontalIcon from "@heroicons/react/24/outline/EllipsisHorizontalIcon";
import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import EyeSlashIcon from "@heroicons/react/24/outline/EyeSlashIcon";
import FolderOpenIcon from "@heroicons/react/24/outline/FolderOpenIcon";
import FunnelIcon from "@heroicons/react/24/outline/FunnelIcon";
import H1Icon from "@heroicons/react/24/outline/H1Icon";
import H2Icon from "@heroicons/react/24/outline/H2Icon";
import H3Icon from "@heroicons/react/24/outline/H3Icon";
import HomeIcon from "@heroicons/react/24/outline/HomeIcon";
import InboxArrowDownIcon from "@heroicons/react/24/outline/InboxArrowDownIcon";
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";
import ItalicIcon from "@heroicons/react/24/outline/ItalicIcon";
import LinkIcon from "@heroicons/react/24/outline/LinkIcon";
import ListBulletIcon from "@heroicons/react/24/outline/ListBulletIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import NumberedListIcon from "@heroicons/react/24/outline/NumberedListIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import PhoneIcon from "@heroicons/react/24/outline/PhoneIcon";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import SlashIcon from "@heroicons/react/24/outline/SlashIcon";
import StrikethroughIcon from "@heroicons/react/24/outline/StrikethroughIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import TableCellsIcon from "@heroicons/react/24/outline/TableCellsIcon";
import TagIcon from "@heroicons/react/24/outline/TagIcon";
import TicketIcon from "@heroicons/react/24/outline/TicketIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import UnderlineIcon from "@heroicons/react/24/outline/UnderlineIcon";
import UserIcon from "@heroicons/react/24/outline/UserIcon";
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import XMarkIconSolid from "@heroicons/react/20/solid/XMarkIcon";

type SvgIconProps = Omit<
  ComponentPropsWithRef<"svg">,
  "children" | "dangerouslySetInnerHTML"
>;

function SpinnerGlyph(props: SvgIconProps) {
  return (
    <svg viewBox="3 3 18 18" {...props}>
      <path
        className="opacity-20"
        d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
      />
      <path d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z" />
    </svg>
  );
}

function GoogleGlyph(props: SvgIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function CheckCircleGlyph(props: SvgIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Provider imports and glyph selection live here; callers use only IconName.
const icons = {
  "academic-cap": AcademicCapIcon,
  "arrow-down-tray": ArrowDownTrayIcon,
  "arrow-left-start-on-rectangle": ArrowLeftStartOnRectangleIcon,
  "arrow-path": ArrowPathIcon,
  "arrow-right-start-on-rectangle": ArrowRightStartOnRectangleIcon,
  "arrows-right-left": ArrowsRightLeftIcon,
  "bars3": Bars3Icon,
  "bars3-center-left": Bars3CenterLeftIcon,
  "bold": BoldIcon,
  "briefcase": BriefcaseIcon,
  "building-library": BuildingLibraryIcon,
  "calendar-days": CalendarDaysIcon,
  "chat-bubble-bottom-center-text": ChatBubbleBottomCenterTextIcon,
  "check": CheckIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-down-solid": ChevronDownIconSolid,
  "chevron-left": ChevronLeftIcon,
  "chevron-right": ChevronRightIcon,
  "chevron-up": ChevronUpIcon,
  "code-bracket": CodeBracketIcon,
  "computer-desktop": ComputerDesktopIcon,
  "document-arrow-down": DocumentArrowDownIcon,
  "document-text": DocumentTextIcon,
  "ellipsis-horizontal": EllipsisHorizontalIcon,
  "envelope": EnvelopeIcon,
  "exclamation-circle": ExclamationCircleIcon,
  "eye": EyeIcon,
  "eye-slash": EyeSlashIcon,
  "folder-open": FolderOpenIcon,
  "funnel": FunnelIcon,
  "h1": H1Icon,
  "h2": H2Icon,
  "h3": H3Icon,
  "home": HomeIcon,
  "inbox-arrow-down": InboxArrowDownIcon,
  "information-circle": InformationCircleIcon,
  "italic": ItalicIcon,
  "link": LinkIcon,
  "list-bullet": ListBulletIcon,
  "magnifying-glass": MagnifyingGlassIcon,
  "map-pin": MapPinIcon,
  "moon": MoonIcon,
  "numbered-list": NumberedListIcon,
  "pencil": PencilIcon,
  "phone": PhoneIcon,
  "plus": PlusIcon,
  "slash": SlashIcon,
  "strikethrough": StrikethroughIcon,
  "sun": SunIcon,
  "table-cells": TableCellsIcon,
  "tag": TagIcon,
  "ticket": TicketIcon,
  "trash": TrashIcon,
  "underline": UnderlineIcon,
  "user": UserIcon,
  "user-circle": UserCircleIcon,
  "user-group": UserGroupIcon,
  "users": UsersIcon,
  "x-mark": XMarkIcon,
  "x-mark-solid": XMarkIconSolid,
  spinner: SpinnerGlyph,
  google: GoogleGlyph,
  "check-circle": CheckCircleGlyph,
} as const;

export type IconName = keyof typeof icons;

export type IconProps = SvgIconProps & { name: IconName };

export function Icon({
  name,
  "aria-hidden": ariaHidden,
  role,
  focusable = false,
  ...props
}: IconProps) {
  const Glyph = icons[name];
  const hasLabel = Boolean(
    props["aria-label"]?.trim() || props["aria-labelledby"]?.trim(),
  );
  const hidden = ariaHidden ?? !hasLabel;

  return (
    <Glyph
      {...props}
      aria-hidden={hidden}
      role={role ?? (hidden === false || hidden === "false" ? "img" : undefined)}
      focusable={focusable}
    />
  );
}

export default Icon;
