import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeRichText } from "../src/util/sanitizeRichText";

test("rich text preserves the classes serialized by the Tiptap extensions", () => {
  const html = `
    <h1 class="dark:text-white/85 font-normal">Heading 1</h1>
    <h2 class="dark:text-white/85 font-normal">Heading 2</h2>
    <h3 class="dark:text-white/85 font-normal">Heading 3</h3>
    <h4 class="dark:text-white/85 font-normal">Heading 4</h4>
    <h5 class="dark:text-white/85 font-normal">Heading 5</h5>
    <h6 class="dark:text-white/85 font-normal">Heading 6</h6>
    <p class="dark:text-gray-300"><strong class="dark:text-white/85">Bold</strong> and <em>emphasis</em></p>
    <ul class="list-disc list-outside leading-3 dark:text-gray-300 marker:text-primary-500 dark:marker:text-primary-300"><li class="leading-normal"><p class="dark:text-gray-300">Bullet</p></li></ul>
    <ol class="list-decimal list-outside leading-3 dark:text-gray-300 marker:text-primary-500 dark:marker:text-primary-300"><li class="leading-normal"><p class="dark:text-gray-300">Number</p></li></ol>
    <blockquote class="border-l-2 border-primary-500 dark:border-primary-300 pl-4"><p class="dark:text-gray-300">Quote</p></blockquote>
    <pre class="rounded-md bg-gray-300/30 text-gray-900 border p-3 font-mono font-medium"><code>Block code</code></pre>
    <p class="dark:text-gray-300"><code class="rounded-md bg-gray-300/30 px-1.5 py-1 font-mono font-medium">Inline code</code></p>
    <hr class="mt-4 mb-6 border-t">
    <a href="https://example.com" class="hover:underline text-primary-500 hover:text-primary-500/90 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-primary-300 dark:hover:text-primary-200 dark:focus:ring-offset-gray-900 dark:focus:ring-primary-300">Link</a>
  `;

  assert.equal(sanitizeRichText(html), html);
  assert.equal(sanitizeRichText(sanitizeRichText(html)), html);
});

test("rich text preserves legacy editor link and bold classes", () => {
  const html = '<a class="focus:outline-none dark:text-primary-300" href="mailto:test@example.com"><b class="dark:text-white/85">Contact</b></a>';

  assert.equal(sanitizeRichText(html), html);
});

test("rich text retains only exact allowed classes for each element", () => {
  const html = `
    <p class="dark:text-gray-300 hidden fixed inset-0 z-50 dark:text-red-500 dark:text-gray-300/0 font-normal">Paragraph</p>
    <h2 class="dark:text-white/85 font-normal dark:text-gray-300">Heading</h2>
    <ul class="list-disc list-decimal dark:marker:text-primary-300"><li class="leading-normal list-disc">Item</li></ul>
    <a class="dark:text-primary-300 dark:text-white/85" href="https://example.com">Link</a>
    <p class="[&_*]:hidden bg-[url(https://example.com/image)] dark:[display:none]">Arbitrary utilities</p>
    <p class="dark:text-gray-300&quot;onclick=&quot;alert(1)">Encoded attribute</p>
    <em class="dark:text-gray-300">Unstyled mark</em>
  `;

  assert.equal(sanitizeRichText(html), `
    <p class="dark:text-gray-300">Paragraph</p>
    <h2 class="dark:text-white/85 font-normal">Heading</h2>
    <ul class="list-disc dark:marker:text-primary-300"><li class="leading-normal">Item</li></ul>
    <a class="dark:text-primary-300" href="https://example.com">Link</a>
    <p>Arbitrary utilities</p>
    <p>Encoded attribute</p>
    <em>Unstyled mark</em>
  `);
});

test("rich text normalizes whitespace and duplicate allowed classes", () => {
  assert.equal(
    sanitizeRichText('<h2 class="  dark:text-white/85\tfont-normal\n dark:text-white/85  ">Heading</h2><p class=" "></p>'),
    '<h2 class="dark:text-white/85 font-normal">Heading</h2><p></p>',
  );
});

test("allowing editor classes still removes executable HTML and unsafe links", () => {
  const html = `
    <p class="dark:text-gray-300" onclick="alert(1)" style="position:fixed" id="overlay">Text</p>
    <a class="text-primary-500 dark:text-primary-300" href="javascript:alert(1)" onmouseover="alert(1)">Unsafe</a>
    <a class="dark:text-primary-300" href="jav&#x61;script:alert(1)">Encoded URL</a>
    <a class="dark:text-primary-300" href="data:text/html,test">Data URL</a>
    <script class="dark:text-gray-300">alert(1)</script><style>.dark { display:none }</style>
    <img class="dark:text-gray-300" src=x onerror="alert(1)"><svg onload="alert(1)"></svg>
  `;
  const sanitized = sanitizeRichText(html);

  assert.match(sanitized, /<p class="dark:text-gray-300">Text<\/p>/);
  assert.match(sanitized, /<a class="text-primary-500 dark:text-primary-300">Unsafe<\/a>/);
  assert.doesNotMatch(sanitized, /onclick|onmouseover|onerror|onload|style|id=|href=|script|<img|<svg|alert\(1\)/i);
  assert.equal(sanitizeRichText(sanitized), sanitized);
});
