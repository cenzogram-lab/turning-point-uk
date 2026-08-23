import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ROUTES } from "@/lib/routes";
import { AboutPage } from "@/pages/AboutPage";
import { ActivismKitPage } from "@/pages/ActivismKitPage";
import { ActivismPage } from "@/pages/ActivismPage";
import { BecomeAnActivistPage } from "@/pages/BecomeAnActivistPage";
import { BlogPage } from "@/pages/BlogPage";
import { ContactPage } from "@/pages/ContactPage";
import { DonatePage } from "@/pages/DonatePage";
import { EducationWatchPage } from "@/pages/EducationWatchPage";
import { EventsPage } from "@/pages/EventsPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { HomePage } from "@/pages/HomePage";
import { JoinUsPage } from "@/pages/JoinUsPage";
import { MbgaPage } from "@/pages/MbgaPage";
import { MerchandisePage } from "@/pages/MerchandisePage";
import { PatreonPage } from "@/pages/PatreonPage";
import { PetitionPage } from "@/pages/PetitionPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { RealBritishHistoryPage } from "@/pages/RealBritishHistoryPage";
import { SitemapPage } from "@/pages/SitemapPage";
import { TermsAndConditionsPage } from "@/pages/TermsAndConditionsPage";
import { UniversitySocietiesPage } from "@/pages/UniversitySocietiesPage";
import {
  Outlet,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { lazy } from "react";

/**
 * AdminGalleryPage — hidden admin route, lazy-loaded so it is excluded
 * from the main bundle and only fetched when an admin navigates to
 * `/admin/gallery` directly. The page body (password gate, upload
 * dropzone, item grid) is built in the next wave; the placeholder renders
 * inside the shared Layout.
 */
const AdminGalleryPage = lazy(() =>
  import("@/pages/AdminGalleryPage").then((m) => ({
    default: m.AdminGalleryPage,
  })),
);
/**
 * PostArticlePage — canonical single-article reading page at /post/$slug.
 * Lazy-loaded so the article bundle (Markdown renderer + SEO meta) is
 * only fetched when a reader opens an article. Serves posts from every
 * hub (Blog, Real British History, etc.) regardless of category.
 */
const PostArticlePage = lazy(() =>
  import("@/pages/PostArticlePage").then((m) => ({
    default: m.PostArticlePage,
  })),
);
/**
 * AdminBlogPage — hidden admin route for managing blog posts, lazy-loaded
 * so it is excluded from the main bundle and only fetched when an admin
 * navigates to `/admin/blog` directly. Mirrors AdminGalleryPage.
 */
const AdminBlogPage = lazy(() =>
  import("@/pages/AdminBlogPage").then((m) => ({
    default: m.AdminBlogPage,
  })),
);
/**
 * CheckoutSuccessPage — Stripe Checkout success return URL at
 * /checkout/success. Lazy-loaded so the confirmation UI is only fetched
 * when a supporter is redirected back after a successful payment.
 */
const CheckoutSuccessPage = lazy(() =>
  import("@/pages/CheckoutSuccessPage").then((m) => ({
    default: m.CheckoutSuccessPage,
  })),
);
/**
 * CheckoutCancelPage — Stripe Checkout cancel return URL at
 * /checkout/cancel. Lazy-loaded so the cancellation UI is only fetched
 * when a supporter is redirected back after abandoning checkout.
 */
const CheckoutCancelPage = lazy(() =>
  import("@/pages/CheckoutCancelPage").then((m) => ({
    default: m.CheckoutCancelPage,
  })),
);
/**
 * AdminRealBritishHistoryPage — hidden admin route for managing Real
 * British History posts, lazy-loaded so it is excluded from the main
 * bundle and only fetched when an admin navigates to
 * `/admin/real-british-history` directly. Reuses the blog backend with
 * category='Real British History'. Mirrors AdminBlogPage /
 * AdminGalleryPage.
 */
const AdminRealBritishHistoryPage = lazy(() =>
  import("@/pages/AdminRealBritishHistoryPage").then((m) => ({
    default: m.AdminRealBritishHistoryPage,
  })),
);
/**
 * AdminStripePage — hidden admin route for configuring the Stripe
 * secret key, lazy-loaded so it is excluded from the main bundle and
 * only fetched when an admin navigates to `/admin/stripe` directly.
 * Hosts the StripeSetupPanel (the only surface where the Stripe secret
 * key can be set/rotated). Mirrors AdminBlogPage / AdminGalleryPage /
 * AdminRealBritishHistoryPage.
 */
const AdminStripePage = lazy(() =>
  import("@/pages/AdminStripePage").then((m) => ({
    default: m.AdminStripePage,
  })),
);
/**
 * App — TanStack Router setup with all 16 routes registered.
 *
 * Each route renders the shared Layout (nav + footer) wrapping a page
 * component. Page components are minimal placeholders for now — each renders a
 * single Hero with its headline. Full page content will be built in the next
 * wave.
 */

const rootRoute = createRootRouteWithContext()({
  component: Layout,
  // Branded loading screen shows during route preloads and transitions.
  pendingComponent: LoadingScreen,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.home,
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.about,
  component: AboutPage,
});

const activismRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.activism,
  component: ActivismPage,
});

const becomeAnActivistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.becomeAnActivist,
  component: BecomeAnActivistPage,
});

const activismKitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.activismKit,
  component: ActivismKitPage,
});

const educationWatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.educationWatch,
  component: EducationWatchPage,
});

const universitySocietiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.universitySocieties,
  component: UniversitySocietiesPage,
});

const petitionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.petition,
  component: PetitionPage,
});

const joinUsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.joinUs,
  component: JoinUsPage,
});

/**
 * /patreon landing page route — renders PatreonPage, the dedicated
 * supporter landing page that explains the benefits of backing the
 * TPUK podcasts and carries the external BECOME A PATRON CTA to
 * patreon.com/tpointuk. Sibling to joinUsRoute under rootRoute.
 */
const patreonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.patreonPage,
  component: PatreonPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.events,
  component: EventsPage,
});

const merchandiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.merchandise,
  component: MerchandisePage,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.gallery,
  component: GalleryPage,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.blog,
  component: BlogPage,
});

/**
 * /blog/$slug alias route — renders PostArticlePage directly (no redirect)
 * so the URL bar preserves the /blog/ prefix the reader clicked from a blog
 * card. PostArticlePage detects which alias it was reached through by
 * reading the current pathname and adapts its back link accordingly. The
 * same PostArticlePage component is reused by /post/$slug and
 * /real-british-history/$slug — no duplicated page logic.
 */
const blogArticleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.blogArticle,
  component: PostArticlePage,
});

/**
 * Canonical /post/$slug reading route — flat child of rootRoute (sibling
 * to blogRoute) so the slug param parses at the top level. Lazy-loaded so
 * the article bundle (Markdown renderer + SEO meta) is only fetched when
 * a reader opens an article. Serves posts from every hub regardless of
 * category.
 */
const postArticleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.post,
  component: PostArticlePage,
});

/**
 * /real-british-history/$slug alias route — renders PostArticlePage directly
 * (no redirect) so the URL bar preserves the /real-british-history/ prefix
 * the reader clicked from an RBH card. Same PostArticlePage component as
 * /post/$slug and /blog/$slug — no duplicated page logic.
 */
const realBritishHistoryArticleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.realBritishHistoryArticle,
  component: PostArticlePage,
});

const realBritishHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.realBritishHistory,
  component: RealBritishHistoryPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.contact,
  component: ContactPage,
});

const donateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.donate,
  component: DonatePage,
});

/**
 * /checkout/success route — Stripe Checkout success return URL. Renders
 * CheckoutSuccessPage (lazy) inside the shared Layout. Sibling to
 * donateRoute under rootRoute.
 */
const checkoutSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/success",
  component: CheckoutSuccessPage,
});

/**
 * /checkout/cancel route — Stripe Checkout cancel return URL. Renders
 * CheckoutCancelPage (lazy) inside the shared Layout. Sibling to
 * donateRoute under rootRoute.
 */
const checkoutCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/cancel",
  component: CheckoutCancelPage,
});

const mbgaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.mbga,
  component: MbgaPage,
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.privacyPolicy,
  component: PrivacyPolicyPage,
});

const termsAndConditionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.termsAndConditions,
  component: TermsAndConditionsPage,
});

/**
 * /sitemap route — renders SitemapPage, the live sitemap.xml viewer that
 * lists every public static route plus every dynamic blog/Real British
 * History article route fetched from the backend's getPostSlugs() query.
 * Sibling to the other public routes under rootRoute. Not in NAV_ENTRIES
 * (reachable by direct URL for crawlers and visitors).
 */
const sitemapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sitemap",
  component: SitemapPage,
});

/**
 * Admin root route — a PATHLESS route (id: '_admin') parented under
 * rootRoute whose component is AdminAuthGuard wrapping AdminLayout.
 *
 * This is the key to strict route protection: because admin routes are
 * parented under THIS pathless route (not directly under rootRoute),
 * they render inside AdminAuthGuard -> AdminLayout instead of the
 * public Layout. The public Layout (Nav, Footer, EndorsementsSlider,
 * HomeFaq, CookieConsentBanner, mobile Donate pill, floating Patreon
 * CTA) does NOT render for any /admin/* path in any guard state
 * (not-signed-in, access-requested, or authorized).
 *
 * AdminAuthGuard renders BEFORE AdminLayout's chrome so the admin
 * header, tab nav, quick links, and CMS tools are completely hidden in
 * the not-signed-in and unauthorized states. The guard owns all auth
 * (II sign-in, allowlist check, Access Requested screen); the admin
 * pages no longer carry their own per-page password gate.
 *
 * AdminLayout renders an <Outlet/> for the admin path route's children.
 */
const adminRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_admin",
  component: () => (
    <AdminAuthGuard>
      <AdminLayout />
    </AdminAuthGuard>
  ),
});

/**
 * Admin path route — the /admin segment. Parented under the pathless
 * adminRootRoute (NOT rootRoute) so it renders inside AdminAuthGuard ->
 * AdminLayout. Its component is a passthrough <Outlet/> so the admin
 * child routes (blog, gallery, real-british-history) render inside
 * AdminLayout's <Outlet/>.
 */
const adminRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/admin",
  component: () => <Outlet />,
});

/**
 * Hidden admin gallery route — registered but NOT in NAV_ENTRIES, so it
 * is unreachable from the public nav. Only direct URL access reaches it.
 * Renders inside the shared AdminLayout (admin header + tab nav + dark
 * navy shell). Auth is owned centrally by AdminAuthGuard, which wraps
 * AdminLayout for the entire `/admin/*` workspace — this page no longer
 * carries its own password gate.
 */
const adminGalleryRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "gallery",
  component: AdminGalleryPage,
});

/**
 * Hidden admin blog route — registered but NOT in NAV_ENTRIES, so it is
 * unreachable from the public nav. Only direct URL access reaches it.
 * Mirrors adminGalleryRoute. Renders inside the shared AdminLayout.
 * Auth is owned centrally by AdminAuthGuard, which wraps AdminLayout
 * for the entire `/admin/*` workspace — this page no longer carries its
 * own password gate.
 */
const adminBlogRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "blog",
  component: AdminBlogPage,
});

/**
 * Hidden admin Real British History route — registered but NOT in
 * NAV_ENTRIES, so it is unreachable from the public nav. Only direct URL
 * access reaches it. Reuses the blog backend with category='Real British
 * History'. Mirrors adminBlogRoute / adminGalleryRoute. Renders inside
 * the shared AdminLayout. Auth is owned centrally by AdminAuthGuard,
 * which wraps AdminLayout for the entire `/admin/*` workspace — this
 * page no longer carries its own password gate.
 */
const adminRealBritishHistoryRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "real-british-history",
  component: AdminRealBritishHistoryPage,
});

/**
 * Hidden admin Stripe route — registered but NOT in NAV_ENTRIES, so it
 * is unreachable from the public nav. Only direct URL access or the
 * admin header tab nav reaches it. Renders AdminStripePage, which hosts
 * the StripeSetupPanel (the only surface where the Stripe secret key
 * can be set/rotated). Mirrors adminBlogRoute / adminGalleryRoute /
 * adminRealBritishHistoryRoute. Renders inside the shared AdminLayout.
 * Auth is owned centrally by AdminAuthGuard, which wraps AdminLayout
 * for the entire `/admin/*` workspace — no Stripe setup UI is exposed
 * on public customer-facing routes.
 */
const adminStripeRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "stripe",
  component: AdminStripePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  activismRoute,
  becomeAnActivistRoute,
  activismKitRoute,
  educationWatchRoute,
  universitySocietiesRoute,
  petitionRoute,
  joinUsRoute,
  patreonRoute,
  eventsRoute,
  merchandiseRoute,
  galleryRoute,
  blogRoute,
  blogArticleRoute,
  postArticleRoute,
  realBritishHistoryRoute,
  realBritishHistoryArticleRoute,
  contactRoute,
  donateRoute,
  checkoutSuccessRoute,
  checkoutCancelRoute,
  mbgaRoute,
  privacyPolicyRoute,
  termsAndConditionsRoute,
  sitemapRoute,
  adminRootRoute.addChildren([
    adminRoute.addChildren([
      adminBlogRoute,
      adminGalleryRoute,
      adminRealBritishHistoryRoute,
      adminStripeRoute,
    ]),
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
