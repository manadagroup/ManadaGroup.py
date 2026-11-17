document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".main-header");
  const navToggle = document.querySelector(".nav-toggle");

  const closeMenu = () => {
    if (!header || !navToggle) return;
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  };

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  if (header && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    document.querySelectorAll(".main-nav a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const revealItems = document.querySelectorAll(".reveal");
    if (revealItems.length > 0) {
      document.body.classList.add("motion-ready");
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  const getYouTubeEmbedUrl = (value, autoplay = true) => {
    let url;
    try {
      url = new URL(value);
    } catch {
      return null;
    }

    const host = url.hostname.toLowerCase();
    if (!["youtu.be", "youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      return null;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    let videoId = "";
    if (host === "youtu.be") {
      videoId = pathParts[0] || "";
    } else if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") || "";
    } else if (["embed", "shorts", "live"].includes(pathParts[0])) {
      videoId = pathParts[1] || "";
    }

    if (!/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return null;
    const autoplayParam = autoplay ? "?autoplay=1" : "";
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}${autoplayParam}`;
  };

  document.querySelectorAll(".video-thumb").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const embedUrl = href ? getYouTubeEmbedUrl(href) : null;
      if (!embedUrl) return;

      event.preventDefault();
      const image = link.querySelector("img");
      const wrapper = document.createElement("div");
      wrapper.className = "video-embed";

      const iframe = document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.title = image?.alt || "Video de Manada Audiovisual";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.loading = "lazy";
      wrapper.appendChild(iframe);
      link.replaceWith(wrapper);
    });
  });

  const getDriveEmbedUrl = (value) => {
    let url;
    try {
      url = new URL(value);
    } catch {
      return null;
    }

    if (url.hostname.toLowerCase() !== "drive.google.com") return null;
    const fileMatch = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)/);
    const fileId = fileMatch ? fileMatch[1] : url.searchParams.get("id");
    if (!fileId || !/^[A-Za-z0-9_-]+$/.test(fileId)) return null;
    return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
  };

  const renderTalentVideo = (slot, embedUrl, provider) => {
    const title = slot.querySelector("span")?.textContent || "Video de Manada Talentos";
    if (!embedUrl) {
      slot.classList.add("drive-error");
      slot.replaceChildren();
      const error = document.createElement("span");
      error.className = "drive-error-message";
      error.setAttribute("role", "status");
      error.textContent = `No se pudo cargar el video. Verificá el enlace de ${provider}.`;
      slot.appendChild(error);
      console.error(`Enlace de video de ${provider} no válido.`);
      return;
    }

    slot.classList.add("is-playing");
    slot.replaceChildren();
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.loading = "lazy";
    slot.appendChild(iframe);
  };

  document.querySelectorAll("[data-drive-video]").forEach((slot) => {
    const shareUrl = slot.getAttribute("data-drive-url")?.trim();
    if (!shareUrl) return;
    renderTalentVideo(slot, getDriveEmbedUrl(shareUrl), "Google Drive");
  });

  document.querySelectorAll("[data-youtube-video]").forEach((slot) => {
    const shareUrl = slot.getAttribute("data-youtube-url")?.trim();
    if (!shareUrl) return;
    renderTalentVideo(slot, getYouTubeEmbedUrl(shareUrl, false), "YouTube");
  });
});
