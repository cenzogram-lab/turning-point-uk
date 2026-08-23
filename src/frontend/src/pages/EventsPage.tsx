import { EmbedSlot } from "@/components/EmbedSlot";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { VIDEO_EDUCATION_CROWD } from "@/lib/assets";
import { ROUTES } from "@/lib/routes";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { Link } from "@tanstack/react-router";

/**
 * EventsPage — upcoming speeches, rallies, and summits.
 *
 * SpaceX discipline: full-bleed hero, then a three-card event grid. Each
 * card's RSVP button opens a shadcn Dialog containing an EmbedSlot for the
 * NationBuilder RSVP snippet. Events are managed via CMS; the RSVP modal
 * runs the NationBuilder snippet when pasted.
 */

interface EventItem {
  title: string;
  date: string;
  venue: string;
  city: string;
}

const EVENTS: EventItem[] = [
  {
    title: "Free Speech Rally",
    date: "Sat 14 Mar 2026 · 13:00",
    venue: "Parliament Square",
    city: "London",
  },
  {
    title: "Campus Activism Summit",
    date: "Sat 28 Mar 2026 · 10:00",
    venue: "Town Hall",
    city: "Manchester",
  },
  {
    title: "Heritage & History Lecture",
    date: "Fri 10 Apr 2026 · 18:30",
    venue: "Grand Hall",
    city: "Birmingham",
  },
];

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

/**
 * Parse a visible event date string like "Sat 14 Mar 2026 · 13:00" into an
 * ISO 8601 startDate for the Event JSON-LD schema. The visible string on
 * the page is left untouched — only the structured-data startDate is
 * normalized. Falls back to the date portion (still valid ISO 8601) when
 * the time cannot be parsed, and to the original string only when the
 * date itself cannot be parsed.
 */
function toIsoStartDate(visible: string): string {
  // Expected shape: "<Dow> <Day> <Mon> <Year> · <HH:MM>"
  const match = visible.match(
    /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})(?:\s*[·-]\s*(\d{1,2}:\d{2}))?/,
  );
  if (!match) return visible;
  const [, day, monAbbr, year, time] = match;
  const month = MONTHS[monAbbr];
  if (!month) return visible;
  const dd = day.padStart(2, "0");
  const datePart = `${year}-${month}-${dd}`;
  if (!time) return `${datePart}T00:00:00`;
  const [hh, mm] = time.split(":");
  return `${datePart}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`;
}

/**
 * Build one Event JSON-LD schema object per inline event, mirroring the
 * visible card content (name, date, venue, city). startDate is normalized
 * to ISO 8601 via toIsoStartDate (the visible date string is unchanged);
 * location combines venue + city to match what the card renders.
 */
const EVENT_SCHEMAS = EVENTS.map((event) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.title,
  startDate: toIsoStartDate(event.date),
  location: {
    "@type": "Place",
    name: `${event.venue}, ${event.city}`,
  },
  url: `${SITE_BASE_URL}/events`,
}));

export function EventsPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  useSeoMeta({
    title: PAGE_SEO["/events"].title,
    description: PAGE_SEO["/events"].description,
    canonical: `${SITE_BASE_URL}/events`,
    url: `${SITE_BASE_URL}/events`,
    jsonLd: [
      buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/events"]),
      ...EVENT_SCHEMAS,
    ],
  });
  return (
    <div ref={ref}>
      {/* Hero — the calendar entrance. */}
      <Hero
        headline="EVENTS"
        sub="Upcoming speeches, rallies and summits across the UK."
        videoLabel="Events hero video"
        lazy={false}
        videoSrc={VIDEO_EDUCATION_CROWD}
      />

      {/* Coming Soon banner — announcement above the event grid. */}
      <Section
        id="coming-soon"
        variant="center"
        background="background"
        noSnap
        className="relative overflow-hidden border-y border-primary/40 px-6 py-24 sm:px-10"
      >
        {/* Red radial glow — announcement atmosphere. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, oklch(0.55 0.22 25 / 0.22), oklch(0.2 0.08 255 / 0) 65%)",
          }}
        />
        {/* Red top accent line. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary"
        />
        <div
          data-ocid="events.coming_soon"
          className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 text-center"
        >
          <span
            className="entrance-left text-eyebrow text-primary"
            data-entrance-delay="0"
          >
            ANNOUNCEMENT
          </span>
          <h2
            className="entrance-left text-headline font-display text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            data-entrance-delay="80"
          >
            Coming Soon!
          </h2>
          <p
            className="entrance-left max-w-2xl font-body text-lg font-light text-muted-foreground"
            data-entrance-delay="160"
          >
            We're putting the finishing touches on our next events. Check back
            shortly.
          </p>
        </div>
      </Section>

      {/* Event grid — three cards. */}
      <Section id="calendar" variant="center" className="px-6 py-24 sm:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              UPCOMING
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Show up. Speak out.
            </h2>
          </div>

          <div
            data-ocid="events.list"
            className="entrance-left grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-3"
            data-entrance-delay="320"
          >
            {EVENTS.map((event, i) => (
              <article
                key={event.title}
                data-ocid={`events.item.${i}`}
                className="flex flex-col bg-card"
              >
                {/* Cover media — photo placeholder. */}
                <div
                  className="relative aspect-[4/3] w-full overflow-hidden border-b border-foreground/15"
                  data-ocid={`events.cover.${i}`}
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 50% 40%, oklch(0.22 0.08 255 / 0.6), oklch(0.20 0.08 255) 72%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, oklch(0.98 0.005 250) 0px, oklch(0.98 0.005 250) 1px, transparent 1px, transparent 3px)",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/60">
                      Event cover photo
                    </span>
                  </div>
                </div>

                {/* Body — title, date & venue, RSVP. */}
                <div className="flex flex-1 flex-col gap-4 px-6 py-7">
                  <div className="flex flex-col gap-2">
                    <span className="text-eyebrow text-foreground/70">
                      {event.city.toUpperCase()}
                    </span>
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1 font-body text-sm font-light text-foreground/75">
                    <span>{event.date}</span>
                    <span>{event.venue}</span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        data-ocid={`events.rsvp_button.${i}`}
                        className="btn-primary-square group rounded-full mt-auto w-full !py-3 text-sm"
                      >
                        <span>RSVP</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      className="!rounded-none border-foreground/20 p-0"
                      data-ocid={`events.rsvp_modal.${i}`}
                    >
                      <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="font-display text-lg font-bold uppercase tracking-tight">
                          RSVP - {event.title}
                        </DialogTitle>
                        <DialogDescription className="font-body text-sm font-light text-muted-foreground">
                          {event.date} · {event.venue}, {event.city}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="px-6 pb-6">
                        <EmbedSlot
                          label="NationBuilder RSVP snippet - paste here."
                          height="min-h-[320px]"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </article>
            ))}
          </div>

          <p
            className="entrance-left mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground"
            data-entrance-delay="440"
          >
            Events managed via CMS; RSVP opens a modal running the NationBuilder
            snippet. Ready to stand with us?{" "}
            <Link to={ROUTES.joinUs} className="text-inherit underline">
              Join Turning Point UK
            </Link>
            .
          </p>
        </div>
      </Section>
    </div>
  );
}
