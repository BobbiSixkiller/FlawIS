const MAX_COMPARISON_PARAGRAPHS = 5000,
  MAX_COMPARISON_CHARACTERS = 400000;

type Operation = { kind: "same" | "remove" | "add"; text: string };

export type ComparisonRow = {
  before: string | null;
  after: string | null;
  changed: boolean;
};

export type ManuscriptComparison = {
  rows: ComparisonRow[];
  added: number;
  removed: number;
  unchanged: number;
  coarse: boolean;
};

export function compareManuscripts(
  before: string[],
  after: string[],
): ManuscriptComparison {
  if (
    [before, after].some(
      (p) =>
        p.length > MAX_COMPARISON_PARAGRAPHS ||
        p.reduce((n, s) => n + s.length, 0) > MAX_COMPARISON_CHARACTERS,
    )
  )
    throw new Error("Rukopis je príliš veľký na online porovnanie.");
  const operations: Operation[] = [];
  let remainingCells = 1_000_000,
    coarse = false;
  const emit = (kind: Operation["kind"], text: string) =>
    operations.push({ kind, text });

  function range(a0: number, a1: number, b0: number, b1: number, depth = 0) {
    while (a0 < a1 && b0 < b1 && before[a0] === after[b0]) {
      emit("same", before[a0++]);
      b0++;
    }

    let suffix = 0;

    while (a0 < a1 && b0 < b1 && before[a1 - 1] === after[b1 - 1]) {
      suffix++;
      a1--;
      b1--;
    }

    const n = a1 - a0,
      m = b1 - b0,
      cells = (n + 1) * (m + 1);

    if (!n) for (let j = b0; j < b1; j++) emit("add", after[j]);
    else if (!m) for (let i = a0; i < a1; i++) emit("remove", before[i]);
    else if (cells <= Math.min(remainingCells, 400_000)) {
      remainingCells -= cells;

      const table = new Uint16Array(cells),
        width = m + 1;

      for (let i = n - 1; i >= 0; i--)
        for (let j = m - 1; j >= 0; j--)
          table[i * width + j] =
            before[a0 + i] === after[b0 + j]
              ? 1 + table[(i + 1) * width + j + 1]
              : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
      let i = 0,
        j = 0;

      while (i < n || j < m) {
        if (i < n && j < m && before[a0 + i] === after[b0 + j]) {
          emit("same", before[a0 + i++]);
          j++;
        } else if (
          i < n &&
          (j === m || table[(i + 1) * width + j] >= table[i * width + j + 1])
        )
          emit("remove", before[a0 + i++]);
        else emit("add", after[b0 + j++]);
      }
    } else {
      const old = new Map<string, number>(),
        next = new Map<string, number>();

      for (let i = a0; i < a1; i++)
        old.set(before[i], old.has(before[i]) ? -1 : i);
      for (let j = b0; j < b1; j++)
        next.set(after[j], next.has(after[j]) ? -1 : j);
      const pairs: [number, number][] = [];

      for (const [text, i] of old) {
        const j = next.get(text);
        if (i >= 0 && j !== undefined && j >= 0) pairs.push([i, j]);
      }

      const tails: number[] = [],
        predecessors: number[] = [];

      for (let i = 0; i < pairs.length; i++) {
        let lo = 0,
          hi = tails.length;

        while (lo < hi) {
          const mid = (lo + hi) >>> 1;

          if (pairs[tails[mid]][1] < pairs[i][1]) lo = mid + 1;
          else hi = mid;
        }

        predecessors[i] = lo ? tails[lo - 1] : -1;
        tails[lo] = i;
      }

      const anchors: [number, number][] = [];
      for (let i = tails[tails.length - 1] ?? -1; i >= 0; i = predecessors[i])
        anchors.push(pairs[i]);
      anchors.reverse();

      if (!anchors.length || depth >= 24) {
        coarse = true;
        for (let i = a0; i < a1; i++) emit("remove", before[i]);
        for (let j = b0; j < b1; j++) emit("add", after[j]);
      } else {
        let x = a0,
          y = b0;

        for (const [i, j] of anchors) {
          range(x, i, y, j, depth + 1);
          emit("same", before[i]);
          x = i + 1;
          y = j + 1;
        }

        range(x, a1, y, b1, depth + 1);
      }
    }

    for (let i = 0; i < suffix; i++) emit("same", before[a1 + i]);
  }

  range(0, before.length, 0, after.length);
  const rows: ComparisonRow[] = [];
  let added = 0,
    removed = 0,
    unchanged = 0;

  for (let i = 0; i < operations.length;) {
    if (operations[i].kind === "same") {
      rows.push({
        before: operations[i].text,
        after: operations[i].text,
        changed: false,
      });

      unchanged++;
      i++;
      continue;
    }

    const left: string[] = [],
      right: string[] = [];

    while (i < operations.length && operations[i].kind !== "same") {
      const op = operations[i++];

      if (op.kind === "remove") {
        left.push(op.text);
        removed++;
      } else {
        right.push(op.text);
        added++;
      }
    }

    for (let j = 0; j < Math.max(left.length, right.length); j++)
      rows.push({
        before: left[j] ?? null,
        after: right[j] ?? null,
        changed: true,
      });
  }

  return { rows, added, removed, unchanged, coarse };
}
