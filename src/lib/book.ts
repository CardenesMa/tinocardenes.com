import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

// The running order of the book. Recordings are expanded into one spread each,
// sorted by their `order` field. To add a text section, create a Markdown file
// in src/content/sections and list its file name here.
const OUTLINE = [
  { kind: 'cover' },
  { kind: 'contents', preface: 'preface' },
  { kind: 'section', id: 'biography' },
  { kind: 'works' },
  { kind: 'section', id: 'sonicscore' },
  { kind: 'recordings' },
  { kind: 'back' },
] as const;

type SpreadBody =
  | { kind: 'cover' }
  | { kind: 'contents'; preface: CollectionEntry<'sections'> }
  | { kind: 'section'; entry: CollectionEntry<'sections'> }
  | { kind: 'works'; works: CollectionEntry<'works'>[] }
  | { kind: 'recording'; entry: CollectionEntry<'recordings'> }
  | { kind: 'back' };

export type Spread = SpreadBody & {
  /** Anchor id, used as the URL hash. */
  id: string;
  title: string;
  /** Page numbers on the left and right of this spread (null where there is no page). */
  left: number | null;
  right: number | null;
};

export interface TocEntry {
  id: string;
  title: string;
  detail?: string;
  page: number;
  group?: string;
}

async function section(id: string) {
  const entry = await getEntry('sections', id);
  if (!entry) throw new Error(`OUTLINE references missing section "${id}" (src/content/sections/${id}.md)`);
  return entry;
}

export async function getBook() {
  const bodies: (SpreadBody & { id: string; title: string })[] = [];

  for (const item of OUTLINE) {
    switch (item.kind) {
      case 'cover':
        bodies.push({ kind: 'cover', id: 'cover', title: 'Cover' });
        break;
      case 'contents':
        bodies.push({ kind: 'contents', id: 'contents', title: 'Contents', preface: await section(item.preface) });
        break;
      case 'section': {
        const entry = await section(item.id);
        bodies.push({ kind: 'section', id: entry.id, title: entry.data.title, entry });
        break;
      }
      case 'works': {
        const works = (await getCollection('works')).sort((a, b) => a.data.order - b.data.order);
        bodies.push({ kind: 'works', id: 'works', title: 'Works', works });
        break;
      }
      case 'recordings': {
        const recordings = (await getCollection('recordings')).sort((a, b) => a.data.order - b.data.order);
        for (const entry of recordings) {
          bodies.push({ kind: 'recording', id: entry.id, title: entry.data.title, entry });
        }
        break;
      }
      case 'back':
        bodies.push({ kind: 'back', id: 'back', title: 'Back cover' });
        break;
    }
  }

  // Number pages like a bound book: the cover is a lone right-hand page 1,
  // every spread after it is an even left page and an odd right page, and
  // the back cover is a lone left-hand page.
  let next = 1;
  const spreads: Spread[] = bodies.map((body) => {
    if (body.kind === 'cover') return { ...body, left: null, right: next++ };
    if (body.kind === 'back') return { ...body, left: next++, right: null };
    const left = next++;
    const right = next++;
    return { ...body, left, right };
  });

  const toc: TocEntry[] = [];
  for (const s of spreads) {
    if (s.kind === 'contents') toc.push({ id: s.id, title: s.preface.data.title, page: s.right! });
    if (s.kind === 'section' || s.kind === 'works') toc.push({ id: s.id, title: s.title, page: s.left! });
    if (s.kind === 'recording') {
      toc.push({ id: s.id, title: s.title, detail: s.entry.data.attribution, page: s.left!, group: 'Recordings' });
    }
  }

  return { spreads, toc, pageCount: next - 1 };
}

/** Human-readable page range for a spread, e.g. "4–5" or "1". */
export function pageLabel(s: Pick<Spread, 'left' | 'right'>) {
  return [s.left, s.right].filter((n) => n !== null).join('–');
}
