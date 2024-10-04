"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useFormState } from "react-dom";
import { getGoogleAuthLink, login } from "../actions";
import { Trans } from "../../../../../node_modules/react-i18next";
import Link from "next/link";
import Button from "@/components/Button";
import { useContext, useEffect } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";

export default function LoginForm({ lng, url }: { lng: string; url?: string }) {
  const [state, formAction] = useFormState(login, {
    success: false,
    message: "",
  });

  const { t } = useTranslation(lng, "login");

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
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            {t("password")}
          </label>
          <Trans
            i18nKey={"forgot"}
            t={t}
            components={[
              <Link
                href="/forgotPassword"
                className="text-sm font-semibold text-primary-500 hover:text-primary-700 focus:outline-primary-500"
                key={0}
              />,
            ]}
          />
        </div>
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
          type="button"
          onClick={() => getGoogleAuthLink(url)}
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
        {/* <button
          type="button"
          onClick={() => getMsalAuthLink(url)}
          className="text-sm rounded-md border border-gray-300 hover:border-primary-500 px-3.5 py-2 w-32 flex gap-2 justify-center items-center"
        >
          <svg
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
          >
            <g fillRule="nonzero">
              <path
                d="M52.091 10.225h40.684L50.541 135.361a6.5 6.5 0 01-6.146 4.412H12.732c-3.553 0-6.477-2.923-6.477-6.476 0-.704.115-1.403.34-2.07L45.944 14.638a6.501 6.501 0 016.147-4.415v.002z"
                fill="url(#prefix___Linear1)"
                transform="translate(2.076 1.626) scale(3.37462)"
              />
              <path
                d="M377.371 319.374H159.644c-5.527 0-10.076 4.549-10.076 10.077 0 2.794 1.164 5.466 3.206 7.37l139.901 130.577a21.986 21.986 0 0015.004 5.91H430.96l-53.589-153.934z"
                fill="#0078d4"
              />
              <path
                d="M52.091 10.225a6.447 6.447 0 00-6.161 4.498L6.644 131.12a6.457 6.457 0 00-.38 2.185c0 3.548 2.92 6.468 6.469 6.468H45.23a6.95 6.95 0 005.328-4.531l7.834-23.089 27.985 26.102a6.622 6.622 0 004.165 1.518h36.395l-15.962-45.615-46.533.011 28.48-83.944H52.091z"
                fill="url(#prefix___Linear2)"
                transform="translate(2.076 1.626) scale(3.37462)"
              />
              <path
                d="M104.055 14.631a6.492 6.492 0 00-6.138-4.406H52.575a6.493 6.493 0 016.138 4.406l39.35 116.594c.225.668.34 1.367.34 2.072 0 3.554-2.924 6.478-6.478 6.478h45.344c3.553-.001 6.476-2.925 6.476-6.478 0-.705-.115-1.404-.34-2.072l-39.35-116.594z"
                fill="url(#prefix___Linear3)"
                transform="translate(2.076 1.626) scale(3.37462)"
              />
            </g>
            <defs>
              <linearGradient
                id="prefix___Linear1"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
                gradientUnits="userSpaceOnUse"
                gradientTransform="rotate(108.701 26.35 33.911) scale(131.7791)"
              >
                <stop offset="0" stopColor="#114a8b" />
                <stop offset="1" stopColor="#0669bc" />
              </linearGradient>
              <linearGradient
                id="prefix___Linear2"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
                gradientUnits="userSpaceOnUse"
                gradientTransform="rotate(161.318 33.644 45.587) scale(10.31703)"
              >
                <stop offset="0" stopOpacity=".3" />
                <stop offset=".07" stopOpacity=".2" />
                <stop offset=".32" stopOpacity=".1" />
                <stop offset=".62" stopOpacity=".05" />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix___Linear3"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
                gradientUnits="userSpaceOnUse"
                gradientTransform="rotate(69.426 25.69 62.036) scale(131.9816)"
              >
                <stop offset="0" stopColor="#3ccbf4" />
                <stop offset="1" stopColor="#2892df" />
              </linearGradient>
            </defs>
          </svg>
          Microsoft
        </button> */}
      </div>
    </form>
  );
}
