import Types "../types/site-config";

module {
  public type NavEntry = Types.NavEntry;
  public type NavConfig = Types.NavConfig;
  public type HeroVideoSlot = Types.HeroVideoSlot;
  public type HeroVideoConfig = Types.HeroVideoConfig;
  public type SiteConfigState = Types.SiteConfigState;

  // Return the current navigation config.
  public func getNavConfig(state : Types.SiteConfigState) : Types.NavConfig {
    state.navConfig;
  };

  // Replace the navigation config wholesale. Returns the new config.
  public func setNavConfig(state : Types.SiteConfigState, config : Types.NavConfig) : Types.NavConfig {
    state.navConfig := config;
    state.navConfig;
  };

  // Return the current hero video config.
  public func getHeroVideoConfig(state : Types.SiteConfigState) : Types.HeroVideoConfig {
    state.heroVideoConfig;
  };

  // Replace the hero video config wholesale. Returns the new config.
  public func setHeroVideoConfig(state : Types.SiteConfigState, config : Types.HeroVideoConfig) : Types.HeroVideoConfig {
    state.heroVideoConfig := config;
    state.heroVideoConfig;
  };
};
