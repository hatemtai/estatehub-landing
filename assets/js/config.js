// Targets for the "Live demo", "Buy" and "Request a quote" buttons on the page.
// While a value is empty its buttons are shown but do not navigate.

// CodeCanyon item: "EstateHub - AI-Powered Real Estate Marketplace & Property Management Platform".
// Envato assigns the numeric item ID on approval; paste it here to switch the Buy buttons on.
var CODECANYON_ITEM_ID = "";
var CODECANYON_SLUG = "estatehub-aipowered-real-estate-marketplace-property-management-platform";

window.ESTATEHUB_LINKS = {
  demo: "https://estatehub.antripe.com",
  purchase: CODECANYON_ITEM_ID
    ? "https://codecanyon.net/item/" + CODECANYON_SLUG + "/" + CODECANYON_ITEM_ID
    : "",
  custom: "mailto:support@antripe.com?subject=EstateHub%20customisation",
};
