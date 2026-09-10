import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/sk",
  pretendToBeVisual: true,
});
for (const name of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "HTMLButtonElement",
  "HTMLSelectElement",
  "Node",
  "NodeFilter",
  "Element",
  "MutationObserver",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "CustomEvent",
  "DOMParser",
  "DocumentFragment",
  "HTMLFieldSetElement",
  "FileList",
]) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value:
      name === "window"
        ? dom.window
        : name === "document"
          ? dom.window.document
          : (dom.window as unknown as Record<string, unknown>)[name],
  });
}
Object.assign(globalThis, {
  getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
  requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
  cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  IntersectionObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  IS_REACT_ACT_ENVIRONMENT: true,
});
HTMLElement.prototype.scrollIntoView = () => {};
