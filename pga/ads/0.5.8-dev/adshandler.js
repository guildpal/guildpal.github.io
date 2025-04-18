// const pgaAdsConfigs = {
//   home: {
//     rotation: true,
//     allocation: [ADS.pga, ADS.pga],
//     adRotationPeriod: 30,
//     personaUnitId: "d126cd27-d130-425e-a332-6b33a0b947b4",
//   },
//   order: {
//     rotation: true,
//     allocation: [ADS.pga, ADS.pga],
//     adRotationPeriod: 30,
//     personaUnitId: "d126cd27-d130-425e-a332-6b33a0b947b4",
//   },
//   tasks: {
//     rotation: true,
//     allocation: [ADS.persona],
//     adRotationPeriod: 30,
//     personaUnitId: "e371ad57-f708-4a48-8a4c-58f89762b6e6",
//   },
//   timer: {
//     rotation: true,
//     allocation: [ADS.persona, ADS.pga, ADS.pga],
//     adRotationPeriod: 30,
//     personaUnitId: "dadceda3-345b-4bb2-be73-72fb4af12165",
//   },
//   storage: {
//     rotation: true,
//     allocation: [ADS.pga, ADS.pga, ADS.cointraffic],
//     adRotationPeriod: 30,
//     personaUnitId: "157d8bb8-eb2b-443e-80f0-1f2a5977a4c4",
//   },
//   note: {
//     rotation: true,
//     allocation: [ADS.cointraffic],
//     adRotationPeriod: 30,
//     personaUnitId: "99db66bb-d1cb-41dd-a9a6-4710173d41b3",
//   },
//   guild: {
//     rotation: true,
//     allocation: [ADS.cointraffic],
//     adRotationPeriod: 30,
//     personaUnitId: "e7b6f005-3d79-4e74-bf6d-6729f33262a1",
//   },
//   market: {
//     rotation: true,
//     allocation: [ADS.aads, ADS.pga, ADS.pga, ADS.persona],
//     adRotationPeriod: 30,
//     personaUnitId: "fe24a1b0-9d34-4cd4-ab42-aeaf5836f594",
//   },
// };

const ADS = {
  pga: "pga",
  persona: "persona",
  cointraffic: "cointraffic",
  smartyads: "smartyads",
  hypelab: "hypelab",
  aads: "aads",
  lootrush: "lootrush",
  prebid: "prebid",
  plots: "plots",
};

const pgaAdsConfigs = {
  home: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "d126cd27-d130-425e-a332-6b33a0b947b4",
  },
  order: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "d126cd27-d130-425e-a332-6b33a0b947b4",
  },
  tasks: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "e371ad57-f708-4a48-8a4c-58f89762b6e6",
  },
  timer: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 60,
    personaUnitId: "dadceda3-345b-4bb2-be73-72fb4af12165",
  },
  storage: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "157d8bb8-eb2b-443e-80f0-1f2a5977a4c4",
  },
  note: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "99db66bb-d1cb-41dd-a9a6-4710173d41b3",
  },
  guild: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "e7b6f005-3d79-4e74-bf6d-6729f33262a1",
  },
  market: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "fe24a1b0-9d34-4cd4-ab42-aeaf5836f594",
  },
  shopping: {
    rotation: false,
    allocation: [ADS.pga],
    adRotationPeriod: 30,
    personaUnitId: "fe24a1b0-9d34-4cd4-ab42-aeaf5836f594",
  },
};

const adsServer = "https://api-pixels.guildpal.com";

const defaultPersonaAdUnitId = "d126cd27-d130-425e-a332-6b33a0b947b4"; // home
const timeSecond = 1000;
const domainDisplay = "display";
const domainAffiliate = "affiliate";
const allAdsSubject = "ALL-ADS";
const pgaSelfAdsSubject = "pga";
const prebidAdUnits = [
  {
    code: "pga-banner-ad",
    mediaTypes: {
      banner: {
        sizes: [[320, 100]],
      },
    },
    bids: [
      {
        bidder: "cointraffic",
        params: {
          placementId: "cn9L6gxT7Hq", // Banner Code in dashboard
        },
      },
    ],
  },
];

let pgaAdConfig = {};
let personaAdUnitId = defaultPersonaAdUnitId;
let regionalPersonaAdUnitId = "9f741163-d0fd-4bed-9a84-f780d1677c5c";
let slot = "home";
let playerId = "";
let pgaVersion = "";
let pendingEvent = null;
let pendingEventTarget = null;
let clickTarget = null;
let currentAd = null;
let currentSubject = "";

document.addEventListener("DOMContentLoaded", () => {
  const search = removeTabParameterFromUrl(window.location.search);

  const searchParams = new URLSearchParams(search);
  const index = Number(searchParams.get("index")) || 0;
  slot = (searchParams.get("slot") || "home").toLowerCase().trim();
  pgaVersion = searchParams.get("v") || "0.1.0";
  playerId = searchParams.get("mid") || "";

  pgaAdConfig = pgaAdsConfigs[slot];
  personaAdUnitId = pgaAdConfig.personaUnitId;

  if (compareSemver(pgaVersion, "0.5.8") >= 0) {
    clickTarget = document.querySelector("#pga-banner-ad");
    clickTarget?.addEventListener("click", processClick, { capture: true });

    const bodyTarget = document.querySelector("body");
    bodyTarget?.addEventListener("click", processClick, { capture: true });
  }

  showAd(slot, index);
});

async function showAd(slot, index) {
  // NOTE: not rotate ads when pendingEvent exists
  if (pendingEvent) {
    setTimeout(() => {
      showAd(slot, index);
    }, 5 * 1000);
    return;
  }

  /////// add requestAd call
  // to-do: refactoring
  try {
    const response = await fetch(`${adsServer}/ads-api/requestad`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Atomrigs-Pga-Pid": playerId,
      },
    });
    const result = await response.json();
    if (result.subject === ADS.aads) {
      showADS(slot, index);
      return;
    } else if (result.subject === ADS.persona) {
      showPersona(pgaAdConfig.personaUnitId, slot, index);
      return;
    } else if (result.subject.includes("agent/persona-regional")) {
      showPersonaRegional(regionalPersonaAdUnitId, slot, index, result.subject);
      return;
    } else if (result.subject === ADS.hypelab) {
      showHypelab(slot, index);
      return;
    } else if (result.subject === ADS.plots) {
      showPlotsFinance(slot, index);
      return;
    }
  } catch (err) {
    console.error(err);
  }

  /////// add requestAd call - end

  // to see # of all possible impressions
  // moved into each ad ftns
  // processImpression(domainDisplay, allAdsSubject, slot);

  if (index < pgaAdConfig.allocation.length) {
    switch (pgaAdConfig.allocation[index]) {
      case ADS.persona:
        showPersona(pgaAdConfig.personaUnitId, slot, index);
        break;
      case ADS.cointraffic:
        showCointraffic(slot, index);
        break;
      case ADS.pga:
        showPGA(slot, index);
        break;
      case ADS.aads:
        showADS(slot, index);
        break;
      case ADS.smartyads:
        showSmartyAds(slot, index);
        break;
      case ADS.hypelab:
        showHypelab(slot, index);
        break;
      case ADS.lootrush:
        showLootRush(slot, index);
        break;
      case ADS.prebid:
        showPrebid(slot, index);
        break;
      case ADS.plots:
        showPlotsFinance(slot, index);
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
  } else if (
    index === pgaAdConfig.allocation.length &&
    pgaAdConfig.rotation === true
  ) {
    setTimeout(() => {
      showAd(slot, 0);
    }, pgaAdConfig.adRotationPeriod * timeSecond);
  }
}

async function processImpression(domain, subject, slot) {
  // modified by Luke
  try {
    const response = await fetch(`${adsServer}/ads-api/addimpression`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Atomrigs-Pga-Pid": playerId,
      },
      body: JSON.stringify({
        player_id: playerId,
        domain: domain, // "display",
        subject: subject,
        slot: `pga/${slot}`,
        ts: new Date().getTime(),
      }),
    });
    const result = await response.json();
  } catch (err) {
    console.error(err);
  }
}

async function processDeimpression(domain, subject, slot) {
  // modified by Luke
  try {
    const response = await fetch(`${adsServer}/ads-api/reduceimpression`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Atomrigs-Pga-Pid": playerId,
      },
      body: JSON.stringify({
        player_id: playerId,
        domain: domain, // "display",
        subject: subject, // "RUBY_REWARDS",
        slot: `pga/${slot}`,
        ts: new Date().getTime(),
      }),
    });
    const result = await response.json();
  } catch (err) {
    console.error(err);
  }
}

function isBannerLoaded() {
  if (currentAd === ADS.hypelab) {
    const el = document.querySelector("#pga-banner-ad > #banner");
    return el?.style?.display === "block";
  }

  // rest
  const anchor = document.querySelector("#pga-banner-ad a");
  return !!anchor;
}

async function processClick(e) {
  // if (!isBannerLoaded()) {
  //   e.preventDefault();
  //   return;
  // }

  // console.log("event", e);
  // pendingEvent = clonePointerEvent(e);
  // pendingEventTarget = e.target;
  // console.log("pendingEvent", pendingEvent);

  // e.preventDefault();

  try {
    showLoader();
    const response = await fetch(`${adsServer}/ads-api/addinteraction`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Atomrigs-Pga-Pid": playerId,
      },
      body: JSON.stringify({
        player_id: playerId,
        domain: "display",
        subject: currentSubject || "RUBY_REWARDS",
        slot: `pga/${slot}`,
        ts: new Date().getTime(),
      }),
    });
    const result = await response.json();
    if (result.showResult) {
      await showResult(
        result.resultMessage,
        result.duration,
        result.status_code === 200 || result.status_code === 201
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
    // dispatchPendingEvent();
  }
}

async function showResult(message, duration, success) {
  return new Promise((resolve) => {
    if (success) {
      requestReloadNotice();
    }

    // displayToast(message, duration, success, resolve);
    // requestDisplayToastWithCallback(message, duration, success, resolve);
    // requestDisplayAlertWithCallback(message, duration, success, resolve);

    if (compareSemver(pgaVersion, "0.6.0") >= 0) {
      requestDisplayAlertWithCallback(message, duration, success, resolve);
    } else {
      displayToast(message, duration, success, resolve);
    }
  });
}

function dispatchPendingEvent() {
  if (pendingEventTarget && pendingEvent) {
    clickTarget?.removeEventListener("click", processClick);
    pendingEventTarget.dispatchEvent(pendingEvent);
    pendingEventTarget = null;
    pendingEvent = null;
    clickTarget?.addEventListener("click", processClick);
  }
}

// -----------------------------------------------------
// agency codes
// -----------------------------------------------------

// persona

const PERSONA_SDK_CONFIG = {
  apiKey: "persona-pub-0x3206daf2b97d0bd17bf8e10ead94dee5", // An actual API key is generated once you register an app with us.
  environment: "production", // use value 'production' when going live
};

function showPersona(adUnitId, slot, index) {
  currentAd = ADS.persona;
  currentSubject = "agent/persona";

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let adUnitConfig = {
    adUnitId,
    containerId: "pga-banner-ad",
  };

  const sdk = new PersonaAdSDK.PersonaAdSDK(PERSONA_SDK_CONFIG);
  const adClient = sdk.getClient();
  if (adClient === null) {
    return;
  }

  adClient.showBannerAd(adUnitConfig, (errorMessage) => {
    processDeimpression(domainDisplay, currentSubject, slot);

    showAd(slot, index);
  });

  processImpression(domainDisplay, currentSubject, slot);
}

function showPersonaRegional(adUnitId, slot, index, subject) {
  currentAd = ADS.persona;
  currentSubject = subject;

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let adUnitConfig = {
    adUnitId,
    containerId: "pga-banner-ad",
  };

  const sdk = new PersonaAdSDK.PersonaAdSDK(PERSONA_SDK_CONFIG);
  const adClient = sdk.getClient();
  if (adClient === null) {
    return;
  }

  adClient.showBannerAd(adUnitConfig, (errorMessage) => {
    processDeimpression(domainDisplay, subject, slot);

    // showHypelab(slot, index);
  });

  processImpression(domainDisplay, subject, slot);

  setTimeout(() => {
    showAd(slot, index);
  }, 30000);
}

function showPrebid(slot, index) {
  currentAd = ADS.prebid;
  currentSubject = "agent/prebid";

  const containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  pbjs.onEvent("bidWon", (data) => {
    processImpression(domainDisplay, currentSubject, slot);
  });
  pbjs.onEvent("bidRejected", (data) => {
    showPGA();
  });
  pbjs.onEvent("adRenderFailed", (data) => {});
  pbjs.onEvent("bidTimeout", (data) => {});

  pbjs.removeAdUnit();

  pbjs.que.push(function () {
    pbjs.addAdUnits(prebidAdUnits);
    pbjs.requestBids({
      timeout: 2000,
      bidsBackHandler: renderAllAdUnits,
    });
  });
}
function renderAllAdUnits() {
  var winners = pbjs.getHighestCpmBids();
  for (var i = 0; i < winners.length; i++) {
    renderOne(winners[i]);
  }
}
function renderOne(winningBid) {
  if (winningBid && winningBid.adId) {
    var div = document.getElementById(winningBid.adUnitCode);
    if (div) {
      const iframe = document.createElement("iframe");
      iframe.scrolling = "no";
      iframe.frameBorder = "0";
      iframe.marginHeight = "0";
      iframe.marginHeight = "0";
      iframe.name = `prebid_ads_iframe_${winningBid.adUnitCode}`;
      iframe.title = "3rd party ad content";
      iframe.sandbox.add(
        "allow-forms",
        "allow-popups",
        "allow-popups-to-escape-sandbox",
        "allow-same-origin",
        "allow-scripts",
        "allow-top-navigation-by-user-activation"
      );
      iframe.setAttribute("aria-label", "Advertisment");
      iframe.style.setProperty("border", "0");
      iframe.style.setProperty("margin", "0");
      iframe.style.setProperty("overflow", "hidden");
      div.appendChild(iframe);
      const iframeDoc = iframe.contentWindow.document;
      pbjs.renderAd(iframeDoc, winningBid.adId);
      const normalizeCss = `/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */button,hr,input{overflow:visible}progress,sub,sup{vertical-align:baseline}[type=checkbox],[type=radio],legend{box-sizing:border-box;padding:0}html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}details,main{display:block}h1{font-size:2em;margin:.67em 0}hr{box-sizing:content-box;height:0}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}a{background-color:transparent}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}img{border-style:none}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:ButtonText dotted 1px}fieldset{padding:.35em .75em .625em}legend{color:inherit;display:table;max-width:100%;white-space:normal}textarea{overflow:auto}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}[hidden],template{display:none}`;
      const iframeStyle = iframeDoc.createElement("style");
      iframeStyle.appendChild(iframeDoc.createTextNode(normalizeCss));
      iframeDoc.head.appendChild(iframeStyle);
    }
  }
}

function showCointraffic(slot, index) {
  currentAd = ADS.cointraffic;
  currentSubject = "agent/cointraffic";

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let spanElement = document.createElement("span");
  spanElement.id = "ct_cn9L6gxT7Hq";

  let scriptElement = document.createElement("script");
  scriptElement.async = true;
  scriptElement.src =
    "https://appsha-prm.ctengine.io/js/script.js?wkey=bkz3FU91fH";

  // Note: Cointraffic ad clicks cannot be captured by global event listeners
  // We use a wrapper div with absolute positioning as a workaround to capture clicks
  const existingWrapper = document.getElementById("cointraffic-wrapper");
  if (existingWrapper) {
    existingWrapper.removeEventListener("click", processClick);
    existingWrapper.parentElement?.removeChild(existingWrapper);
  }

  const wrapperDiv = document.createElement("div");
  wrapperDiv.id = "cointraffic-wrapper";
  wrapperDiv.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    `;
  wrapperDiv.addEventListener("click", (e) => {
    spanElement?.click();
    processClick(e);
  });

  containerDiv.appendChild(wrapperDiv);
  containerDiv.appendChild(spanElement);
  containerDiv.appendChild(scriptElement);

  // to-do: measure actual impressions
  // issue
  processImpression(domainDisplay, currentSubject, slot);

  // if (window['ctbkz3FU91fH']) {
  //   window['ctbkz3FU91fH'].reload();
  // }

  // const container = document.getElementById("ct_cn9L6gxT7Hq");
  // if (container === undefined || !container.hasChildNodes()) {
  //   showAd(slot, index);
  // }
}

// hypelab

function showHypelab(slot, index) {
  currentAd = ADS.hypelab;
  currentSubject = "agent/hypelab";

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let scriptElement = document.createElement("script");
  scriptElement.defer = true;
  scriptElement.src = "https://api.hypelab.com/v1/scripts/hp-sdk.js?v=0";

  containerDiv.appendChild(scriptElement);

  // initialize after sdk is loaded
  scriptElement.onload = function () {
    HypeLab.initialize({
      environment: "production", // Replace with your environment
      propertySlug: "d001c21f78", // Replace with your property slug
    });

    let bannerElement = document.createElement("hype-banner");
    bannerElement.id = "banner";
    bannerElement.setAttribute("placement", "a034aa49f6");

    bannerElement.addEventListener("ready", function () {
      // call processImpression where an actual impression occurs
      processImpression(domainDisplay, currentSubject, slot);
    });

    bannerElement.addEventListener("error", function () {
      showAd(slot, index);
    });

    containerDiv.appendChild(bannerElement);
  };
}

const pgaBannerConfigs = [
  {
    src: "./images/pwa-banner1.gif",
    alt: "PWA Banner 1",
    href: "https://pixels.guildpal.com?popup=false",
  },
  {
    src: "./images/pwa-banner2.gif",
    alt: "PWA Banner 2",
    href: "https://pixels.guildpal.com/market/raw-materials?popup=false",
  },
  {
    src: "./images/pwa-banner3.gif",
    alt: "PWA Banner 3",
    href: "https://pixels.guildpal.com?popup=false",
  },
];

const plotsBannerConfigs = [
  {
    src: "./images/plots-1.png",
    alt: "Plots Banner 1",
    href: "https://promo.plots.finance/",
  },
  {
    src: "./images/plots-2.png",
    alt: "Plots Banner 2",
    href: "https://promo.plots.finance/",
  },
];

function showPGA(slot, index) {
  currentAd = ADS.pga;
  currentSubject = pgaSelfAdsSubject;

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let anchorElement = document.createElement("a");

  // Remove target="_blank" and add click event handler instead
  anchorElement.onclick = function (e) {
    e.preventDefault(); // Prevent default anchor behavior
    window.open(selectedBanner.src, "_blank", "width=400,height=800"); // Open in new window
    return false;
  };

  const randomIndex = Math.floor(Math.random() * pgaBannerConfigs.length);
  const selectedBanner = pgaBannerConfigs[randomIndex];

  const imgElement = document.createElement("img");
  imgElement.src = selectedBanner.src;
  imgElement.alt = selectedBanner.alt;
  imgElement.width = 320;
  imgElement.height = 100;

  anchorElement.href = selectedBanner.href;

  anchorElement.appendChild(imgElement);
  containerDiv.appendChild(anchorElement);
  processImpression(domainDisplay, pgaSelfAdsSubject, slot);

  // show hypelab after 30 seconds as showPGA is called as fallback for now
  // setTimeout(() => {
  //   showAd(slot, index);
  // }, 30000);
}

function showPlotsFinance(slot, index) {
  currentAd = ADS.plotsfinance;
  currentSubject = "direct/plots";

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let anchorElement = document.createElement("a");
  anchorElement.target = "_blank";

  const randomIndex = Math.floor(Math.random() * plotsBannerConfigs.length);
  const selectedBanner = plotsBannerConfigs[randomIndex];

  const imgElement = document.createElement("img");
  imgElement.src = selectedBanner.src;
  imgElement.alt = selectedBanner.alt;
  imgElement.width = 320;
  imgElement.height = 100;

  anchorElement.href = selectedBanner.href;

  anchorElement.appendChild(imgElement);
  containerDiv.appendChild(anchorElement);
  processImpression(domainDisplay, currentSubject, slot);

  setTimeout(() => {
    showAd(slot, index);
  }, 60000);
}

function showLootRush(slot, index) {
  currentAd = ADS.lootrush;
  currentSubject = "affiliate/lootrush";

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let anchorElement = document.createElement("a");
  anchorElement.href =
    "https://www.lootrush.com/collections/pixels---farm-land807754?ref=6755d3f7&utm_campaign=land_rental&utm_medium=banner&utm_source=pga";
  anchorElement.target = "_blank";

  let imgElement = document.createElement("img");
  imgElement.src = "./images/lootrush-ad.gif";

  imgElement.width = 320;
  imgElement.height = 100;
  imgElement.alt = "www.lootrush.com";

  anchorElement.appendChild(imgElement);
  containerDiv.appendChild(anchorElement);
  processImpression(domainDisplay, currentSubject, slot);
}

// ads

function showADS(slot, index) {
  currentAd = ADS.aads;
  currentSubject = "agent/aads";

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let iframeElement = document.createElement("iframe");
  iframeElement.setAttribute("data-aa", "2337944");
  iframeElement.src = "//ad.a-ads.com/2337944?size=320x100";
  iframeElement.style.width = "320px";
  iframeElement.style.height = "100px";
  iframeElement.style.border = "0px";
  iframeElement.style.padding = "0";
  iframeElement.style.overflow = "hidden";
  iframeElement.style.backgroundColor = "transparent";

  containerDiv.appendChild(iframeElement);

  // to-do: measure actual impressions
  // issue
  processImpression(domainDisplay, currentSubject, slot);

  // show hypelab after 30 seconds as showPGA is called as fallback for now
  setTimeout(() => {
    showAd(slot, index);
  }, 30000);
}

function showSmartyAds(slot, index) {
  currentAd = ADS.smartyads;
  currentSubject = "agent/smartyads";

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  var adUnits = [
    {
      code: "pga-banner-ad",
      placement_id: 4543,
      sizes: [320, 100],
      // ip: "192.168.1.1",
      // gdpr: "1",
      // gdpr_consent:
      //   "BOSSotLOSSotLAPABAENBc-AAAAgR7_______9______9uz_Gv_v_f__33e8__9v_l_7_-___u_-33d4-_1vX99yfm1-7ftr3t",
      // gpp: "DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN",
      // gpp_sid: "2",
      // coppa: "0",
      refreshable: true,
      refreshIntervalSec: 30,
    },
  ];
  smarty.buildUnits(adUnits);
  // to-do: measure actual impressions
  // issue
  processImpression(domainDisplay, currentSubject, slot);
}

// -----------------------------------------------------
// utils
// -----------------------------------------------------

function removeTabParameterFromUrl(search) {
  const paramStart = search.indexOf("?tab=");
  if (paramStart !== -1) {
    const paramEnd = search.indexOf("&", paramStart);
    if (paramEnd !== -1) {
      // Remove the entire parameter including its value
      return (
        search.substring(0, paramStart) + "&" + search.substring(paramEnd + 1)
      );
    } else {
      return search.substring(0, paramStart);
    }
  }
  return search;
}

const compareSemver = (version1, version2) => {
  const v1 = version1.split(".").map(Number);
  const v2 = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
};

function showLoader() {
  const cover = document.querySelector("#pga-banner-cover");
  if (cover) {
    cover.style.display = "block";
  }
}

function hideLoader() {
  const cover = document.querySelector("#pga-banner-cover");
  if (cover) {
    cover.style.display = "none";
  }
}

function displayToast(message, duration, success, callback) {
  toastr.options = {
    positionClass: "toast-center", //"toast-top-center",
    timeOut: duration, // set 0 to prevent from auto hiding
    extendedTimeOut: 0,
    closeOnHover: false,
    progressBar: true,
    onclick: function () {
      toastr.clear();
      callback();
    },
    onHidden: function () {
      callback();
    },
  };

  if (success) {
    toastr.success(message);
  } else {
    toastr.warning(message);
    // toastr.info(message);
    // toastr.error(message);
  }
}

function requestReloadNotice() {
  window.parent.postMessage(
    {
      protocol: "iframe-to-app",
      method: "reload-notice",
      payload: {},
    },
    "*"
  );
}

function requestNavigate(path) {
  window.parent.postMessage(
    {
      protocol: "iframe-to-app",
      method: "navigate-to",
      payload: { path },
    },
    "*"
  );
}

function requestDisplayToast(message, duration, success) {
  window.parent.postMessage(
    {
      protocol: "iframe-to-app",
      method: "display-toast",
      payload: { type: success ? "success" : "warning", message, duration },
    },
    "*"
  );
}

function requestDisplayAlert(message, duration, success) {
  window.parent.postMessage(
    {
      protocol: "iframe-to-app",
      method: "display-alert",
      payload: { type: success ? "success" : "warning", message, duration },
    },
    "*"
  );
}

function requestDisplayToastWithCallback(message, duration, success, callback) {
  function messageHandler(event) {
    if (
      event.data.protocol === "app-to-iframe" &&
      event.data.method === "display-toast-response"
    ) {
      window.removeEventListener("message", messageHandler);
      callback();
    }
  }
  window.addEventListener("message", messageHandler);
  requestDisplayToast(message, duration, success);
}

function requestDisplayAlertWithCallback(message, duration, success, callback) {
  function messageHandler(event) {
    if (
      event.data.protocol === "app-to-iframe" &&
      event.data.method === "display-alert-response"
    ) {
      window.removeEventListener("message", messageHandler);
      callback();
    }
  }
  window.addEventListener("message", messageHandler);
  requestDisplayAlert(message, duration, success);
}

// async function requestDisplayToast(message, duration, satusCode) {
//   return new Promise((resolve, reject) => {
//     const width = 300;
//     const height = 300;
//     const left = (screen.width - width) / 2;
//     const top = (screen.height - height) / 2;
//     const options = [
//       `width=${width}`,
//       `height=${height}`,
//       `top=${top}`,
//       `left=${left}`,
//       "resizable=yes",
//       "scrollbars=no",
//       "toolbar=no",
//       "menubar=no",
//       "location=no",
//       "directories=no",
//       "status=no",
//       "copyhistory=no",
//       "fullscreen=no",
//       "dependent=yes",
//       "alwaysRaised=yes",
//     ].join(",");

//     dispatchPendingEvent();

//     setTimeout(() => {
//       const urlObject = new URL("https://www.google.com");
//       // urlObject.searchParams.set('playerId', AppService.PLAYER_ID);
//       // urlObject.searchParams.set('pgaVersion', version);
//       const popUpWindow = window.open(
//         urlObject.toString(),
//         "ad-response",
//         options
//       );
//       // if (popUpWindow && target === "ad-response") {
//       //   window.candyGameOpenedPopupWindow = popUpWindow
//       // }
//       popUpWindow.focus();
//     }, 1);

//     resolve();
//   });
// }

function clonePointerEvent(originalEvent) {
  const clonedEvent = new PointerEvent(originalEvent.type, {
    bubbles: originalEvent.bubbles,
    cancelable: originalEvent.cancelable,
    composed: originalEvent.composed,
    pointerId: originalEvent.pointerId,
    width: originalEvent.width,
    height: originalEvent.height,
    pressure: originalEvent.pressure,
    tangentialPressure: originalEvent.tangentialPressure,
    tiltX: originalEvent.tiltX,
    tiltY: originalEvent.tiltY,
    twist: originalEvent.twist,
    pointerType: originalEvent.pointerType,
    isPrimary: originalEvent.isPrimary,
    screenX: originalEvent.screenX,
    screenY: originalEvent.screenY,
    clientX: originalEvent.clientX,
    clientY: originalEvent.clientY,
    ctrlKey: originalEvent.ctrlKey,
    altKey: originalEvent.altKey,
    shiftKey: originalEvent.shiftKey,
    metaKey: originalEvent.metaKey,
    button: originalEvent.button,
    buttons: originalEvent.buttons,
    relatedTarget: originalEvent.relatedTarget,
    offsetX: originalEvent.offsetX,
    offsetY: originalEvent.offsetY,
    movementX: originalEvent.movementX,
    movementY: originalEvent.movementY,
  });

  return clonedEvent;
}
