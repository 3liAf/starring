import { useState, type ReactNode } from 'react';

interface Props<T> {
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  title: (item: T, i: number) => string;
  meta?: (item: T) => ReactNode;
  render: (item: T, update: (patch: Partial<T>) => void, i: number) => ReactNode;
  addLabel: string;
  empty: string;
  /** index → has validation issues */
  invalid?: (i: number) => boolean;
  onRemove?: (item: T, i: number) => void;
}

const move = <T,>(arr: T[], from: number, to: number) => {
  const next = [...arr];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

/** Collapsible, drag-sortable cards with move / duplicate / delete. */
export default function ListEditor<T>({ items, onChange, make, title, meta, render, addLabel, empty, invalid, onRemove }: Props<T>) {
  const [open, setOpen] = useState<number | null>(items.length === 1 ? 0 : null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const update = (i: number) => (patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    onChange(move(items, from, to));
    setOpen((o) => (o === from ? to : o === to ? from : o));
  };

  return (
    <div className="ed-list">
      {items.length === 0 && <p className="ed-empty">{empty}</p>}
      {items.map((it, i) => (
        <div
          key={i}
          className={`ed-card${open === i ? ' open' : ''}${over === i && drag !== i ? ' drop' : ''}${drag === i ? ' dragging' : ''}${invalid?.(i) ? ' invalid' : ''}`}
          onDragOver={(e) => { if (drag !== null) { e.preventDefault(); setOver(i); } }}
          onDragLeave={() => setOver((o) => (o === i ? null : o))}
          onDrop={(e) => { e.preventDefault(); if (drag !== null) reorder(drag, i); setDrag(null); setOver(null); }}
        >
          <div className="ed-card-head">
            <span
              className="ed-grip"
              draggable
              title="Drag to reorder"
              onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); }}
              onDragEnd={() => { setDrag(null); setOver(null); }}
              aria-hidden="true"
            >⋮⋮</span>
            <button type="button" className="ed-card-title" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <span className="ed-card-name">{title(it, i) || <em>Untitled</em>}</span>
              {meta && <span className="ed-card-meta">{meta(it)}</span>}
            </button>
            <div className="ed-card-tools">
              <button type="button" title="Move up" aria-label="Move up" disabled={i === 0} onClick={() => reorder(i, i - 1)}>↑</button>
              <button type="button" title="Move down" aria-label="Move down" disabled={i === items.length - 1} onClick={() => reorder(i, i + 1)}>↓</button>
              <button type="button" title="Duplicate" aria-label="Duplicate" onClick={() => { onChange([...items.slice(0, i + 1), structuredClone(it), ...items.slice(i + 1)]); setOpen(i + 1); }}>⧉</button>
              <button type="button" title="Delete" aria-label="Delete" className="danger" onClick={() => { onRemove?.(it, i); onChange(items.filter((_, j) => j !== i)); setOpen(null); }}>✕</button>
            </div>
          </div>
          {open === i && <div className="ed-card-body">{render(it, update(i), i)}</div>}
        </div>
      ))}
      <button type="button" className="ed-add" onClick={() => { onChange([...items, make()]); setOpen(items.length); }}>
        + {addLabel}
      </button>
    </div>
  );
}
