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
};

const pgaAdsConfigs = {
  home: {
    rotation: false,
    allocation: [ADS.lootrush],
    adRotationPeriod: 30,
    personaUnitId: "d126cd27-d130-425e-a332-6b33a0b947b4",
  },
  order: {
    rotation: false,
    allocation: [ADS.hypelab],
    adRotationPeriod: 30,
    personaUnitId: "d126cd27-d130-425e-a332-6b33a0b947b4",
  },
  tasks: {
    rotation: false,
    allocation: [ADS.hypelab],
    adRotationPeriod: 30,
    personaUnitId: "e371ad57-f708-4a48-8a4c-58f89762b6e6",
  },
  timer: {
    rotation: false,
    allocation: [ADS.persona],
    adRotationPeriod: 30,
    personaUnitId: "dadceda3-345b-4bb2-be73-72fb4af12165",
  },
  storage: {
    rotation: false,
    allocation: [ADS.persona],
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
    allocation: [ADS.cointraffic],
    adRotationPeriod: 30,
    personaUnitId: "e7b6f005-3d79-4e74-bf6d-6729f33262a1",
  },
  market: {
    rotation: false,
    allocation: [ADS.lootrush],
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

let pgaAdConfig = {};
let personaAdUnitId = defaultPersonaAdUnitId;
let slot = "home";
let playerId = "";
let pgaVersion = "";
let pendingEvent = null;
let pendingEventTarget = null;
let clickTarget = null;
let currentAd = null;

document.addEventListener("DOMContentLoaded", () => {
  const search = removeTabParameterFromUrl(window.location.search);
  console.log("search:", search);

  const searchParams = new URLSearchParams(search);
  const index = Number(searchParams.get("index")) || 0;
  slot = (searchParams.get("slot") || "home").toLowerCase().trim();
  pgaVersion = searchParams.get("v") || "0.1.0";
  playerId = searchParams.get("mid") || "";

  pgaAdConfig = pgaAdsConfigs[slot];
  personaAdUnitId = pgaAdConfig.personaUnitId;

  if (compareSemver(pgaVersion, "0.5.8") >= 0) {
    clickTarget = document.querySelector("#pga-banner-ad");
    clickTarget?.addEventListener("click", processClick);
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
    console.log("requestad", result);
    if (result.subject === ADS.aads) {
      showADS(slot, index);
      return;
    } else if (result.subject === ADS.persona) {
      showPersona(pgaAdConfig.personaUnitId, slot, index);
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
        subject: subject, // "RUBY_REWARDS",
        slot: `pga/${slot}`,
        ts: new Date().getTime(),
      }),
    });
    const result = await response.json();
    console.log("processImpression", result);
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
  if (!isBannerLoaded()) {
    e.preventDefault();
    console.log("no ads");
    return;
  }

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
        subject: "RUBY_REWARDS",
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

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let adUnitConfig = {
    adUnitId,
    containerId: "pga-banner-ad",
  };

  const sdk = new PersonaAdSDK.PersonaAdSDK(PERSONA_SDK_CONFIG);
  const adClient = sdk.getClient();
  if (adClient === null) {
    console.log("Persona error: adClient is null..");
    return;
  }

  adClient.showBannerAd(adUnitConfig, (errorMessage) => {
    console.log("Persona error:", errorMessage);
    if (errorMessage === "daily limit reached") {
      showPGA(slot, index);
    }
    // return;
  });

  processImpression(domainDisplay, "agent/persona", slot);
}

// coinTraffic

function showCointraffic(slot, index) {
  currentAd = ADS.cointraffic;

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let spanElement = document.createElement("span");
  spanElement.id = "ct_cn9L6gxT7Hq";

  let scriptElement = document.createElement("script");
  scriptElement.async = true;
  scriptElement.src =
    "https://appsha-prm.ctengine.io/js/script.js?wkey=bkz3FU91fH";

  containerDiv.appendChild(spanElement);
  containerDiv.appendChild(scriptElement);

  processImpression(domainDisplay, "agent/cointraffic", slot);

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

    containerDiv.appendChild(bannerElement);
  };
  processImpression(domainDisplay, "agent/hypelab", slot);
}

// pga

function showPGA(slot, index) {
  currentAd = ADS.pga;

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let anchorElement = document.createElement("a");
  anchorElement.href = "https://pixels.guildpal.com/pga";
  anchorElement.target = "_blank";

  let imgElement = document.createElement("img");
  if (index % 2 === 0) {
    imgElement.src = "./images/three-mins-pga-guide01.gif";
  } else {
    imgElement.src = "./images/three-mins-pga-guide02.gif";
  }
  imgElement.width = 320;
  imgElement.height = 100;
  imgElement.alt = "pixels.guildpal.com";

  anchorElement.appendChild(imgElement);
  containerDiv.appendChild(anchorElement);
  processImpression(domainDisplay, pgaSelfAdsSubject, slot);
}

//

function showLootRush(slot, index) {
  currentAd = ADS.lootrush;

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
  processImpression(domainDisplay, "affiliate/lootrush", slot);
}

// ads

function showADS(slot, index) {
  currentAd = ADS.aads;

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
  processImpression(domainDisplay, "agent/aads", slot);
}

function showSmartyAds(slot, index) {
  currentAd = ADS.smartyads;

  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  var adUnits = [
    {
      code: "pga-banner-ad",
      placement_id: 4203,
      sizes: [320, 100],
      refreshable: true,
      refreshIntervalSec: 30,
    },
  ];
  smarty.buildUnits(adUnits);
  processImpression(domainDisplay, "agent/smartyads", slot);
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
      payload: {path},
    },
    "*"
  );
}

function requestDisplayToast(message, duration, success) {
  window.parent.postMessage(
    {
      protocol: "iframe-to-app",
      method: "display-toast",
      payload: {type: success ? "success" : "warning", message, duration},
    },
    "*"
  );
}

function requestDisplayAlert(message, duration, success) {
  window.parent.postMessage(
    {
      protocol: "iframe-to-app",
      method: "display-alert",
      payload: {type: success ? "success" : "warning", message, duration},
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
