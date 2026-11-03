export type OverlayAnchor =
  | "top"
  | "bottom"
  | "top start"
  | "top end"
  | "bottom start"
  | "bottom end"
  | {
      to:
        | "top"
        | "bottom"
        | "top start"
        | "top end"
        | "bottom start"
        | "bottom end";
      gap?: number;
      padding?: number;
    };
export function overlayPosition(anchor: OverlayAnchor = "bottom end") {
  const [side, align = "center"] = (
    typeof anchor === "string" ? anchor : anchor.to
  ).split(" ");
  return {
    side: side as "top" | "bottom",
    align: align as "start" | "center" | "end",
    sideOffset: typeof anchor === "string" ? 6 : (anchor.gap ?? 6),
  };
}
