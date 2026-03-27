import { CardTemplate, CardColorScheme } from './types';

/** Template options for card styling */
export const TEMPLATE_OPTIONS: { value: CardTemplate; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "split", label: "Split Accent" },
  { value: "minimal", label: "Minimal" },
  { value: "right-anchor", label: "Right Logo" },
  { value: "center-focus", label: "Focus" },
  { value: "text-over-logo", label: "Z Pattern" },
  { value: "text-under-logo", label: "Centered" }
];

/** Color scheme options for card styling */
export const COLOR_SCHEME_OPTIONS: { value: CardColorScheme; label: string }[] = [
  { value: "forest", label: "Forest" },
  { value: "ocean", label: "Ocean" },
  { value: "sunset", label: "Sunset" },
  { value: "slate", label: "Slate" },
  { value: "modern-black", label: "Modern Black" },
  { value: "classic-ivory", label: "Classic Ivory" },
  { value: "royal-plum", label: "Royal Plum" },
  { value: "neon-cyan", label: "Neon Cyan" },
  { value: "earth-clay", label: "Earth Clay" },
  { value: "mint-paper", label: "Mint Paper" },
  { value: "rose-gold", label: "Rose Gold" },
  { value: "midnight-amber", label: "Midnight Amber" },
  { value: "skyline", label: "Skyline" },
  { value: "mono-paper", label: "Mono Paper" }
];