import Principal "mo:core/Principal";

// Deterministic admin-whitelist check. Shared by main.mo and the
// blog/gallery/site-config mixins so admin gating does not depend on the
// AccessControl bootstrap race (adminAssigned / userRoles). The whitelist is
// owned by the actor (a stable `var adminWhitelist : [Principal]` seeded by
// the migration chain) and passed in on every call; addAdmin appends to it.
module {
  // Returns true iff `caller` is a member of `whitelist`. Membership is a
  // linear scan — the whitelist is tiny (one principal at launch, a handful
  // after handover) so a Map would be over-engineering. Principal equality is
  // structural (`==`), which is fine for Principal (shared type, no var fields).
  //
  // Bootstrap-aware: when the whitelist is empty (no admin has initialized the
  // canister yet), ANY caller is treated as authorized. This lets the first
  // signed-in user claim the admin panel and self-persist via addAdmin. Once
  // the whitelist is non-empty, the linear-scan membership check applies.
  public func isAdmin(whitelist : [Principal], caller : Principal) : Bool {
    if (whitelist.size() == 0) { return true };
    for (p in whitelist.values()) {
      if (p == caller) { return true };
    };
    false;
  };
};
