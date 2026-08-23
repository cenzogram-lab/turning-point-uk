import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  // First migration: introduce stable state for the first time.
  // OldActor = {} (fresh install), NewActor enumerates every stable field
  // declared in main.mo and supplies its initial value.
  type OldActor = {};
  type NewActor = {
    accessControlState : AccessControlState;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty();
      };
    };
  };
};
