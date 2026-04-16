type IconProps = {
  size?: number;
};

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2,
  viewBox: "0 0 24 24",
};

export function CalendarDaysIcon({ size = 18 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <line x1="8" x2="8" y1="14" y2="14" />
      <line x1="12" x2="12" y1="14" y2="14" />
      <line x1="16" x2="16" y1="14" y2="14" />
      <line x1="8" x2="8" y1="18" y2="18" />
      <line x1="12" x2="12" y1="18" y2="18" />
    </svg>
  );
}

export function HistoryIcon({ size = 20 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function HouseIcon({ size = 20 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function PiggyBankIcon({ size = 18 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="M19 5c-1.5-1-3.5-1.5-5.5-1.5-4.7 0-8.5 2.9-8.5 6.5 0 1.4.6 2.7 1.7 3.8L5 19h4l1-2h5l1 2h3l-1.2-3.1c1.3-1 2.2-2.4 2.2-3.9 0-1.1-.4-2.1-1-3" />
      <path d="M16 8h.01" />
      <path d="M2 8h3" />
    </svg>
  );
}

export function ReceiptIcon({ size = 20 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="M4 3h16v18l-2-1.5L16 21l-2-1.5L12 21l-2-1.5L8 21l-2-1.5L4 21V3Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

export function TagIcon({ size = 18 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="m20 12-8 8-9-9V4h7l10 8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </svg>
  );
}

export function Trash2Icon({ size = 18 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function TriangleAlertIcon({ size = 18 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function TrendingUpIcon({ size = 18 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

export function WalletIcon({ size = 20 }: IconProps) {
  return (
    <svg {...baseProps} height={size} width={size}>
      <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v2H5a2 2 0 0 0 0 4h13v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M18 9h3v4h-3a2 2 0 0 1 0-4Z" />
    </svg>
  );
}
