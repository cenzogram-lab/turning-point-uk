import Runtime "mo:core/Runtime";
import Types "../types/stripe";

module {
  public type ShoppingItem = Types.ShoppingItem;
  public type StripeConfiguration = Types.StripeConfiguration;
  public type StripeSessionStatus = Types.StripeSessionStatus;
  public type StripeState = Types.StripeState;

  // Return whether Stripe has been configured (configuration != null).
  public func isConfigured(state : Types.StripeState) : Bool {
    state.configuration != null;
  };

  // Return the current Stripe configuration, or trap if unconfigured. The
  // caller is responsible for checking isConfigured first when it wants to
  // surface a friendly "not configured" state rather than trapping.
  public func getConfiguration(state : Types.StripeState) : Types.StripeConfiguration {
    state.configuration ?? Runtime.trap("Stripe is not configured");
  };

  // Replace the Stripe configuration wholesale. Returns the new config so the
  // mixin can return it to the admin caller if desired.
  public func setConfiguration(state : Types.StripeState, config : Types.StripeConfiguration) : Types.StripeConfiguration {
    state.configuration := ?config;
    config;
  };
};
