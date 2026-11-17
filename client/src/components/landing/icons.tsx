
export function Icon({ children, className = 'size-5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden>
      {children}
    </svg>
  );
}


export const TYPE_ICONS = {
  bug: <><path d="M8 6.5V5a4 4 0 0 1 8 0v1.5" /><rect x="6" y="6.5" width="12" height="13" rx="6" /><path d="M12 10v9.5M6 12H2.5M21.5 12H18M6.5 17l-3 2M17.5 17l3 2M6.5 8 4 6M17.5 8 20 6" /></>,
  idea: <><path d="M9 18h6M10 21.5h4" /><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.3 1 2.1v.3h6v-.3c0-.8.4-1.6 1-2.1a6.5 6.5 0 0 0-4-11.6z" /></>,
  praise: <path d="M12 20.5s-8.5-4.9-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11-8.5 11z" />,
  other: <><path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z" /><path d="M8 10.5h8M8 13.5h5" /></>,
};

export const CHAT_ICON = <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />;
