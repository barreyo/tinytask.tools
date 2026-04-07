import { diffLines, diffWords } from 'diff';

export type DiffMode = 'lines' | 'words';

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  /** Line numbers in the original (left) text, 1-based, null for added-only lines */
  leftLineNum: number | null;
  /** Line numbers in the modified (right) text, 1-based, null for removed-only lines */
  rightLineNum: number | null;
}

export interface InlineDiffSegment {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

export function computeLineDiff(original: string, modified: string): DiffLine[] {
  const changes = diffLines(original, modified);
  const result: DiffLine[] = [];
  let leftLine = 1;
  let rightLine = 1;

  for (const change of changes) {
    const lines = change.value.split('\n');
    // diffLines includes a trailing empty string if value ends with \n
    const effectiveLines = lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines;

    for (const line of effectiveLines) {
      if (change.added) {
        result.push({ type: 'added', value: line, leftLineNum: null, rightLineNum: rightLine++ });
      } else if (change.removed) {
        result.push({ type: 'removed', value: line, leftLineNum: leftLine++, rightLineNum: null });
      } else {
        result.push({
          type: 'unchanged',
          value: line,
          leftLineNum: leftLine++,
          rightLineNum: rightLine++,
        });
      }
    }
  }

  return result;
}

export function computeWordDiff(original: string, modified: string): InlineDiffSegment[] {
  const changes = diffWords(original, modified);
  return changes.map((c) => ({
    type: c.added ? 'added' : c.removed ? 'removed' : 'unchanged',
    value: c.value,
  }));
}

export function hasDiff(original: string, modified: string): boolean {
  if (original === modified) return false;
  const changes = diffLines(original, modified);
  return changes.some((c) => c.added || c.removed);
}
