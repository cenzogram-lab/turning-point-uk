// This file is intentionally empty. The Stripe API surface
// (isStripeConfigured, setStripeConfiguration, createCheckoutSession,
// getStripeSessionStatus, transform) is declared DIRECTLY in the actor body
// in main.mo because caffeineai-stripe@0.13 lint rules require those five
// functions to appear in the actor body itself, not via a mixin include.
// Domain helpers (isConfigured / getConfiguration / setConfiguration) live
// in lib/stripe.mo and are called from main.mo.
