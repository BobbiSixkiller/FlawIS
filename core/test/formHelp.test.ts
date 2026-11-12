import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";
import { getModelForClass } from "@typegoose/typegoose";
import { Form, FieldType } from "../src/entitites/Form";
import { FormService } from "../src/services/form.service";
import type { ClientSession } from "mongoose";

const unsafe =
  '<p><strong>Instructions</strong> <a href="https://example.com">More</a><img src=x onerror=alert(1)></p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>';
const Model = getModelForClass(Form);

test("legacy help is sanitized on all form reads without modifying historical versions", async () => {
  const form = new Model({
    definition: new ObjectId(),
    version: 1,
    fields: [{ type: FieldType.Text, label: "Question", helpText: unsafe }],
  });
  const service = new FormService(
    { findOne: async () => form, findAll: async () => [form] } as any,
    {} as any,
    { findOne: async () => ({ form: form._id }) } as any,
    {} as any,
    {} as any,
  );
  const results = [
    await service.getForm(form._id),
    ...(await service.versions(form.definition)),
    await service.bound("COURSE", new ObjectId()),
  ];
  for (const result of results) {
    const html = result.fields[0].helpText!;
    assert.match(html, /<strong>Instructions<\/strong>/);
    assert.match(html, /href="https:\/\/example.com"/);
    assert.doesNotMatch(html, /<script|<img|onerror|javascript:/);
  }
  assert.equal(form.fields[0].helpText, unsafe);
  assert.equal(form.version, 1);
});

test("publishing sanitizes help while retaining question identity and choices", async () => {
  let stored: any;
  const definition = new ObjectId(),
    id = new ObjectId();
  const service = new FormService(
    {
      create: async (data: unknown) => {
        stored = data;
        return new Model(data);
      },
    } as any,
    { findOneAndUpdate: async () => ({ latestVersion: 4 }) } as any,
    {} as any,
    {} as any,
    {} as any,
  );
  const fields = [
    {
      id,
      type: FieldType.RadioGroup,
      label: "Decision",
      required: true,
      helpText: unsafe,
      selectOptions: [{ value: "YES", text: "Yes" }],
    },
  ];
  const published = await service.publish(
    definition,
    fields,
    {} as ClientSession,
  );
  assert.equal(published.version, 4);
  assert.equal(String(published.fields[0].id), String(id));
  assert.deepEqual(published.fields[0].selectOptions, fields[0].selectOptions);
  assert.doesNotMatch(
    stored.fields[0].helpText,
    /<script|<img|onerror|javascript:/,
  );
  assert.equal(fields[0].helpText, unsafe);
});
