import { HeartHandshake } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/**
 * CampaignCountdown — featured urgency banner for the live Crowdfunder
 * appeal, rendered on the homepage directly above the Charlie Kirk vigil
 * spotlight.
 *
 * Carries the site's ambient midnight/glass treatment (slate-900/70 +
 * backdrop blur + hairline border) but swaps the usual cobalt perimeter for
 * a crimson/ruby ambient glow so it reads as urgent against the rest of the
 * page.
 *
 * COUNTDOWN CONTRACT: the timer counts down to a FIXED deadline
 * (CAMPAIGN_DEADLINE_ISO), not to "38 days from whenever the page loaded".
 * A relative offset would restart at 38 days for every visitor on every
 * visit and never actually approach zero. The fixed instant below is set so
 * the campaign shows exactly 38 days remaining on 24 August 2026 — matching
 * the Crowdfunder page — and ticks down from there for everyone.
 *
 * Update CAMPAIGN_DEADLINE_ISO if the Crowdfunder deadline moves.
 */

/** Live Crowdfunder appeal this banner drives traffic to. */
const CAMPAIGN_URL =
  "https://www.crowdfunder.co.uk/p/urgent-medical-care-for-success";

/**
 * Campaign close instant (UTC) — end of day on 1 October 2026.
 *
 * Whole days are floored (a "day" badge only drops when a full day elapses),
 * so an end-of-day close is what makes the banner read 38 DAYS throughout
 * 24 August 2026, matching the "38 days left" figure on the Crowdfunder
 * page. A midnight close would have read 37 for most of that day.
 */
const CAMPAIGN_DEADLINE_ISO = "2026-10-01T23:59:59Z";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the deadline has passed — the banner then shows a closed state. */
  expired: boolean;
}

/**
 * Splits the milliseconds between `nowMs` and the deadline into whole
 * days / hours / minutes / seconds. Clamps at zero so a passed deadline can
 * never render negative digits.
 */
function getRemaining(deadlineMs: number, nowMs: number): Remaining {
  const diff = deadlineMs - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: false,
  };
}

/** Zero-pads to at least two digits so the badges never change width. */
function pad(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

/**
 * CountdownBadge — one digital unit tile (value + unit label) in the
 * countdown row. Tabular figures keep the digits from shifting as they tick.
 */
function CountdownBadge({
  value,
  label,
  ocid,
}: {
  value: string;
  label: string;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex min-w-0 flex-col items-center gap-1 rounded-xl border border-red-500/25 bg-slate-950/60 px-2 py-3 backdrop-blur-sm sm:px-5 sm:py-4"
    >
      <span className="font-display text-[1.6rem] font-bold tabular-nums leading-none text-white sm:text-4xl md:text-5xl">
        {value}
      </span>
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-white/60 sm:text-xs sm:tracking-[0.18em]">
        {label}
      </span>
    </div>
  );
}

export function CampaignCountdown() {
  // Parsed once — the deadline is a module constant, so re-parsing per tick
  // would be pure waste.
  const deadlineMs = useMemo(() => Date.parse(CAMPAIGN_DEADLINE_ISO), []);
  const [remaining, setRemaining] = useState<Remaining>(() =>
    getRemaining(deadlineMs, Date.now()),
  );

  // Tick once per second. The interval is cleared on unmount so navigating
  // away from the homepage never leaves a timer running.
  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(getRemaining(deadlineMs, Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [deadlineMs]);

  return (
    <section
      data-ocid="section.campaign_countdown"
      aria-labelledby="campaign-countdown-heading"
      className="w-full px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-slate-900/70 p-6 text-center backdrop-blur-md md:p-10">
          {/* Crimson / ruby ambient glow — two soft radial washes anchored on
              opposite corners so the panel reads as urgent without washing
              out the copy. Decorative only. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(225,29,72,0.28),transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(185,28,28,0.24),transparent_70%)] blur-2xl"
          />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <h2
              id="campaign-countdown-heading"
              className="entrance-left font-display text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
              data-entrance-delay="0"
            >
              Urgent Medical Care Campaign
            </h2>

            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-white/75 sm:text-lg"
              data-entrance-delay="80"
            >
              Time remaining to reach our funding goal for essential medical
              care and support.
            </p>

            {/* Countdown — role="timer" with aria-live off so screen readers
                are not spammed once per second; the sr-only sentence below
                carries the meaningful summary instead. */}
            {remaining.expired ? (
              <p
                data-ocid="section.campaign_countdown.closed"
                className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl"
              >
                This campaign has now closed — thank you for your support.
              </p>
            ) : (
              <>
                <div
                  role="timer"
                  aria-live="off"
                  data-ocid="section.campaign_countdown.timer"
                  // Fixed 4-column grid (not flex-wrap): the four units stay on one row at
                  // every width instead of breaking 3+1 on narrow phones.
                  className="mt-1 grid w-full max-w-md grid-cols-4 gap-2 sm:gap-3"
                >
                  <CountdownBadge
                    value={pad(remaining.days)}
                    label="Days"
                    ocid="section.campaign_countdown.days"
                  />
                  <CountdownBadge
                    value={pad(remaining.hours)}
                    label="Hours"
                    ocid="section.campaign_countdown.hours"
                  />
                  <CountdownBadge
                    value={pad(remaining.minutes)}
                    label="Minutes"
                    ocid="section.campaign_countdown.minutes"
                  />
                  <CountdownBadge
                    value={pad(remaining.seconds)}
                    label="Seconds"
                    ocid="section.campaign_countdown.seconds"
                  />
                </div>
                <span className="sr-only">
                  {remaining.days} days remaining to support this campaign.
                </span>
              </>
            )}

            {/* Primary CTA — opens the Crowdfunder appeal in a new tab. */}
            <div className="mt-2 flex flex-col items-center gap-3">
              <a
                href={CAMPAIGN_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="section.campaign_countdown.donate_button"
                className="btn-primary-square group inline-flex items-center gap-2 rounded-full"
              >
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                <span>Support the Campaign</span>
              </a>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/45">
                Secure donations via Crowdfunder
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
