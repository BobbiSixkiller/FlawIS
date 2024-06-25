"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useFormState } from "react-dom";
import { getGoogleAuthLink, register } from "../actions";
import { useContext, useEffect, useState } from "react";
import { Trans } from "react-i18next";

import Button from "@/components/Button";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";

export default function RegisterForm({
  lng,
  url,
}: {
  lng: string;
  url?: string;
}) {
  const { t } = useTranslation(lng, "register");

  const [state, formAction] = useFormState(register, {
    success: false,
    message: "",
  });

  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");

  useEffect(() => {
    if (email.includes("uniba")) {
      setOrg(t("flaw"));
    }
  }, [email, lng, t]);

  const { dispatch } = useContext(MessageContext);

  useEffect(() => {
    if (state?.message && !state.success) {
      dispatch({
        type: ActionTypes.SetFormMsg,
        payload: state,
      });
    }
    if (state?.message && state.success) {
      dispatch({
        type: ActionTypes.SetAppMsg,
        payload: state,
      });
    }
  }, [state]);

  return (
    <form className="space-y-6 mt-4" action={formAction}>
      <div>
        <input type="hidden" name="url" value={url} />
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("name")}
        </label>
        <div className="mt-2">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("email")}
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="telephone"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("phone")}
        </label>
        <div className="mt-2">
          <input
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="organization"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("org")}
        </label>
        <div className="mt-2">
          <input
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            id="organization"
            name="organization"
            type="text"
            autoComplete="organization"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("password")}
        </label>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {t("repeatPass")}
        </label>
        <div className="mt-2">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-500 rounded-md"
        />
        <label
          htmlFor="privacy"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          <Trans
            i18nKey={"privacy"}
            t={t}
            components={{
              privacy: (
                <a
                  target="_blank"
                  href="https://uniba.sk/ochrana-osobnych-udajov/"
                  className="text-sm font-semibold text-primary-500 hover:text-primary-700 focus:outline-primary-500"
                />
              ),
            }}
          />
        </label>
      </div>
      <Button color="primary" type="submit" fluid loadingText={t("submitting")}>
        {t("submit")}
      </Button>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 font-light text-sm">
          {t("continue")}
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => getGoogleAuthLink()}
          className="text-sm rounded-md border border-gray-300 hover:border-primary-500  px-3.5 py-2 w-32 flex gap-2 justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="30"
            height="30"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          Google
        </button>
        {/* <button className="text-sm rounded-md border border-gray-300 hover:border-primary-500 px-3.5 py-2 w-32 flex gap-2 justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="30"
            height="30"
            viewBox="0 0 48 48"
          >
            <path
              fill="#039be5"
              d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"
            ></path>
            <path
              fill="#fff"
              d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"
            ></path>
          </svg>
          Facebook
        </button> */}
      </div>
    </form>
  );
}
