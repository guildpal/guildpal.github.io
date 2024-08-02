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

document.addEventListener("DOMContentLoaded", () => {
  const search = removeTabParameterFromUrl(window.location.search);
  console.log("search:", search);

  const searchParams = new URLSearchParams(search);
  const slot = (searchParams.get("slot") || "home").toLowerCase().trim();

  console.log(slot);

  // pgaAdConfig = JSON.parse(pgaAdsConfigs)[slot];
  // personaAdUnitId = pgaAdConfig.personaUnitId;

  // showAd(slot, index);

  const bodyClickHandler = (e) => {
    console.log(e);
    e.preventDefault();
    // e.stopPropagation();
    window.parent.postMessage(
      {
        from: "child",
        type: "test",
      },
      "*"
    );
  };

  const anchor = document.querySelector("a");

  window.addEventListener("message", async function (event) {
    if (event.data.from === "parent") {
      console.log("from parent", event);
      body.removeEventListener("click", bodyClickHandler);
      anchor.click();
      body.addEventListener("click", bodyClickHandler);
    }
  });

  const body = document.querySelector("body");
  body.addEventListener("click", bodyClickHandler);
});
