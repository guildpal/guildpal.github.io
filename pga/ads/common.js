let adClient = null;
let adUnitConfig = {};

function setupPersona(adUnitId) {
  var personaConfig = {
    apiKey: "persona-pub-0x3206daf2b97d0bd17bf8e10ead94dee5", // An actual API key is generated once you register an app with us.
    environment: "production", // use value 'production' when going live
  }
  var sdk = new PersonaAdSDK.PersonaAdSDK(personaConfig);
  adClient = sdk.getClient();

  adUnitConfig = {
    adUnitId,
    containerId: "pga-banner-ad"
  }
}

const adPeriod = 30000;
function showPersonaAd() {
  if (adClient === null) {
    return;
  }

  adClient.showBannerAd(adUnitConfig, (errorMessage) => {
    console.log('Persona error:', errorMessage);
    location.href = 'https://guildpal.com/pga/ads/pga-ads-cointraffic.html?rotation=self';
  });

  const searchParams = new URLSearchParams(window.location.search);
  const tab = searchParams.get('tab');
  const orgDisplayCount = searchParams.get('displayCount');
  const displayCount = orgDisplayCount ? Number(orgDisplayCount) : 1;
  setTimeout(() => {
    if (displayCount < 1) {
      const { origin, pathname } = window.location;
      const url = `${origin}${pathname}?displayCount=${displayCount + 1}&tab=${tab}`;
      // console.log('show persona!', url);
      location.href = url;
    } else {
      console.log('Lets go to Cointraffic');
      location.href = `https://guildpal.com/pga/ads/pga-ad-cointraffic.html?tab=${tab}`;
    }
  }, adPeriod);
}

document.addEventListener("DOMContentLoaded", () => {
  showPersonaAd();
})