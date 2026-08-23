import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ROUTES } from "../../lib/routes";

/**
 * TakeAction — "TAKE ACTION" activism CTA hub.
 *
 * A grid of five action cards, each with an inline SVG icon, an action
 * heading, a short description, and a red TPUK arrow pill CTA linking to
 * the corresponding activism route. Cards slide in from the left with a
 * staggered data-entrance-delay, auto-observed by the HomePage's
 * useEntranceAnimation containerRef. *
 * The section carries id="take-action" so the Endorsements CTA can anchor
 * to it via #take-action.
 */
interface ActionCard {
  icon: ReactNode;
  title: string;
  description: string;
  to: string;
}

const MegaphoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" />
    <path d="M10 6 19 3v18l-9-3" />
    <path d="M14 9v6" />
  </svg>
);

const ToolboxIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
  </svg>
);

const EyeBookIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    <circle cx="18" cy="9" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const UniversityIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5" />
    <path d="M22 10v6" />
  </svg>
);

const DocumentPenIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="m10.5 11.5 3 3" />
    <path
      d="M9 16l1.5-1.5 3 3L12 19l-3 1 0-4Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const ACTIONS: ActionCard[] = [
  {
    icon: <MegaphoneIcon />,
    title: "Become An Activist",
    description:
      "Join the front line of the movement and help take the fight to campuses across the UK.",
    to: ROUTES.becomeAnActivist,
  },
  {
    icon: <ToolboxIcon />,
    title: "Activism Kit",
    description:
      "Everything you need to organise, recruit, and run effective campaigns on your campus.",
    to: ROUTES.activismKit,
  },
  {
    icon: <EyeBookIcon />,
    title: "Education Watch",
    description:
      "Report bias and indoctrination in schools and universities through our confidential channel.",
    to: ROUTES.educationWatch,
  },
  {
    icon: <UniversityIcon />,
    title: "University Societies",
    description:
      "Find or start a Turning Point UK society and build a conservative presence at your university.",
    to: ROUTES.universitySocieties,
  },
  {
    icon: <DocumentPenIcon />,
    title: "Sign The Petition",
    description:
      "Add your name to the campaigns holding our institutions to account.",
    to: ROUTES.petition,
  },
];

export function TakeAction() {
  return (
    <section
      id="take-action"
      data-ocid="section.take-action"
      className="w-full px-6 py-32 sm:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 flex flex-col gap-4">
          <span className="entrance-left text-eyebrow" data-entrance-delay="0">
            TAKE ACTION
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            Join The Fight
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((action, i) => (
            <article
              key={action.title}
              data-ocid={`section.take-action.card.${i + 1}`}
              className="entrance-left flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-8 backdrop-blur-md transition-colors hover:border-red-600"
              data-entrance-delay={String(i * 80)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {action.icon}
              </div>
              <h3 className="font-display text-lg uppercase tracking-wide text-foreground">
                {action.title}
              </h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                {action.description}
              </p>
              <div className="mt-auto pt-2">
                <Link
                  to={action.to}
                  data-ocid={`section.take-action.button.${i + 1}`}
                  className="btn-primary-square group rounded-full"
                >
                  <span>Learn More</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
