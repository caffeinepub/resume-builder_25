import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Resume Types
  public type ResumeTemplate = { #classic; #modern; #minimal };

  module ResumeTemplate {
    public func compare(template1 : ResumeTemplate, template2 : ResumeTemplate) : Order.Order {
      switch (template1, template2) {
        case (#classic, #classic) { #equal };
        case (#classic, _) { #less };
        case (#modern, #classic) { #greater };
        case (#modern, #modern) { #equal };
        case (#modern, #minimal) { #less };
        case (#minimal, #minimal) { #equal };
        case (#minimal, _) { #greater };
      };
    };
  };

  public type PersonalInfo = {
    name : Text;
    email : Text;
    phone : Text;
    location : Text;
    website : Text;
  };

  public type Job = {
    company : Text;
    title : Text;
    dates : Text;
    description : Text;
  };

  public type Education = {
    school : Text;
    degree : Text;
    dates : Text;
  };

  public type Resume = {
    title : Text;
    template : ResumeTemplate;
    personalInfo : PersonalInfo;
    summary : Text;
    workExperience : [Job];
    education : [Education];
    skills : [Text];
  };

  module Resume {
    public func compare(resume1 : Resume, resume2 : Resume) : Order.Order {
      switch (Text.compare(resume1.title, resume2.title)) {
        case (#equal) { ResumeTemplate.compare(resume1.template, resume2.template) };
        case (order) { order };
      };
    };
  };

  public type UserProfile = {
    hasPremium : Bool;
  };

  let resumes = Map.empty<Principal, List.List<Resume>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  func getUserResumes(caller : Principal) : List.List<Resume> {
    switch (resumes.get(caller)) {
      case (null) { List.empty<Resume>() };
      case (?userResumes) { userResumes };
    };
  };

  func assertHasPremium(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        if (not profile.hasPremium) {
          Runtime.trap("User does not have premium access");
        };
      };
    };
  };

  func convertListToArray(list : List.List<Resume>) : [Resume] {
    list.toArray();
  };

  public shared ({ caller }) func createResume(resume : Resume) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create resumes");
    };
    let userResumes = getUserResumes(caller);
    userResumes.add(resume);
    resumes.add(caller, userResumes);
  };

  public shared ({ caller }) func updateResume(index : Nat, updatedResume : Resume) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update resumes");
    };
    let userResumes = switch (resumes.get(caller)) {
      case (null) { Runtime.trap("No resumes found for this user") };
      case (?existing) { existing };
    };
    if (index >= userResumes.size()) {
      Runtime.trap("Invalid resume index");
    };
    let resumesArray = convertListToArray(userResumes);
    if (index >= resumesArray.size()) {
      Runtime.trap("Invalid resume index");
    };
    let updatedArray = Array.tabulate(
      resumesArray.size(),
      func(i) {
        if (i == index) { updatedResume } else { resumesArray[i] };
      },
    );
    resumes.add(caller, List.fromArray<Resume>(updatedArray));
  };

  public shared ({ caller }) func deleteResume(index : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete resumes");
    };
    let userResumes = switch (resumes.get(caller)) {
      case (null) { Runtime.trap("No resumes found for this user") };
      case (?existing) { existing };
    };
    if (index >= userResumes.size()) {
      Runtime.trap("Invalid resume index");
    };
    let resumesArray = convertListToArray(userResumes);
    if (index >= resumesArray.size()) {
      Runtime.trap("Invalid resume index");
    };
    let filteredArray = Array.tabulate(
      resumesArray.size() - 1,
      func(i) {
        if (i < index) { resumesArray[i] } else { resumesArray[i + 1] };
      },
    );
    resumes.add(caller, List.fromArray<Resume>(filteredArray));
  };

  public query ({ caller }) func getResume(index : Nat) : async Resume {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view resumes");
    };
    let userResumes = switch (resumes.get(caller)) {
      case (null) { Runtime.trap("No resumes found for this user") };
      case (?existing) { existing };
    };
    let resumesArray = convertListToArray(userResumes);
    if (index >= resumesArray.size()) {
      Runtime.trap("Invalid resume index");
    };
    resumesArray[index];
  };

  public query ({ caller }) func getAllResumes() : async [Resume] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view resumes");
    };
    convertListToArray(getUserResumes(caller));
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view session status");
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public query func isStripeConfigured() : async Bool {
    switch (stripeConfig) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
