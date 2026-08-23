module {
  // A single navigation entry. `text` is the visible text; `href` is the
  // route path. `children` is the optional list of sub-entries for dropdowns.
  // When `children` is non-empty the entry is rendered as a dropdown and
  // `href` is typically the first child's href or an empty anchor.
  public type NavEntry = {
    text : Text;
    href : Text;
    children : [NavEntry];
  };

  // The full navigation structure returned to the frontend. `entries` is the
  // ordered top-level list (dropdowns + standalone links). Seeded with the
  // current NAV_ENTRIES content so the live site is unchanged.
  public type NavConfig = {
    entries : [NavEntry];
  };

  // A single hero video slot. `key` is the stable identifier of the slot
  // (e.g. "flag-waving", "mascot-walk"). `videoUrl` is the URL of the
  // background video. `posterUrl` is the URL of the poster image shown before
  // the video loads. Seeded with local-hosted URLs so the live site is
  // unchanged.
  public type HeroVideoSlot = {
    key : Text;
    videoUrl : Text;
    posterUrl : Text;
  };

  // The full hero video config returned to the frontend. `slots` is the
  // keyed set of the 6 hero slots. Stored as an ordered array; the frontend
  // indexes by `key`.
  public type HeroVideoConfig = {
    slots : [HeroVideoSlot];
  };

  // Mutable config holder shared across mixins so updates propagate. The
  // nav and hero video configs are stored as `var` fields so they can be
  // replaced wholesale by admin updates.
  public type SiteConfigState = {
    var navConfig : NavConfig;
    var heroVideoConfig : HeroVideoConfig;
  };
};
