/** Card template options */
export type CardTemplate =
  | "classic"
  | "split"
  | "minimal"
  | "right-anchor"
  | "center-focus"
  | "text-over-logo"
  | "text-under-logo";

/** Card color scheme options */
export type CardColorScheme = "forest" | "ocean" | "sunset" | "slate" | "modern-black" | "classic-ivory" | "royal-plum" | "neon-cyan" | "earth-clay" | "mint-paper" | "rose-gold" | "midnight-amber" | "skyline" | "mono-paper";

/** Card sort option */
export type CardSortOption = "name-asc" | "name-desc" | "company-asc" | "company-desc" | "color";

/** Server card structure */
export type ServerCard = {
  id: string;
  name: string;
  company: string | null;
  template: CardTemplate;
  colorScheme: CardColorScheme;
  logoImage: string | null;
  jobTitle: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  phones: { value: string }[];
  emails: { value: string }[];
  websites: { value: string }[];
};

/** Import card payload */
export type ImportCardPayload = {
  name: string;
  company: string | null;
  template: CardTemplate;
  colorScheme: CardColorScheme;
  logoImage: string | null;
  jobTitle: string | null;
  address: string | null;
  notes: string | null;
  phoneNumbers: string[];
  emails: string[];
  websites: string[];
  confidence: null;
  rawText: null;
  imageUrl: null;
};