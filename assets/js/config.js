// Targets for the "Live demo", "Buy" and "Request a quote" buttons on the page.
// While a value is empty its buttons are shown but do not navigate.

// CodeCanyon item: "EstateHub - AI-Powered Real Estate Marketplace & Property Management Platform".
// Live item: https://codecanyon.net/item/estatehub-aipowered-real-estate-marketplace-property-management-platform/65503922
var CODECANYON_ITEM_ID = "65503922";
var CODECANYON_SLUG = "estatehub-aipowered-real-estate-marketplace-property-management-platform";

window.ESTATEHUB_LINKS = {
  demo: "https://estatehub.antripe.com/demo",
  purchase: CODECANYON_ITEM_ID
    ? "https://codecanyon.net/item/" + CODECANYON_SLUG + "/" + CODECANYON_ITEM_ID
    : "",
  custom: "mailto:support@antripe.com?subject=EstateHub%20customisation",
};
