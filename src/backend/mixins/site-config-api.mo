import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Types "../types/site-config";
import SiteConfigLib "../lib/site-config";
import AdminWhitelist "../lib/AdminWhitelist";

mixin (
  siteConfigState : Types.SiteConfigState,
  adminWhitelist : [Principal],
) {
  // Query: return the current navigation structure (dropdowns + standalone
  // links). Public read — any visitor (incl. anonymous) needs the nav to
  // render the navbar.
  public query func getNavConfig() : async Types.NavConfig {
    SiteConfigLib.getNavConfig(siteConfigState);
  };

  // Update: admin-only. Replace the navigation config wholesale so nav can
  // be edited without redeploying. Reuses existing access control.
  public shared ({ caller }) func setNavConfig(config : Types.NavConfig) : async Types.NavConfig {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can update the nav config");
    };
    SiteConfigLib.setNavConfig(siteConfigState, config);
  };

  // Query: return the current hero video config (the keyed set of 6 hero
  // slots, each with its video URL and poster image URL). Public read — any
  // visitor needs the config to render the hero background videos.
  public query func getHeroVideoConfig() : async Types.HeroVideoConfig {
    SiteConfigLib.getHeroVideoConfig(siteConfigState);
  };

  // Update: admin-only. Replace the hero video config wholesale so video
  // URLs/posters can be edited without redeploying. Reuses existing access
  // control.
  public shared ({ caller }) func setHeroVideoConfig(config : Types.HeroVideoConfig) : async Types.HeroVideoConfig {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can update the hero video config");
    };
    SiteConfigLib.setHeroVideoConfig(siteConfigState, config);
  };
};
