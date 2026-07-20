type IconName = "arrow" | "check" | "clock" | "layers" | "locate" | "minus" | "plus" | "swap";

type IconProps = {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  check: <path d="m6.5 12 3.5 3.5 7.5-8" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  layers: <><path d="m12 3.5 8.5 4.7L12 13 3.5 8.2 12 3.5Z" /><path d="m4 12.3 8 4.4 8-4.4M4 16.4l8 4.1 8-4.1" /></>,
  locate: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3" /></>,
  minus: <path d="M6 12h12" />,
  plus: <><path d="M6 12h12" /><path d="M12 6v12" /></>,
  swap: <><path d="M8 7h9l-2.5-2.5M16 17H7l2.5 2.5" /></>,
};

export function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
