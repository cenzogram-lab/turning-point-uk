module {
  // A single line item in a Stripe checkout session. `currency` is the
  // lowercase ISO 4217 code (e.g. "gbp"). `priceInCents` is the unit price in
  // the currency's smallest unit (pence for GBP). `quantity` is the number of
  // units the customer is purchasing.
  public type ShoppingItem = {
    currency : Text;
    productName : Text;
    productDescription : Text;
    priceInCents : Nat;
    quantity : Nat;
  };

  // Admin-supplied Stripe configuration. `secretKey` is the Stripe secret API
  // key (sk_live_... or sk_test_...). `allowedCountries` is the list of
  // shipping-address countries permitted at checkout, using ISO 3166-1 alpha-2
  // codes (e.g. ["GB"] for the UK).
  public type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  // The result of polling a Stripe checkout session's status. `#completed`
  // carries the Stripe JSON response and the principal of the user who
  // initiated the checkout (when known). `#failed` carries the error message
  // returned by Stripe (or a local error) when the session cannot be resolved.
  public type StripeSessionStatus = {
    #failed : { error : Text };
    #completed : { response : Text; userPrincipal : ?Text };
  };

  // Mutable holder for the optional Stripe configuration. Stored as a `var`
  // field so admin updates propagate across mixins. `null` until an admin
  // configures Stripe via setStripeConfiguration.
  public type StripeState = {
    var configuration : ?StripeConfiguration;
  };
};
