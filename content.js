(function () {
  const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
  const CONTAINER_ID = "yt-speed-buttons";
  let observer = null;

  function isSidebarReady() {
    // Wait for sidebar to have actual content (related videos loaded)
    const secondaryInner = document.querySelector("#columns #secondary #secondary-inner");
    if (!secondaryInner) return false;

    // Check if related videos or other content has loaded
    const hasContent = secondaryInner.querySelector(
      "ytd-watch-next-secondary-results-renderer, ytd-compact-video-renderer"
    );
    return !!hasContent;
  }

  function createSpeedButtons() {
    // Don't create if already exists
    if (document.getElementById(CONTAINER_ID)) return false;

    if (!isSidebarReady()) return false;

    const secondaryInner = document.querySelector("#columns #secondary #secondary-inner");
    const video = document.querySelector("video");
    if (!video) return false;

    const container = document.createElement("div");
    container.id = CONTAINER_ID;

    SPEEDS.forEach((speed) => {
      const btn = document.createElement("button");
      btn.textContent = speed === 1 ? "1x" : `${speed}x`;
      btn.dataset.speed = speed;
      btn.className = "yt-speed-btn";

      if (video.playbackRate === speed) {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => {
        video.playbackRate = speed;
      });

      container.appendChild(btn);
    });

    // Insert as first child of #secondary-inner
    secondaryInner.insertBefore(container, secondaryInner.firstChild);

    // Listen for rate changes (from native controls or other sources)
    video.addEventListener("ratechange", updateActiveButton);

    return true;
  }

  function updateActiveButton() {
    const video = document.querySelector("video");
    if (!video) return;

    const buttons = document.querySelectorAll(".yt-speed-btn");
    buttons.forEach((btn) => {
      const speed = parseFloat(btn.dataset.speed);
      btn.classList.toggle("active", video.playbackRate === speed);
    });
  }

  function ensureButtons() {
    // Only create if we're on a watch page
    if (!location.pathname.startsWith("/watch")) return;

    // If buttons don't exist but the sidebar and video do, create them
    if (!document.getElementById(CONTAINER_ID)) {
      createSpeedButtons();
    }
  }

  function startObserver() {
    // Don't create multiple observers
    if (observer) return;

    observer = new MutationObserver(() => {
      ensureButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Start observer immediately - this is our primary detection mechanism
  // Don't rely on YouTube's custom events as they may not be ready on first load
  startObserver();

  // Also try immediately in case everything is already loaded
  ensureButtons();

  // YouTube SPA events - these help but aren't required
  document.addEventListener("yt-navigate-finish", ensureButtons);
  document.addEventListener("yt-page-data-updated", () => {
    console.log("[YT Speed Buttons] yt-page-data-updated fired");
    ensureButtons();
  });
})();
