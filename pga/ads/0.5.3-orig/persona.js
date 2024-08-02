const DEFAULT_AD_DURATION = 1000 * 30;
const PERSONA_SDK_CONFIG = {
  apiKey: "persona-pub-0x3206daf2b97d0bd17bf8e10ead94dee5", // An actual API key is generated once you register an app with us.
  environment: "production", // use value 'production' when going live
};

let adUnitConfig = {};

function setupPersona(adUnitId) {
  adUnitConfig = {
    adUnitId,
    containerId: "pga-banner-ad",
  };
}

function showAd(slot, index) {
  const sdk = new PersonaAdSDK.PersonaAdSDK(PERSONA_SDK_CONFIG);
  const adClient = sdk.getClient();
  if (adClient === null) {
    location.href = `./cointraffic.html?slot=${slot}&index=${index}`;
    return;
  }

  adClient.showBannerAd(adUnitConfig, (errorMessage) => {
    console.log("Persona error:", errorMessage);
    location.href = `./cointraffic.html?slot=${slot}&index=${index}`; // &rotation=self?
  });

  scheduleNext(slot, index);
}

function scheduleNext(slot, index) {
  if (index < 5) {
    setTimeout(() => {
      console.log("Lets go to Cointraffic");
      location.href = `./cointraffic.html?slot=${slot}&index=${index + 1}`;
    }, DEFAULT_AD_DURATION);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchParams = new URLSearchParams(window.location.search);
  const slot = (searchParams.get("slot") || "home").toLowerCase().trim();
  const index = Number(searchParams.get("index")) || 1;

  let adUnitId = "d126cd27-d130-425e-a332-6b33a0b947b4";
  switch (slot) {
    case "home":
      adUnitId = "d126cd27-d130-425e-a332-6b33a0b947b4";
      break;
    case "tasks":
      adUnitId = "e371ad57-f708-4a48-8a4c-58f89762b6e6";
      break;
    case "timer":
      adUnitId = "dadceda3-345b-4bb2-be73-72fb4af12165";
      break;
    case "storage":
      adUnitId = "157d8bb8-eb2b-443e-80f0-1f2a5977a4c4";
      break;
    case "note":
      adUnitId = "99db66bb-d1cb-41dd-a9a6-4710173d41b3";
      break;
    case "guild":
      adUnitId = "e7b6f005-3d79-4e74-bf6d-6729f33262a1";
      break;
    case "market":
      adUnitId = "fe24a1b0-9d34-4cd4-ab42-aeaf5836f594";
      break;
  }

  setupPersona(adUnitId);
  showAd(slot, index);
});
