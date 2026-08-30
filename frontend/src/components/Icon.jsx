export default function Icon({ name, size = 20, strokeWidth = 1.8, className = '', title }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6"/></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    down: <path d="m6 9 6 6 6-6"/>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    phone: <path d="M6.5 3h3l1.2 5-2.1 1.3c1.3 2.8 3.3 4.8 6.1 6.1l1.3-2.1 5 1.2v3c0 2-1.5 3.5-3.5 3.5C9.5 21 3 14.5 3 6.5 3 4.5 4.5 3 6.5 3Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    edit: <><path d="m14 5 5 5M4 20l3.7-.8L19 7.9a2 2 0 0 0-2.9-2.9L4.8 16.3Z"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
    filter: <><path d="M4 5h16l-6 7v6l-4 2v-8Z"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    back: <><path d="M19 12H5M10 7l-5 5 5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    warning: <><path d="M12 3 2 21h20Z"/><path d="M12 9v5M12 18h.01"/></>,
    heart: <path d="M20.8 5.8a5.3 5.3 0 0 0-7.5 0L12 7.1l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z"/>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>,
    leaf: <><path d="M20 4C10 4 5 8 5 14c0 4 3 6 6 6 7 0 9-8 9-16Z"/><path d="M4 21c3-5 7-8 12-11"/></>,
    tractor: <><path d="M4 14V9h8l3 5h3M8 9V6h5l2 3M3 14h17"/><circle cx="6" cy="17" r="3"/><circle cx="17" cy="17" r="2"/></>,
    wheat: <><path d="M12 22V7M12 12C8 11 7 8 7 5c3 0 5 2 5 5M12 16c-4-1-5-4-5-7M12 12c4-1 5-4 5-7-3 0-5 2-5 5M12 16c4-1 5-4 5-7"/></>,
    grape: <><path d="M14 5c2-2 4-2 6-1-1 3-3 4-6 3M12 3c2 2 2 4 1 6"/><circle cx="10" cy="11" r="3"/><circle cx="15" cy="11" r="3"/><circle cx="8" cy="16" r="3"/><circle cx="13" cy="16" r="3"/><circle cx="11" cy="20" r="2"/></>,
    cow: <><path d="M5 9 3 6c3 0 4 1 5 3M19 9l2-3c-3 0-4 1-5 3"/><path d="M7 8c2-2 8-2 10 0l1 7c0 4-3 6-6 6s-6-2-6-6Z"/><circle cx="9" cy="13" r=".6"/><circle cx="15" cy="13" r=".6"/><path d="M9 17c2 1 4 1 6 0"/></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 15c3.5 0 5.5 1.7 6 5"/></>,
    tag: <><path d="m3 12 9 9 9-9-9-9H3Z"/><circle cx="8" cy="8" r="1"/></>,
    eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 4"/></>,
  };

  return (
    <svg
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title && <title>{title}</title>}
      {paths[name] || paths.leaf}
    </svg>
  );
}
