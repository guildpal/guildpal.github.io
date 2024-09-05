const pgaAdsConfigs = {
  home: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
  order: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
  tasks: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
  timer: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
  storage: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
  note: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
  guild: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
  market: {
    rotation: false,
    allocation: ["hypelab"],
    adRotationPeriod: 30,
  },
};

const adsServer = "https://api-pixels.guildpal.com";

const defaultPersonaAdUnitId = "d126cd27-d130-425e-a332-6b33a0b947b4"; // home
const timeSecond = 1000;
const domainDisplay = "display";
const allAdsSubject = "ALL-ADS";
const pgaSelfAdsSubject = "PGA-SELF-ADS";

let pgaAdConfig = {};
let personaAdUnitId = defaultPersonaAdUnitId;
let slot = "home";
let playerId = "";
let pgaVersion = "";
let pendingEvent = null;
let pendingEventTarget = null;
let clickTarget = null;

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

function showAd(slot, index) {
  // NOTE: not rotate ads when pendingEvent exists
  if (pendingEvent) {
    setTimeout(() => {
      showAd(slot, index);
    }, 5 * 1000);
    return;
  }

  // to see # of all possible impressions
  processImpression(domainDisplay, allAdsSubject);

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
      case "smartyads":
        showSmartyAds(slot, index);
        break;
      case "hypelab":
        showHypelab(slot, index);
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

async function processImpression(domain, subject) {
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

async function processClick(e) {
  const anchor = document.querySelector("#pga-banner-ad a");
  if (!anchor) {
    console.log("no ads");
    // alert("no ads");
    return;
  }

  // console.log("event", e);
  pendingEvent = clonePointerEvent(e);
  pendingEventTarget = e.target;
  // console.log("pendingEvent", pendingEvent);

  e.preventDefault();

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
    dispatchPendingEvent();
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
    // return
  });
}

// coinTraffic

function showCointraffic(slot, index) {
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
  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let bannerElement = document.createElement("hype-banner");
  bannerElement.id = "banner";
  bannerElement.placement = "a034aa49f6";

  let scriptElement = document.createElement("script");
  scriptElement.defer = true;
  scriptElement.src = "https://api.hypelab.com/v1/scripts/hp-sdk.js?v=0";

  containerDiv.appendChild(bannerElement);
  containerDiv.appendChild(scriptElement);

  // initialize after sdk is loaded
  scriptElement.onload = function () {
    HypeLab.initialize({
      environment: "production", // Replace with your environment
      propertySlug: "d001c21f78", // Replace with your property slug
    });
  };
}

// pga

function showPGA(slot, index) {
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
}

// ads

function showADS(slot, index) {
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
}

function showSmartyAds(slot, index) {
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
