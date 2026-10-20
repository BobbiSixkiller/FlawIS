import "./helpers/dom";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement, createRef } from "react";
import { PasswordInput } from "../src/components/password-input";
import { Button } from "../src/components/ui/button";

afterEach(cleanup);

test("password visibility preserves the field value and ref without submitting its form", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLInputElement>();
  let submissions = 0;
  const view = render(
    createElement(
      "form",
      {
        onSubmit: (event) => {
          event.preventDefault();
          submissions++;
        },
      },
      createElement(PasswordInput, {
        ref,
        name: "password",
        "aria-label": "Password",
      }),
      createElement(Button, { type: "submit" }, "Save"),
    ),
  );

  const input = view.getByLabelText("Password") as HTMLInputElement;
  assert.ok(ref.current === input);
  await user.type(input, "example-password");
  await user.click(view.getByRole("button", { name: "Show password" }));
  assert.equal(input.type, "text");
  assert.equal(input.value, "example-password");
  await user.click(view.getByRole("button", { name: "Hide password" }));
  assert.equal(input.type, "password");
  assert.equal(submissions, 0);
  await user.click(view.getByRole("button", { name: "Save" }));
  assert.equal(submissions, 1);
});

test("primitive buttons submit forms only when explicitly configured to submit", async () => {
  const user = userEvent.setup();
  let submissions = 0;
  const view = render(
    createElement(
      "form",
      {
        onSubmit: (event) => {
          event.preventDefault();
          submissions++;
        },
      },
      createElement(Button, null, "Cancel"),
      createElement(Button, { type: "submit" }, "Save"),
    ),
  );
  await user.click(view.getByRole("button", { name: "Cancel" }));
  assert.equal(submissions, 0);
  await user.click(view.getByRole("button", { name: "Save" }));
  assert.equal(submissions, 1);
});
