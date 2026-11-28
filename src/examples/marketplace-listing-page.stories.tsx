/*
 * Examples / Marketplace listing page
 *
 * One real product screen rebuilt from the shared components: Perkcord's community header
 * (brand, site search, the sliding navigation, member actions) over the marketplace browse
 * results page (heading, search and sort toolbar, applied filters, filter rail, listing card
 * grid, end of results) on the perkcord glass brand and its backdrop. All content is invented.
 *
 * The page lays out from its own width with container queries (@5xl is the product's lg,
 * 1024px; @3xl its md; @7xl its xl), so the Narrow story is a phone layout at any viewport.
 *
 * Gaps: built locally in this file because the system has no shared part for them.
 * - Site header shell: brand mark and name, three-column header grid, the bar the sliding
 *   navigation's indicator sits on.
 * - Phone bottom navigation bar (five destinations, the centred Post item).
 * - Listing card: photo area, two-line title, price line, seller line with rating.
 * - Price display (amount, "Open to trades", parts-only line) and the star rating figure.
 * - Collapsible filter section (no Accordion or Collapsible in the system; native <details>).
 * - Single-choice category list with a selected row.
 * - Price range: the product's two-thumb slider has no shared equivalent; two inputs here.
 * - Removable applied-filter chip.
 * - Inline separator dot and plain text links in the results heading.
 * - Photo placeholders (inline SVG shapes).
 * Where a shared component looked wrong next to the original:
 * - Button and Input stop at 36px and 32px; the product's controls are 44px (min-h-11).
 * - SlidingNavLink has fixed padding; the product sets each link's track width.
 * - Spinner stands in for the product's three bouncing dots over loading results.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChevronDownIcon,
  MailIcon,
  MenuIcon,
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidingNav, SlidingNavLink } from "@/components/ui/sliding-tabs";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ---- Invented content --------------------------------------------------------------------

type Shape = "lamp" | "shelf" | "pair" | "shade" | "clip" | "base" | "none";

type Listing = {
  id: string;
  title: string;
  price?: string;
  trade?: boolean;
  openToTrades?: boolean;
  wants?: string;
  parts?: string;
  condition: string;
  seller: string;
  rating?: { figure: string; count: number };
  exchanges?: number;
  shape: Shape;
};

const listings: Listing[] = [
  {
    id: "1",
    title: "Brass desk lamp with linen shade",
    price: "$45",
    condition: "Like new",
    seller: "Sample Seller",
    rating: { figure: "4.9", count: 12 },
    shape: "lamp",
  },
  {
    id: "2",
    title: "Pair of ceramic table lamps, matching bases and spare bulbs",
    price: "$60",
    openToTrades: true,
    condition: "Good",
    seller: "Example Member",
    rating: { figure: "4.7", count: 5 },
    shape: "pair",
  },
  {
    id: "3",
    title: "Folding reading lamp",
    trade: true,
    wants: "Looking for a small wool rug or a side table",
    condition: "Good",
    seller: "Placeholder Trader",
    exchanges: 3,
    shape: "clip",
  },
  {
    id: "4",
    title: "Pendant lamp shade, unused",
    price: "$25",
    condition: "Factory sealed",
    seller: "Demo Member",
    rating: { figure: "5.0", count: 2 },
    shape: "shade",
  },
  {
    id: "5",
    title: "Floor lamp with dimmer",
    price: "$85",
    condition: "Fair",
    seller: "Sample Seller",
    rating: { figure: "4.9", count: 12 },
    shape: "none",
  },
  {
    id: "6",
    title: "Lamp base, needs rewiring",
    price: "$15",
    parts: "Wiring",
    condition: "For parts",
    seller: "Test Account",
    shape: "base",
  },
  {
    id: "7",
    title: "Oak bookshelf with a built-in reading lamp",
    price: "$120",
    condition: "Good",
    seller: "Example Member",
    rating: { figure: "4.7", count: 5 },
    shape: "shelf",
  },
  {
    id: "8",
    title: "Clip-on work lamp",
    price: "Free",
    condition: "Like new",
    seller: "Demo Member",
    rating: { figure: "5.0", count: 2 },
    shape: "clip",
  },
];

const appliedFilters = ["Like new", "Good", "Lighting"];

// ---- Header (gap: site header shell) -----------------------------------------------------

function BrandHomeLink() {
  return (
    <a
      href="#"
      className="flex min-h-11 min-w-0 items-center gap-2 no-underline @min-[40rem]:gap-3"
    >
      <div
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-lg font-semibold text-primary"
      >
        S
      </div>
      <p className="min-w-0 truncate text-sm font-semibold text-foreground @min-[40rem]:text-base">
        Sample community
      </p>
    </a>
  );
}

const siteTabs = ["Marketplace", "Wiki", "Forum", "Membership"];

function CommunityHeader() {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-b border-border pb-2 @5xl:grid-cols-[minmax(3.25rem,auto)_minmax(min-content,1fr)_auto] @5xl:gap-x-3 @5xl:pb-3">
      <BrandHomeLink />
      <div className="contents @5xl:flex @5xl:min-w-0 @5xl:items-center @5xl:justify-around @5xl:gap-3">
        <div className="min-w-0 @5xl:w-full @5xl:max-w-64 @5xl:min-w-28">
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Search the site"
            className="@5xl:hidden"
          >
            <SearchIcon />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="hidden w-full justify-start text-muted-foreground @5xl:inline-flex"
          >
            <SearchIcon />
            Search
            <Kbd className="ms-auto">/</Kbd>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="icon-lg" className="@5xl:hidden" />}
            aria-label="Open community menu"
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Sample community</SheetTitle>
            </SheetHeader>
            <nav aria-label="Community" className="grid gap-1 px-4">
              {siteTabs.map((tab) => (
                <a key={tab} href="#" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                  {tab}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        {/* The links run 12px into the header's bottom padding, so the indicator sits on the rule. */}
        <div className="hidden @5xl:flex @5xl:min-w-max @5xl:items-center">
          <SlidingNav aria-label="Community" className="-mb-3">
            {siteTabs.map((tab) => (
              <SlidingNavLink
                key={tab}
                href="#"
                active={tab === "Marketplace"}
                className="h-14 pb-3"
              >
                {tab}
              </SlidingNavLink>
            ))}
          </SlidingNav>
        </div>
      </div>
      <div className="hidden @5xl:flex @5xl:items-center @5xl:justify-end @5xl:gap-3">
        <nav aria-label="Marketplace" className="flex items-center gap-1.5">
          <a
            href="#"
            aria-label="Messages"
            className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
          >
            <MailIcon />
          </a>
          <a href="#" className={buttonVariants({ size: "lg" })}>
            <PlusIcon data-icon="inline-start" />
            Post item
          </a>
        </nav>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="lg" />}>
            <Avatar size="sm">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            Sample member
            <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Saved listings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ---- Phone bottom navigation (gap) -------------------------------------------------------

const dock = [
  { label: "Marketplace", icon: SearchIcon, current: true },
  { label: "Forum", icon: MessageSquareIcon },
  { label: "Post item", icon: PlusIcon, post: true },
  { label: "Messages", icon: MailIcon },
  { label: "Account", icon: UserIcon },
];

function MobileDock() {
  return (
    <nav
      aria-label="Marketplace"
      className="sticky bottom-0 z-30 -mx-4 mt-8 grid min-h-[3.625rem] grid-cols-5 border-t border-border bg-background px-4 pb-0.5 text-[clamp(0.625rem,2.85vw,0.8125rem)]/tight font-medium @min-[40rem]:-mx-6 @5xl:hidden"
    >
      {dock.map(({ label, icon: Icon, current, post }) => (
        <a
          key={label}
          href="#"
          aria-current={current ? "page" : undefined}
          className={cn(
            "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 self-center rounded-md p-1 no-underline",
            post
              ? "bg-primary font-semibold text-primary-foreground"
              : "text-foreground hover:bg-secondary aria-[current=page]:bg-secondary aria-[current=page]:font-semibold aria-[current=page]:text-primary",
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
          <span className="whitespace-nowrap">{label}</span>
        </a>
      ))}
    </nav>
  );
}

// ---- Results heading and toolbar ---------------------------------------------------------

const textLink =
  "inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline";

function Dot() {
  return (
    <span aria-hidden="true" className="w-4 shrink-0 text-center text-sm text-muted-foreground">
      ·
    </span>
  );
}

function ResultsHeading({ count }: { count?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 @5xl:gap-3 @5xl:pb-3">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1">
        <h1 className="min-w-0 text-lg font-semibold break-words @5xl:text-2xl">
          Results for “lamp”
        </h1>
        {count !== undefined && (
          <>
            <Dot />
            <p role="status" className="text-sm text-muted-foreground">
              {count}
            </p>
          </>
        )}
        <Dot />
        <a href="#" className={textLink}>
          Get alerts
        </a>
      </div>
    </div>
  );
}

const sorts = [
  { value: "relevance", label: "Best match" },
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

function Toolbar() {
  return (
    <div className="grid min-w-0 items-center gap-2 @5xl:mb-3 @5xl:flex @5xl:items-end">
      <form
        role="search"
        className="flex w-full max-w-[520px] min-w-0 gap-2 @5xl:flex-1"
        onSubmit={(event) => event.preventDefault()}
      >
        <InputGroup className="h-9 flex-1">
          <InputGroupInput
            type="search"
            aria-label="Search gear"
            placeholder="Search gear"
            defaultValue="lamp"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button type="submit" size="lg" aria-label="Search">
          <SearchIcon className="@5xl:hidden" />
          <span className="hidden px-3 @5xl:inline">Search</span>
        </Button>
      </form>
      <div className="flex min-w-0 items-center justify-end gap-2 @5xl:w-52">
        <Select items={sorts} defaultValue="relevance">
          <SelectTrigger aria-label="Sort" className="w-full max-w-44 @5xl:max-w-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sorts.map((sort) => (
                <SelectItem key={sort.value} value={sort.value}>
                  {sort.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="outline" size="lg" className="@5xl:hidden">
          Filters
        </Button>
      </div>
      <a
        href="#"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "hidden @5xl:ml-auto @5xl:inline-flex",
        )}
      >
        <PlusIcon data-icon="inline-start" />
        Post item
      </a>
    </div>
  );
}

// Gap: removable applied-filter chip.
function AppliedFilters() {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5 @5xl:gap-x-4">
      {appliedFilters.map((filter) => (
        <Button key={filter} variant="ghost" size="sm" aria-label={`Remove ${filter}`}>
          {filter}
          <XIcon data-icon="inline-end" />
        </Button>
      ))}
      <Button variant="link" size="sm" className="ms-auto @5xl:ms-0">
        Clear all
      </Button>
    </div>
  );
}

// ---- Filter rail ---------------------------------------------------------------------------

// Gap: collapsible filter section.
function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details
      open
      className="group/filter min-w-0 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
    >
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 rounded-sm text-[13px] font-semibold text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDownIcon
          aria-hidden="true"
          className="size-4 transition-transform group-open/filter:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="min-w-0 pt-1">{children}</div>
    </details>
  );
}

function CheckRows({ name, options }: { name: string; options: [string, boolean][] }) {
  return (
    <div role="group" aria-label={name}>
      {options.map(([label, checked]) => (
        <Label key={label} className="flex min-h-8 cursor-pointer gap-3 py-1 font-normal">
          <Checkbox defaultChecked={checked} />
          {label}
        </Label>
      ))}
    </div>
  );
}

const categories = ["All categories", "Lighting", "Furniture", "Kitchen", "Outdoor"];

function FilterRail() {
  return (
    <aside aria-label="Listing filters" className="sticky top-4 hidden self-start @5xl:block">
      <Card className="max-h-[calc(100dvh-2rem)] gap-0 py-0">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <FilterSection title="Listing type">
            <CheckRows
              name="Listing type"
              options={[
                ["For sale", true],
                ["Trade", true],
                ["Free", true],
              ]}
            />
          </FilterSection>
          <FilterSection title="Options">
            <CheckRows
              name="Options"
              options={[
                ["Open to offers", false],
                ["Price dropped", false],
              ]}
            />
          </FilterSection>
          <FilterSection title="Category">
            {/* Gap: single-choice list with a selected row. */}
            <div className="-mx-2 grid">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  aria-pressed={category === "Lighting"}
                  className="justify-start font-normal aria-pressed:bg-primary/10 aria-pressed:font-semibold aria-pressed:text-primary"
                >
                  {category}
                </Button>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Price">
            {/* Gap: the product's two-thumb price slider. */}
            <div className="grid grid-cols-2 gap-2">
              <Input aria-label="Minimum price" placeholder="Min" inputMode="numeric" />
              <Input aria-label="Maximum price" placeholder="Max" inputMode="numeric" />
            </div>
          </FilterSection>
          <FilterSection title="Condition">
            <CheckRows
              name="Condition"
              options={[
                ["Factory sealed", false],
                ["New / unused", false],
                ["Like new", true],
                ["Good", true],
                ["Fair", false],
                ["For parts", false],
              ]}
            />
          </FilterSection>
        </div>
        <div className="flex shrink-0 border-t border-border p-4">
          <Button variant="outline" size="lg">
            Clear filters
          </Button>
        </div>
      </Card>
    </aside>
  );
}

// ---- Listing card (gap) ------------------------------------------------------------------

// Gap: photo placeholders. Flat shapes in the brand's own colours, no real images.
function PhotoPlaceholder({ shape }: { shape: Shape }) {
  if (shape === "none")
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-linear-to-br from-muted/60 to-card text-xs text-muted-foreground">
        <svg
          aria-hidden="true"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-45"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m3 17 5-5 4 4 4-6 5 7" />
        </svg>
        No photo
      </div>
    );
  const art: Record<Exclude<Shape, "none">, ReactNode> = {
    lamp: (
      <>
        <path d="M44 22h32l10 26H34Z" className="fill-primary/45" />
        <rect x="58" y="48" width="4" height="30" className="fill-foreground/40" />
        <rect x="42" y="78" width="36" height="6" rx="3" className="fill-foreground/40" />
      </>
    ),
    pair: (
      <>
        <ellipse cx="38" cy="58" rx="16" ry="20" className="fill-primary/35" />
        <ellipse cx="82" cy="58" rx="16" ry="20" className="fill-primary/35" />
        <path d="M26 22h24l6 16H20ZM70 22h24l6 16H64Z" className="fill-foreground/30" />
      </>
    ),
    clip: (
      <>
        <circle cx="74" cy="34" r="14" className="fill-primary/40" />
        <path d="M70 44 44 70" strokeWidth="5" className="stroke-foreground/40" />
        <rect x="30" y="68" width="28" height="12" rx="4" className="fill-foreground/35" />
      </>
    ),
    shade: (
      <>
        <path d="M60 14v14" strokeWidth="2" className="stroke-foreground/40" />
        <path d="M36 66a24 38 0 0 1 48 0Z" className="fill-primary/40" />
      </>
    ),
    base: (
      <>
        <rect x="52" y="28" width="16" height="44" rx="6" className="fill-foreground/35" />
        <rect x="38" y="72" width="44" height="10" rx="4" className="fill-primary/40" />
      </>
    ),
    shelf: (
      <>
        <rect
          x="30"
          y="16"
          width="60"
          height="70"
          rx="2"
          className="fill-none stroke-foreground/40"
          strokeWidth="4"
        />
        <path d="M30 40h60M30 63h60" strokeWidth="4" className="stroke-foreground/40" />
        <circle cx="76" cy="30" r="6" className="fill-primary/50" />
      </>
    ),
  };
  return (
    <div className="h-full bg-linear-to-br from-secondary to-muted">
      <svg aria-hidden="true" viewBox="0 0 120 90" className="size-full">
        {art[shape]}
      </svg>
    </div>
  );
}

function Price({ listing }: { listing: Listing }) {
  return (
    <>
      {listing.price && (
        <p className="mt-2 text-sm leading-5 font-semibold whitespace-nowrap tabular-nums">
          {listing.price}
        </p>
      )}
      {listing.openToTrades && (
        <p className="mt-2 text-xs font-semibold text-primary">Open to trades</p>
      )}
      {listing.wants && (
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{listing.wants}</p>
      )}
      {listing.parts && (
        <p className="mt-2 text-sm font-semibold text-destructive">Parts only: {listing.parts}</p>
      )}
    </>
  );
}

function SellerLine({ listing }: { listing: Listing }) {
  const initials = listing.seller
    .split(" ")
    .map((word) => word[0])
    .join("");
  // A card narrower than 15rem puts the rating on its own line under the name, as Perkcord does;
  // the line stays when empty, so every card in a row has the same footer.
  return (
    <div className="@container/seller relative z-10 mt-auto">
      <div className="flex min-w-0 items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground @max-[15rem]/seller:flex-wrap">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <a href="#" className="truncate text-foreground no-underline hover:underline">
            {listing.seller}
          </a>
        </span>
        <span className="shrink-0 whitespace-nowrap tabular-nums @max-[15rem]/seller:-mt-2 @max-[15rem]/seller:min-h-[18px] @max-[15rem]/seller:basis-full @max-[15rem]/seller:pl-10">
          {listing.rating ? (
            <>
              <span className="sr-only">
                {`${listing.rating.figure} out of 5 (${listing.rating.count} ratings)`}
              </span>
              <span aria-hidden="true">
                <span className="font-semibold text-foreground">{listing.rating.figure}</span>{" "}
                <span className="text-warning">★</span> ({listing.rating.count})
              </span>
            </>
          ) : listing.exchanges ? (
            `${listing.exchanges} exchanges`
          ) : null}
        </span>
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="group/listing relative gap-0 py-0 transition-[translate] duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transition-none">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-muted">
        <PhotoPlaceholder shape={listing.shape} />
        {listing.trade && (
          <Badge variant="outline" className="absolute end-2 top-2 bg-card">
            Trade
          </Badge>
        )}
      </div>
      <div className="min-w-0 flex-1 px-[11px] pt-[9px] pb-[10px]">
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold">
          {/* The title link covers the card; the condition and seller controls sit above it. */}
          <a href="#" className="no-underline after:absolute after:inset-0 after:content-['']">
            {listing.title}
          </a>
        </h3>
        <Price listing={listing} />
      </div>
      <SellerLine listing={listing} />
      <div className="absolute start-2 top-2 z-20">
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" size="icon-sm" className="rounded-full bg-card" />}
            aria-label={`Item condition: ${listing.condition}`}
          >
            <ConditionIcon condition={listing.condition} />
          </TooltipTrigger>
          <TooltipContent>{listing.condition}</TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
}

const conditionPaths: Record<string, string> = {
  "Factory sealed": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5zM12 15v2",
  "Like new": "M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10Z",
  Good: "m5 12 5 5L19 7",
  Fair: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 12h8",
  "For parts":
    "M14.5 6.5 18 3a5 5 0 0 1-5.9 6.6l-7.6 8a2 2 0 0 0 3 2.7l7.7-8A5 5 0 0 0 21 6l-3.5 3.5-3-3Z",
};

function ConditionIcon({ condition }: { condition: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={conditionPaths[condition]} />
    </svg>
  );
}

function ListingCardLoading() {
  return (
    <Card aria-hidden="true" className="gap-0 py-0">
      <Skeleton className="aspect-[4/3] rounded-none border-b border-border" />
      <div className="px-[11px] pt-[9px] pb-[10px]">
        <div className="min-h-10 space-y-1 pt-1">
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
        <Skeleton className="mt-2 h-5 w-2/5" />
      </div>
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </Card>
  );
}

// ---- Results ---------------------------------------------------------------------------------

function ResultsEnd() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 text-sm text-muted-foreground">
      <p>End of results</p>
      <a href="#" className={cn(textLink, "min-h-11")}>
        Clear filters
      </a>
      <a href="#" className={cn(textLink, "min-h-11")}>
        Get alerts
      </a>
    </div>
  );
}

function EmptyResults() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing matches this search yet.</EmptyTitle>
        <EmptyDescription>Filters on: {appliedFilters.join(", ")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="lg">Clear filters</Button>
        <div className="flex flex-wrap justify-center gap-x-4">
          <a href="#" className={cn(textLink, "min-h-11")}>
            Get an alert when one is listed
          </a>
          <a href="#" className={cn(textLink, "min-h-11")}>
            Post a wanted request
          </a>
        </div>
      </EmptyContent>
    </Empty>
  );
}

const resultsGrid =
  "grid grid-cols-2 gap-[18px] @3xl:grid-cols-[repeat(auto-fill,minmax(224px,1fr))] @3xl:gap-5 @7xl:grid-cols-5";

type View = "results" | "empty" | "loading";

function Results({ view }: { view: View }) {
  const loading = view === "loading";
  return (
    <div className="relative min-w-0">
      {loading && (
        <div className="pointer-events-none absolute inset-x-0 top-[min(50%,28vh)] z-10 flex -translate-y-1/2 justify-center">
          <Spinner aria-label="Loading marketplace listings" className="size-6 text-primary" />
        </div>
      )}
      <div aria-busy={loading} className={cn("space-y-4", loading && "opacity-40")}>
        <div className={resultsGrid}>
          {view === "results" &&
            listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          {loading && Array.from({ length: 8 }, (_, index) => <ListingCardLoading key={index} />)}
        </div>
        {view === "results" && <ResultsEnd />}
        {view === "empty" && <EmptyResults />}
      </div>
    </div>
  );
}

// ---- Page ------------------------------------------------------------------------------------

function MarketplaceListingPage({ view = "results" }: { view?: View }) {
  const count = { results: "8 listings", empty: "0 listings", loading: undefined }[view];
  return (
    <div className="@container min-h-svh">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col px-4 pt-4 @min-[40rem]:px-6 @5xl:px-8 @5xl:pb-8">
        <CommunityHeader />
        <main className="mt-6 w-full flex-1">
          <section className="space-y-2">
            <ResultsHeading count={count} />
            <div className="min-w-0 space-y-2">
              <Toolbar />
              <AppliedFilters />
              <div className="grid min-w-0 items-start gap-4 @5xl:grid-cols-[240px_minmax(0,1fr)]">
                <FilterRail />
                <Results view={view} />
              </div>
            </div>
          </section>
        </main>
        <footer className="mt-8 flex w-full flex-wrap justify-between gap-x-4 border-t border-border/70 py-2 text-sm text-muted-foreground">
          <a href="#" className="min-h-11 content-center no-underline hover:text-foreground">
            Contact
          </a>
          <a href="#" className="min-h-11 content-center no-underline hover:text-foreground">
            Membership
          </a>
          <a href="#" className="min-h-11 content-center no-underline hover:text-foreground">
            Community
          </a>
        </footer>
        <MobileDock />
      </div>
    </div>
  );
}

const meta = {
  title: "Examples/Marketplace listing page",
  component: MarketplaceListingPage,
  parameters: { layout: "fullscreen" },
  // The product's own brand and glass; the theme toolbar switches light and dark.
  globals: { brand: "perkcord" },
} satisfies Meta<typeof MarketplaceListingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// A phone-width frame: the page lays out from its own width, so this is the 390px layout.
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[390px]">
        <Story />
      </div>
    ),
  ],
};

export const EmptyResultsView: Story = { name: "Empty results", args: { view: "empty" } };

export const Loading: Story = { args: { view: "loading" } };
