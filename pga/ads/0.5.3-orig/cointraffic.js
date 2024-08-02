const DEFAULT_AD_DURATION = 1000 * 20;

function showAd(slot, index) {
  setTimeout(() => {
    const container = document.getElementById("ct_cn9L6gxT7Hq");
    if (container.hasChildNodes()) {
      scheduleNext(slot, index);
    } else {
      location.href = `./fallback.html?slot=${slot}&index=${index}&from=cointraffic`;
    }
  }, 2000);
}

function scheduleNext(slot, index) {
  if (index < 5) {
    setTimeout(() => {
      console.log("Lets go to persona");
      location.href = `./persona.html?slot=${slot}&index=${index + 1}`;
    }, DEFAULT_AD_DURATION);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchParams = new URLSearchParams(window.location.search);
  const slot = (searchParams.get("slot") || "home").toLowerCase().trim();
  const index = Number(searchParams.get("index")) || 1;

  showAd(slot, index);
});
