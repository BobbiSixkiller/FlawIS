"use client";

import { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Input } from "@headlessui/react";

export default function PhoneInput({
  label,
  disabled,
  name,
}: {
  name: string;
  label?: string;
  disabled?: boolean;
}) {
  const { field, fieldState } = useController({
    name,
  });

  console.log(field.value);

  const [focus, setFocus] = useState(false);
  const [phoneField, setPhoneField] = useState({
    code: parsePhoneNumberFromString(field.value)?.countryCallingCode
      ? `+${parsePhoneNumberFromString(field.value)?.countryCallingCode}`
      : "+421",
    number: parsePhoneNumberFromString(field.value)?.nationalNumber || "",
  });

  useEffect(() => {
    if (phoneField.code && phoneField.number) {
      field.onChange(Object.values(phoneField).join().replace(",", ""));
    } else field.onChange();
  }, [phoneField]);

  return (
    <div>
      {label && (
        <label htmlFor={name} className="text-sm/6 font-medium">
          {label}
        </label>
      )}
      <div
        className={`border-none shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 ${
          fieldState.error ? "ring-red-500" : ""
        } ${focus && fieldState.error ? "ring-2" : ""} ${
          focus && !fieldState.error ? "ring-2 ring-primary-500" : ""
        } rounded-lg w-full flex mt-1 ${
          disabled
            ? "disabled:bg-slate-50 disabled:text-slate-500 disabled:ring-slate-200 disabled:shadow-none"
            : ""
        }`}
      >
        <div className="flex items-center">
          <label htmlFor="code" className="sr-only">
            Country code
          </label>
          <select
            className="py-1.5 pr-6 bg-transparent border-transparent focus:border-transparent focus:ring-0 sm:text-sm/6 rounded-l-lg h-9"
            disabled={disabled}
            id="code"
            name="code"
            onChange={(e) =>
              setPhoneField({ ...phoneField, code: e.target.value })
            }
            onClick={() => setFocus(true)}
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
        <Input
          disabled={disabled}
          type="number"
          ref={field.ref}
          id={name}
          className="w-full h-9 sm:text-sm/6 rounded-r-lg py-1.5 text-gray-900 border-transparent focus:border-transparent focus:ring-0 bg-transparent"
          onFocus={() => setFocus(true)}
          onBlur={() => {
            setFocus(false);
            field.onBlur();
          }}
          autoComplete="off"
          value={phoneField.number}
          onChange={(e) =>
            setPhoneField({ ...phoneField, number: e.target.value })
          }
        />
      </div>
      {fieldState.error && (
        <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}