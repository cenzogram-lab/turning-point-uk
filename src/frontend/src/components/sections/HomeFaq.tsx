import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";

/**
 * HomeFaq — the homepage FAQ accordion, extracted from HomePage.tsx so it
 * can be mounted in the shared Layout directly below the EndorsementsSlider
 * (homepage only).
 *
 * Why a standalone component: the EndorsementsSlider renders in Layout.tsx
 * AFTER the page Outlet, so an inline FAQ at the end of HomePage.tsx would
 * appear ABOVE the slider on the homepage. To satisfy the desired homepage
 * order (... -> $MBGA -> Endorsements Slider -> FAQ -> Footer) while keeping
 * the FAQ homepage-only, Layout conditionally renders <HomeFaq /> between
 * <EndorsementsSlider /> and <Footer /> when the current route is "/".
 *
 * The FAQ_ITEMS const and the entire FAQ <section> JSX (section header,
 * Radix Accordion with one AccordionItem per FAQ item, and all wrapper
 * styling) are moved verbatim from HomePage.tsx so the FAQ looks identical,
 * just relocated. The data-ocid="section.faq" attribute and every class
 * are preserved unchanged.
 *
 * Entrance animation: the section's eyebrow, headline, and each accordion
 * item carry `entrance-left` with staggered `data-entrance-delay`, matching
 * the original inline section. Because HomeFaq now renders in Layout
 * (outside any page's useEntranceAnimation containerRef), it calls
 * useEntranceAnimation() with no ref so the hook falls back to observing
 * document.body — the same universal Intersection Observer pattern used
 * across the site. This is additive and self-contained: it does not touch
 * the EndorsementsSlider, any page, or any other section. Multiple
 * observers on the same element are safe — each independently reveals;
 * the first to fire adds `.entrance-visible` and the rest no-op.
 * `prefers-reduced-motion` is honoured by the hook + index.css.
 */
const FAQ_ITEMS = [
  {
    question: "What is Turning Point UK?",
    answer:
      "Turning Point UK is a right-wing conservative activist and political organisation that aims to challenge the left-leaning bias in our institutions and wider society, expose the far left, and end the tyranny of woke ideology. We are a grassroots movement open to all ages, all backgrounds, and all demographics.",
  },
  {
    question: "What does TPUK stand for?",
    answer:
      "We are a movement for free markets, limited government, personal responsibility, and duty to others. We aim to end political indoctrination, champion patriotism, protect free speech, and promote family and community while opposing socialism and Marxism in all their forms.",
  },
  {
    question: "When was Turning Point UK founded?",
    answer:
      "Since our inception in 2019, we have led the charge against so-called progressivism — from protecting our historical figures to exposing the gender ideology being taught in our schools and universities.",
  },
  {
    question: "What has TPUK achieved?",
    answer:
      "We reach millions of people on social media each month, run successful campaigns in over 30 universities across the UK, have influenced government policy including the Campus Free Speech Law and ensured government buildings fly the Union Flag year-round, and place undercover journalists to expose extremism and racism in leftist politics to the national press.",
  },
  {
    question: "Who can join Turning Point UK?",
    answer:
      "We are a grassroots movement open to all ages, all backgrounds, and all demographics. We wish to unite people under the banner of personal responsibility, limited government, and free-market economics.",
  },
] as const;

export function HomeFaq() {
  // Observe document.body so the entrance-left elements in this section
  // (which render in Layout, outside any page's containerRef) are picked up
  // by the universal Intersection Observer. No ref is attached — the hook
  // falls back to document.body per its documented contract.
  useEntranceAnimation();

  return (
    <section
      data-ocid="section.faq"
      className="w-full bg-background px-6 py-32 sm:px-10"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-16 flex flex-col gap-4">
          <span className="entrance-left text-eyebrow" data-entrance-delay="0">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            Questions &amp; Answers
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={item.question}
              value={`faq-${i + 1}`}
              data-ocid={`section.faq.item.${i + 1}`}
              className="entrance-left border-border"
              data-entrance-delay={String(i * 80)}
            >
              <AccordionTrigger className="font-display uppercase tracking-wide text-foreground hover:text-primary hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="font-body text-base font-light leading-relaxed">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
