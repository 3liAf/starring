import { useId, useRef, useState, type ReactNode } from 'react';

interface FieldProps { label: string; hint?: string; error?: string; children: ReactNode; wide?: boolean }

export function Field({ label, hint, error, children, wide }: FieldProps) {
  return (
    <label className={`ed-field${wide ? ' wide' : ''}${error ? ' has-error' : ''}`}>
      <span className="ed-label">{label}</span>
      {children}
      {error ? <span className="ed-error">{error}</span> : hint ? <span className="ed-hint">{hint}</span> : null}
    </label>
  );
}

type Base = { label: string; hint?: string; error?: string; wide?: boolean };

export function Text({ value, onChange, placeholder, ...f }: Base & { value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field {...f}>
      <input className="ed-input" value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Area({ value, onChange, placeholder, max, ...f }: Base & { value?: string; onChange: (v: string) => void; placeholder?: string; max?: number }) {
  const len = value?.length ?? 0;
  return (
    <Field {...f} hint={max ? `${len}/${max}${f.hint ? ` · ${f.hint}` : ''}` : f.hint}>
      <textarea
        className={`ed-input ed-area${max && len > max ? ' over' : ''}`}
        rows={3}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Num({ value, onChange, min, max, placeholder, ...f }: Base & { value?: number | null; onChange: (v: number) => void; min?: number; max?: number; placeholder?: string }) {
  return (
    <Field {...f}>
      <input
        className="ed-input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
    </Field>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked?: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="ed-toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="ed-switch" aria-hidden="true" />
      <span>
        <span className="ed-toggle-label">{label}</span>
        {hint && <span className="ed-hint">{hint}</span>}
      </span>
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; hint?: string }[]; onChange: (v: T) => void; label: string }) {
  const name = useId();
  return (
    <div className="ed-field wide" role="radiogroup" aria-label={label}>
      <span className="ed-label">{label}</span>
      <div className="ed-seg">
        {options.map((o) => (
          <label key={o.id} className={value === o.id ? 'on' : ''} title={o.hint}>
            <input type="radio" name={name} checked={value === o.id} onChange={() => onChange(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

/** Tag input: Enter / comma adds, Backspace on empty removes last, click × removes. */
export function Chips({ value = [], onChange, suggestions = [], placeholder = 'Type and press Enter', ...f }: Base & { value?: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const add = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean).filter((s) => !value.includes(s));
    if (parts.length) onChange([...value, ...parts]);
    setDraft('');
  };
  const free = suggestions.filter((s) => !value.includes(s));
  return (
    <Field {...f}>
      <div className="ed-chips" onClick={() => input.current?.focus()}>
        {value.map((c, i) => (
          <span className="ed-chip" key={c}>
            {c}
            <button type="button" aria-label={`Remove ${c}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
        <input
          ref={input}
          list={free.length ? listId : undefined}
          value={draft}
          placeholder={value.length ? '' : placeholder}
          onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(draft); }
            if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
        />
        {free.length > 0 && <datalist id={listId}>{free.map((s) => <option key={s} value={s} />)}</datalist>}
      </div>
    </Field>
  );
}

/** Text input with suggestions (e.g. pick a client you already added). */
export function Combo({ value, onChange, options, ...f }: Base & { value?: string; onChange: (v: string) => void; options: string[] }) {
  const id = useId();
  return (
    <Field {...f}>
      <input className="ed-input" list={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      <datalist id={id}>{options.map((o) => <option key={o} value={o} />)}</datalist>
    </Field>
  );
}
