let adClient = null;
let adUnitConfig = {};

function setupPersona(apiKey, adUnitId) {
  var personaConfig = {
    apiKey,
    environment: "production", // use value 'production' when going live
  }
  var sdk = new PersonaAdSDK.PersonaAdSDK(personaConfig);
  adClient = sdk.getClient();

  adUnitConfig = {
    adUnitId,
    containerId: "pga-banner-ad"
  }
}

const adPeriod = 20000;
function showPersonaAd() {
  if (adClient === null) {
    return;
  }

  adClient.showBannerAd(adUnitConfig, (errorMessage) => {
    console.log('Persona error:', errorMessage);
    location.href = 'https://guildpal.com/pga/ads/pga-ads-cointraffic.html?rotation=self';
  });

  const searchParams = new URLSearchParams(window.location.search);
  const orgDisplayCount = searchParams.get('displayCount');
  const displayCount = orgDisplayCount ? Number(orgDisplayCount) : 1;
  setTimeout(() => {
    if (displayCount < 1) {
      const { origin, pathname } = window.location;
      const url = `${origin}${pathname}?displayCount=${displayCount + 1}`;
      // console.log('show persona!', url);
      location.href = url;
    } else {
      console.log('Lets go to Cointraffic');
      location.href = 'https://guildpal.com/pga/ads/pga-ads-cointraffic.html';
    }
  }, adPeriod);
}

document.addEventListener("DOMContentLoaded", () => {
  showPersonaAd();
})