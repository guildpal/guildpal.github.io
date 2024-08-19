const pgaAdsConfigs = {
  home: {
    rotation: true,
    allocation: ["pga", "pga"],
    adRotationPeriod: 30,
    personaUnitId: "d126cd27-d130-425e-a332-6b33a0b947b4",
  },
  tasks: {
    rotation: false,
    allocation: ["persona"],
    adRotationPeriod: 30,
    personaUnitId: "e371ad57-f708-4a48-8a4c-58f89762b6e6",
  },
  timer: {
    rotation: true,
    allocation: ["pga", "pga"],
    adRotationPeriod: 30,
    personaUnitId: "dadceda3-345b-4bb2-be73-72fb4af12165",
  },
  storage: {
    rotation: true,
    allocation: ["pga", "pga"],
    adRotationPeriod: 30,
    personaUnitId: "157d8bb8-eb2b-443e-80f0-1f2a5977a4c4",
  },
  note: {
    rotation: false,
    allocation: ["cointraffic"],
    adRotationPeriod: 30,
    personaUnitId: "99db66bb-d1cb-41dd-a9a6-4710173d41b3",
  },
  guild: {
    rotation: false,
    allocation: ["persona", "ads", "pga", "pga"],
    adRotationPeriod: 30,
    personaUnitId: "e7b6f005-3d79-4e74-bf6d-6729f33262a1",
  },
  market: {
    rotation: false,
    allocation: ["smartyads"],
    adRotationPeriod: 30,
    personaUnitId: "fe24a1b0-9d34-4cd4-ab42-aeaf5836f594",
  },
};
const defaultPersonaAdUnitId = "d126cd27-d130-425e-a332-6b33a0b947b4"; // home
const timeSecond = 1000;

/////

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
  pgaVersion = searchParams.get("v");
  playerId = searchParams.get("mid") || "";

  pgaAdConfig = pgaAdsConfigs[slot];
  personaAdUnitId = pgaAdConfig.personaUnitId;

  clickTarget = document.querySelector("#pga-banner-ad");
  clickTarget?.addEventListener("click", processClick);

  // window.addEventListener("message", async function (event) {
  //   if (event.data.protocol === "app-to-iframe") {
  //     if (event.data.method === "response-display-toast") {
  //       console.log("from parent", event);
  //       dispatchPendingEvent();
  //     }
  //   }
  // });

  showAd(slot, index);
});

// function requestDisplayToast(message, duration) {
//   if (window.parent === window) {
//     alert(message);
//     dispatchPendingEvent();
//   } else {
//     window.parent.postMessage(
//       {
//         protocol: "iframe-to-app",
//         method: "request-display-toast",
//         payload: { message, duration },
//       },
//       "*"
//     );
//   }
// }

async function requestDisplayToast(message, duration, satusCode) {
  return new Promise((resolve, reject) => {
    toastr.options = {
      positionClass: "toast-center", //"toast-top-center",
      timeOut: duration, // set 0 to prevent from auto hiding
      extendedTimeOut: 0,
      closeOnHover: false,
      progressBar: true,
      onclick: function () {
        dispatchPendingEvent();
        toastr.clear();
        resolve();
      },
      onHidden: function () {
        dispatchPendingEvent();
        resolve();
      },
    };

    if (satusCode === 200 || satusCode === 201) {
      toastr.success(message);
    } else {
      toastr.warning(message);
      // toastr.info(message);
      // toastr.error(message);
    }
  });
}

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

function dispatchPendingEvent() {
  if (pendingEventTarget && pendingEvent) {
    clickTarget?.removeEventListener("click", processClick);
    pendingEventTarget.dispatchEvent(pendingEvent);
    pendingEventTarget = null;
    pendingEvent = null;
    clickTarget?.addEventListener("click", processClick);
  }
}

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

async function processClick(e) {
  const anchor = document.querySelector("#pga-banner-ad a");
  if (!anchor) {
    console.log("no ads");
    // alert("no ads");
    return;
  }

  console.log("event", e);
  pendingEvent = clonePointerEvent(e);
  pendingEventTarget = e.target;
  console.log("pendingEvent", pendingEvent);

  e.preventDefault();

  try {
    showLoader();
    const response = await fetch(
      "https://pga-svc-ads.play-extension.xyz/ads-api/addinteraction",
      {
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
      }
    );
    const result = await response.json();

    if (result.showResult) {
      await requestDisplayToast(
        result.resultMessage,
        result.duration,
        result.status_code
      );
    } else {
      dispatchPendingEvent();
    }
  } catch (err) {
    console.error(err);
    dispatchPendingEvent();
  } finally {
    hideLoader();
  }
}

async function processImpression() {
  try {
    const response = await fetch(
      "https://pga-svc-ads.play-extension.xyz/ads-api/addimpression",
      {
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
      }
    );
    const result = await response.json();
    console.log("processImpression", result);
  } catch (err) {
    console.error(err);
  }
}

function showAd(slot, index) {
  // NOTE: pendingEvent 있을 경우 광고 로테이션 되지 않도록
  if (pendingEvent) {
    setTimeout(() => {
      showAd(slot, index);
    }, 5 * 1000);
    return;
  }

  processImpression();

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

///////////////////////// agency codes

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

// pga

function showPGA(slot, index) {
  let containerDiv = document.querySelector("div#pga-banner-ad");
  containerDiv.innerHTML = "";

  let anchorElement = document.createElement("a");
  anchorElement.href = "https://pixels.guildpal.com";
  anchorElement.target = "_blank";

  let imgElement = document.createElement("img");
  if (index % 2 === 0) {
    imgElement.src = "./images/pga-ad-guildpalpage-2_240726.gif";
  } else {
    imgElement.src = "./images/pga-ad-guildpalpage-1_240726.gif";
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
