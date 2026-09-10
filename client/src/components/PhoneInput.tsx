"use client";
import { cn } from "@/lib/utilsClient";
import { parsePhone } from "@/lib/phone";
import { useState, type AriaAttributes, type Ref } from "react";
interface PhoneInputProps extends AriaAttributes {
  id?: string;
  name?: string;
  value?: string | null;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  ref?: Ref<HTMLInputElement>;
}
function splitPhone(value?: string | null) {
  const phone = parsePhone(value ?? "");
  return {
    code: phone ? `+${phone.countryCallingCode}` : "+421",
    number: phone?.nationalNumber?.toString() ?? "",
  };
}
export default function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  ref,
  ...props
}: PhoneInputProps) {
  const [previous, setPrevious] = useState(value);
  const [phoneField, setPhoneField] = useState(() => splitPhone(value));
  if (previous !== value) {
    setPrevious(value);
    setPhoneField(splitPhone(value));
  }
  function change(next: { code: string; number: string }) {
    const value = next.number ? `${next.code}${next.number}` : undefined;
    setPrevious(value);
    setPhoneField(next);
    onChange(value);
  }
  return (
    <div
      className={cn([
        "border-none shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 rounded-md w-full flex mt-1 focus-within:ring-2",
        "dark:bg-gray-800 dark:ring-gray-600",
        props["aria-invalid"]
          ? "ring-red-500 dark:ring-red-500 focus-within:ring-red-500"
          : "focus-within:ring-primary-500 dark:focus-within:ring-primary-300 ring-gray-300",
        disabled &&
          "disabled:bg-slate-50 disabled:text-slate-500 disabled:ring-slate-200 disabled:shadow-none",
      ])}
    >
      <div className="flex items-center p-1">
        <label htmlFor={`${id}-code`} className="sr-only">
          Country code
        </label>
        <select
          className="py-px pr-6 bg-transparent border-transparent focus:border-transparent focus:ring-0 sm:text-sm/6 rounded-l-lg h-7 dark:text-white dark:bg-gray-800"
          disabled={disabled}
          id={`${id}-code`}
          aria-label="Country code"
          onChange={(e) => change({ ...phoneField, code: e.target.value })}
          value={phoneField.code}
        >
          <option value={"+421"}>SK +421</option>
          <option value={"+420"}>CZ +420</option>
          <option value={"+36"}>HU +36</option>
          <option value={"+48"}>PL +48</option>
          <option value={"+380"}>UA +380</option>
          <option value={"+43"}>AT +43</option>
          <option value={"+44"}>UK +44</option>
          <option value={"+385"}>HR +385</option>
          <option value={"+33"}>FR +33</option>
          <option value={"+389"}>MK +389</option>
          <option value={"+32"}>BE +32</option> {/* Belgium */}
          <option value={"+359"}>BG +359</option> {/* Bulgaria */}
          <option value={"+385"}>HR +385</option> {/* Croatia */}
          <option value={"+357"}>CY +357</option> {/* Cyprus */}
          <option value={"+45"}>DK +45</option> {/* Denmark */}
          <option value={"+372"}>EE +372</option> {/* Estonia */}
          <option value={"+358"}>FI +358</option> {/* Finland */}
          <option value={"+33"}>FR +33</option> {/* France */}
          <option value={"+49"}>DE +49</option> {/* Germany */}
          <option value={"+30"}>GR +30</option> {/* Greece */}
          <option value={"+353"}>IE +353</option> {/* Ireland */}
          <option value={"+39"}>IT +39</option> {/* Italy */}
          <option value={"+371"}>LV +371</option> {/* Latvia */}
          <option value={"+370"}>LT +370</option> {/* Lithuania */}
          <option value={"+352"}>LU +352</option> {/* Luxembourg */}
          <option value={"+356"}>MT +356</option> {/* Malta */}
          <option value={"+31"}>NL +31</option> {/* Netherlands */}
          <option value={"+351"}>PT +351</option> {/* Portugal */}
          <option value={"+40"}>RO +40</option> {/* Romania */}
          <option value={"+386"}>SI +386</option> {/* Slovenia */}
          <option value={"+34"}>ES +34</option> {/* Spain */}
          <option value={"+46"}>SE +46</option> {/* Sweden */}
        </select>
      </div>
      <input
        disabled={disabled}
        type="tel"
        {...props}
        ref={ref}
        id={id}
        className="w-full h-9 sm:text-sm/6 rounded-r-lg py-1.5 text-gray-900 dark:text-white border-transparent focus:border-transparent focus:ring-0 bg-transparent"
        onBlur={() => {
          onBlur?.();
        }}
        autoComplete="off"
        value={phoneField.number}
        onChange={(e) => change({ ...phoneField, number: e.target.value })}
      />
    </div>
  );
}
