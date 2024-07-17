const pgaAdsConfigs = `
{
  "home": {
    "rotation": false,
    "allocation": ["persona", "ads", "persona", "pga"],
    "adRotationPeriod": 30,
    "personaUnitId": "d126cd27-d130-425e-a332-6b33a0b947b4"
  },
  "tasks": {
    "rotation": false,
    "allocation": ["persona", "ads", "persona", "pga"],
    "adRotationPeriod": 30,
    "personaUnitId": "e371ad57-f708-4a48-8a4c-58f89762b6e6"
  },
  "timer": {
    "rotation": false,
    "allocation": ["pga"],
    "adRotationPeriod": 30,
    "personaUnitId": "dadceda3-345b-4bb2-be73-72fb4af12165"
  },
  "storage": {
    "rotation": false,
    "allocation": ["persona", "ads", "persona", "pga"],
    "adRotationPeriod": 30,
    "personaUnitId": "157d8bb8-eb2b-443e-80f0-1f2a5977a4c4"
  },
  "note": {
    "rotation": false,
    "allocation": ["cointraffic"],
    "adRotationPeriod": 30,
    "personaUnitId": "99db66bb-d1cb-41dd-a9a6-4710173d41b3"
  },
  "guild": {
    "rotation": false,
    "allocation": ["persona", "ads", "persona", "pga"],
    "adRotationPeriod": 30,
    "personaUnitId": "e7b6f005-3d79-4e74-bf6d-6729f33262a1"
  },
  "market": {
    "rotation": false,
    "allocation": ["persona", "ads", "persona", "pga"],
    "adRotationPeriod": 30,
    "personaUnitId": "fe24a1b0-9d34-4cd4-ab42-aeaf5836f594"
  }
}
`
const defaultPersonaAdUnitId = "d126cd27-d130-425e-a332-6b33a0b947b4"; // home
const timeSecond = 1000;

/////

let pgaAdConfig = {};
let personaAdUnitId = defaultPersonaAdUnitId;

function showAd(slot, index) {
  if (index < pgaAdConfig.allocation.length) {
    switch (pgaAdConfig.allocation[index]) {
      case "persona":
        showPersona(pgaAdConfig.personaUnitId, slot, index);
        break;
      case "cointraffic":
          showCointraffic(slot, index);
          break;
      case "pga":
        showPGA(slot, index);
        break;
      case "ads":
        showADS(slot, index);
        break;
      default:
        showPGA(slot, index);
    }
  }

  index++;

  if (index < pgaAdConfig.allocation.length) {
    setTimeout(() => {
      showAd(slot, index);
    }, pgaAdConfig.adRotationPeriod * timeSecond);
  } else if (index === pgaAdConfig.allocation.length && pgaAdConfig.rotation === true) {
      setTimeout(() => {
        showAd(slot, 0);
      }, pgaAdConfig.adRotationPeriod * timeSecond);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // const searchParams = new URLSearchParams(window.location.search);
  // const slot = (searchParams.get("slot") || "home").toLowerCase().trim();
  const index = Number(searchParams.get("index")) || 0;

  const tokens = window.location.search.split('?');
  const slot = (() => {
    for (const token of tokens) {
      if (token) {
        const searchParams = new URLSearchParams(token);
        if (searchParams.get('slot')) {
          return searchParams.get('slot').toLowerCase().trim();
        }
      }
    }

    return 'home';
  })();

  pgaAdConfig = JSON.parse(pgaAdsConfigs)[slot];
  personaAdUnitId = pgaAdConfig.personaUnitId;

  showAd(slot, index);
});


///////////////////////// agency codes

// persona

const PERSONA_SDK_CONFIG = {
  apiKey: "persona-pub-0x3206daf2b97d0bd17bf8e10ead94dee5", // An actual API key is generated once you register an app with us.
  environment: "production", // use value 'production' when going live
};

function showPersona(adUnitId, slot, index) {

  let containerDiv = document.querySelector('body > div');
  containerDiv.innerHTML = '';

  let adUnitConfig = {
    adUnitId,
    containerId: "pga-banner-ad",
  };

  const sdk = new PersonaAdSDK.PersonaAdSDK(PERSONA_SDK_CONFIG);
  const adClient = sdk.getClient();
  if (adClient === null) {
    console.log("Persona error: adClient is null..");
    return
  }

  adClient.showBannerAd(adUnitConfig, (errorMessage) => {
    console.log("Persona error:", errorMessage);
    return
  });
}

// coinTraffic

function showCointraffic(slot, index) {

  let containerDiv = document.querySelector('body > div');
  containerDiv.innerHTML = '';

  let spanElement = document.createElement('span');
  spanElement.id = 'ct_cn9L6gxT7Hq';

  let scriptElement = document.createElement('script');
  scriptElement.async = true;
  scriptElement.src = 'https://appsha-prm.ctengine.io/js/script.js?wkey=bkz3FU91fH';

  containerDiv.appendChild(spanElement);
  containerDiv.appendChild(scriptElement);

  // if (window['ctbkz3FU91fH']) {
  //   window['ctbkz3FU91fH'].reload();
  // }

  // const container = document.getElementById("ct_cn9L6gxT7Hq");
  // if (container === undefined || !container.hasChildNodes()) {
  //   showAd(slot, index);
  // }
}

// pga

function showPGA(slot, index) {

  let containerDiv = document.querySelector('body > div');
  containerDiv.innerHTML = '';

  let anchorElement = document.createElement('a');
  anchorElement.href = 'https://x.com/GuildPal/status/1813211040303247402';
  anchorElement.target = '_blank';

  let imgElement = document.createElement('img');
  imgElement.src = './images/pga-ad-review-event-1.gif';
  imgElement.width = 320;
  imgElement.height = 100;
  imgElement.alt = 'PGA';

  anchorElement.appendChild(imgElement);
  containerDiv.appendChild(anchorElement);
}


// ads

function showADS(slot, index) {

  let containerDiv = document.querySelector('body > div');
  containerDiv.innerHTML = '';

  let iframeElement = document.createElement('iframe');
  iframeElement.setAttribute('data-aa', '2337944');
  iframeElement.src = '//ad.a-ads.com/2337944?size=320x100';
  iframeElement.style.width = '320px';
  iframeElement.style.height = '100px';
  iframeElement.style.border = '0px';
  iframeElement.style.padding = '0';
  iframeElement.style.overflow = 'hidden';
  iframeElement.style.backgroundColor = 'transparent';

  containerDiv.appendChild(iframeElement);
}
