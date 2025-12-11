document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".main-header");

  // Navbar con sombra
  const onScroll = () => {
    if (window.scrollY > 8) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", onScroll);
  onScroll();

  // Menú hamburguesa (mobile)
  const navToggle = document.querySelector(".nav-toggle");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      header.classList.toggle("nav-open");
    });
  }

  // Cerrar menú al hacer click en un link del nav
  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
    });
  });

  // CTAs con data-scroll-target
  document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
    const targetSelector = btn.getAttribute("data-scroll-target");
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;

    btn.addEventListener("click", () => {
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Año automático en el footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Efecto fade-in al scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Aplicar fade-in a elementos principales
  document.querySelectorAll("section, .card, .video-card, .aliado-card, .cta-row, .cta-stack, h2, h3, p").forEach((element) => {
    observer.observe(element);
  });

  // Reproducción inline: reemplaza thumbnail por iframe al hacer clic
  const toEmbedUrl = (u) => {
    try {
      const parsed = new URL(u);
      // youtu.be short links
      if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.replace(/^\//, "");
        return `https://www.youtube.com/embed/${id}${parsed.search || ""}`;
      }
      // youtube.com watch or embed
      if (parsed.hostname.includes("youtube.com")) {
        const v = parsed.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}${parsed.search || ""}`;
        if (parsed.pathname.startsWith("/embed/")) return u;
      }
    } catch (e) {
      // fallback: return original
    }
    return u;
  };

  document.querySelectorAll(".video-thumb").forEach((thumb) => {
    const clickHandler = (e) => {
      e.preventDefault();
      const href = thumb.getAttribute("href");
      if (!href) return;
      const embed = toEmbedUrl(href);

      const wrapper = document.createElement("div");
      wrapper.className = "video-embed";

      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", embed);
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay");
      iframe.setAttribute("allowfullscreen", "");
      const img = thumb.querySelector("img");
      iframe.setAttribute("title", (img && img.alt) ? img.alt : "Video player");

      wrapper.appendChild(iframe);
      thumb.replaceWith(wrapper);
    };

    thumb.addEventListener("click", clickHandler);
    thumb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") clickHandler(e);
    });
  });
});
