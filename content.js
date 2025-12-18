(function () {
  const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
  const CONTAINER_ID = "yt-speed-buttons";

  function createSpeedButtons() {
    // Don't create if already exists
    if (document.getElementById(CONTAINER_ID)) return;

    const secondaryInner = document.querySelector("#columns #secondary #secondary-inner");
    if (!secondaryInner) return;

    const video = document.querySelector("video");
    if (!video) return;

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

  function removeSpeedButtons() {
    const existing = document.getElementById(CONTAINER_ID);
    if (existing) {
      existing.remove();
    }
  }

  function init() {
    // Clean up any existing buttons first
    removeSpeedButtons();

    // Try to create buttons immediately
    createSpeedButtons();

    // If #secondary-inner isn't ready yet, observe for it
    if (!document.getElementById(CONTAINER_ID)) {
      const observer = new MutationObserver(() => {
        if (
          document.querySelector("#columns #secondary #secondary-inner") &&
          document.querySelector("video")
        ) {
          createSpeedButtons();
          if (document.getElementById(CONTAINER_ID)) {
            observer.disconnect();
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Timeout safety - stop observing after 30s
      setTimeout(() => observer.disconnect(), 30000);
    }
  }

  // Initial run
  init();

  // Handle YouTube SPA navigation
  document.addEventListener("yt-navigate-finish", init);
})();
