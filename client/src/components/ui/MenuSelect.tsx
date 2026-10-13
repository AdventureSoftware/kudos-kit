'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

export interface MenuOption<T extends string> {
  value: T;
  label: string;
}

interface MenuSelectProps<T extends string> {
  value: T;
  options: Array<MenuOption<T>>;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  align?: 'left' | 'right';
}


type MenuPosition = { top: number; left?: number; right?: number; minWidth: number };

const GAP = 4;


export function MenuSelect<T extends string>({ value, options, onChange, label, className, align = 'left' }: MenuSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const [pos, setPos] = useState<MenuPosition | null>(null);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const current = options[selectedIndex];

  const openMenu = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };
  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };
  const pick = (index: number) => {
    const option = options[index];
    close();
    if (option && option.value !== value) onChange(option.value);
  };


  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      const button = buttonRef.current?.getBoundingClientRect();
      if (!button) return;
      const height = listRef.current?.offsetHeight ?? 0;
      const roomBelow = window.innerHeight - button.bottom;
      const up = roomBelow < height + GAP * 2 && button.top > roomBelow;
      setPos({
        top: up ? button.top - height - GAP : button.bottom + GAP,
        ...(align === 'right' ? { right: window.innerWidth - button.right } : { left: button.left }),
        minWidth: button.width,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true); // true: also when a table or panel scrolls
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, align]);


  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(last, i + 1)),
      ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => pick(active),
      ' ': () => pick(active),
      Escape: () => close(),
      Tab: () => close(),
    };
    const action = keys[e.key];
    if (!action) return;
    if (e.key !== 'Tab') e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current?.label ?? ''}`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          'inline-flex h-9 w-full min-w-36 cursor-pointer items-center justify-between gap-2 rounded-ui border bg-surface px-3 text-sm text-text',
          open ? 'border-accent' : 'border-border hover:border-muted',
        )}
      >
        <span className="truncate">{current?.label}</span>
        <svg aria-hidden viewBox="0 0 20 20" className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && createPortal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          style={{ position: 'fixed', ...pos, opacity: pos ? 1 : 0 }}
          className="kk-fade-in z-50 overflow-hidden rounded-ui border border-border bg-surface py-1 shadow-lg focus:outline-none"
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(i)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 whitespace-nowrap px-3 py-1.5 text-sm',
                  i === active && 'bg-surface-muted',
                  selected ? 'font-medium text-text' : 'text-text',
                )}
              >
                <svg aria-hidden viewBox="0 0 20 20" className={cn('h-4 w-4 shrink-0 text-accent', !selected && 'invisible')} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m5 10.5 3.2 3L15 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {o.label}
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </div>
  );
}
