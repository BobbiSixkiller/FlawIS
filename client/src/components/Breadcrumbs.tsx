"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";
import { getLocalizedPath, stripPathLocale } from "@/lib/i18n/settings";
import Button from "./Button";

const linkClassName =
  "flex min-h-9 items-center rounded-sm text-primary-500 outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-primary-300";
const trailClassName = "flex items-center gap-2 whitespace-nowrap";
const itemClassName = "flex min-w-0 items-center gap-2";

type Crumb = { href: string; label: string };
type DisplayMode = "full" | "collapsed" | "minimal";

function Separator() {
  return (
    <span aria-hidden="true" className="shrink-0 text-gray-400">
      /
    </span>
  );
}

function FullPath({ items, label }: { items: Crumb[]; label: string }) {
  const [open, setOpen] = useState(false);
  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, {
    mouseOnly: true,
    delay: { close: 150 },
    handleClose: safePolygon(),
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <Button
        ref={setReference}
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-full"
        aria-label={label}
        {...getReferenceProps()}
      >
        <span aria-hidden="true">…</span>
      </Button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={-1}
          >
            <div
              ref={setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              aria-label={label}
              className="z-50 max-h-[60vh] w-72 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-white/85"
            >
              <ol className="flex flex-col">
                {items.map((item, index) => (
                  <li key={item.href}>
                    {index === items.length - 1 ? (
                      <span
                        aria-current="page"
                        className="flex min-h-11 items-center break-all rounded-lg px-3 py-2 font-medium"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`${linkClassName} min-h-11 break-all rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

export default function Breadcrumbs({
  homeElement,
}: {
  homeElement: ReactNode;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "dashboard");
  const pathname = usePathname();
  const segments = stripPathLocale(pathname).split("/").filter(Boolean);
  const items = segments.map((segment, index) => {
    const translated = t(segment);
    return {
      href: getLocalizedPath(`/${segments.slice(0, index + 1).join("/")}`, lng),
      label: translated.charAt(0).toUpperCase() + translated.slice(1),
    };
  });
  const home = { href: getLocalizedPath("/", lng), label: t("home") };
  const current = items.at(-1);
  const trailKey = JSON.stringify([home, ...items]);
  const containerRef = useRef<HTMLElement>(null);
  const fullRef = useRef<HTMLOListElement>(null);
  const prefixRef = useRef<HTMLOListElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<DisplayMode>("full");

  useEffect(() => {
    const container = containerRef.current;
    const full = fullRef.current;
    const prefix = prefixRef.current;
    if (!container || !full || !prefix) return;

    const measure = () => {
      const width = container.getBoundingClientRect().width;
      const currentWidth =
        currentRef.current?.getBoundingClientRect().width ?? 0;
      const minimumLabelWidth = Math.min(currentWidth, 20);
      if (full.getBoundingClientRect().width <= width) {
        setMode("full");
      } else if (
        prefix.getBoundingClientRect().width + 8 + minimumLabelWidth <=
        width
      ) {
        setMode(items.length > 1 ? "collapsed" : "full");
      } else {
        setMode("minimal");
      }
    };

    // Observe the natural trail as well as its allotted width so fonts, translations,
    // and expanding header actions cannot leave a stale collapse decision.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(full);
    observer.observe(prefix);
    measure();
    return () => observer.disconnect();
  }, [trailKey, items.length]);

  const showHome = !current || mode !== "minimal";
  const showEllipsis =
    !!current &&
    (mode === "minimal" || (mode === "collapsed" && items.length > 1));
  const visibleItems = mode === "full" ? items : current ? [current] : [];

  return (
    <nav
      ref={containerRef}
      aria-label={t("breadcrumbs.label")}
      className="relative min-w-0 flex-1 text-sm dark:text-white/85"
    >
      <ol className={`${trailClassName} overflow-hidden`}>
        {showHome && (
          <li className="shrink-0">
            <Link
              href={home.href}
              aria-label={home.label}
              aria-current={!current ? "page" : undefined}
              className={linkClassName}
            >
              {homeElement}
            </Link>
          </li>
        )}
        {showEllipsis && (
          <li className={`${itemClassName} shrink-0`}>
            {showHome && <Separator />}
            <FullPath
              key={trailKey}
              items={[home, ...items]}
              label={t("breadcrumbs.showFullPath")}
            />
          </li>
        )}
        {visibleItems.map((item) => (
          <li key={item.href} className={itemClassName}>
            <Separator />
            {item === current ? (
              <span
                aria-current="page"
                title={item.label}
                className="block min-w-0 truncate"
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={linkClassName}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {/* Noninteractive, clipped copies measure intrinsic widths without affecting layout. */}
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none invisible absolute inset-0 overflow-hidden"
      >
        <ol ref={fullRef} className={`${trailClassName} w-max`}>
          <li className="shrink-0">
            <span className={linkClassName}>{homeElement}</span>
          </li>
          {items.map((item) => (
            <li key={item.href} className={itemClassName}>
              <Separator />
              <span
                ref={item === current ? currentRef : undefined}
                className="flex min-h-9 items-center"
              >
                {item.label}
              </span>
            </li>
          ))}
        </ol>
        <ol ref={prefixRef} className={`${trailClassName} w-max`}>
          <li className="shrink-0">
            <span className={linkClassName}>{homeElement}</span>
          </li>
          {items.length > 1 && (
            <li className={itemClassName}>
              <Separator />
              <span className="size-9 shrink-0" />
            </li>
          )}
          <li>
            <Separator />
          </li>
        </ol>
      </div>
    </nav>
  );
}
