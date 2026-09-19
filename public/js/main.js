(() => {
  // ns-hugo-imp:C:\Users\admin\my-blog\themes\hugo-toigian\assets\js\toc.js
  function initTOC() {
    const container = document.getElementById("floating-toc");
    if (!container) return;
    const expanded = document.getElementById("toc-expanded");
    const barsContainer = document.getElementById("toc-bars");
    if (!expanded || !barsContainer) return;
    const links = expanded.querySelectorAll("a");
    links.forEach((link, index) => {
      const bar = document.createElement("div");
      bar.className = "toc-bar";
      bar.dataset.index = index;
      const li = link.parentElement;
      if (li.parentElement.parentElement.tagName === "LI") {
        bar.style.marginLeft = "4px";
        bar.style.width = "12px";
      }
      barsContainer.appendChild(bar);
    });
    const bars = barsContainer.querySelectorAll(".toc-bar");
    const headingIds = Array.from(links).map((link) => link.getAttribute("href").substring(1));
    const headings = headingIds.map((id) => document.getElementById(id)).filter((h) => h);
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -80% 0px",
      threshold: 0
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const activeIndex = headingIds.indexOf(id);
          links.forEach((l) => l.classList.remove("active"));
          bars.forEach((b) => b.classList.remove("active"));
          if (activeIndex !== -1) {
            links[activeIndex].classList.add("active");
            bars[activeIndex].classList.add("active");
          }
        }
      });
    }, observerOptions);
    headings.forEach((h) => observer.observe(h));
    container.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      container.classList.toggle("is-expanded");
    });
  }

  // <stdin>
  window.addEventListener("DOMContentLoaded", function() {
    initTOC();
    const dark_mode_btn = document.getElementById("dark_mode_btn");
    const light_mode_btn = document.getElementById("light_mode_btn");
    if (localStorage.theme === "dark" || !("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
      light_mode_btn.classList.remove("hidden");
    } else {
      document.documentElement.classList.remove("dark");
      dark_mode_btn.classList.remove("hidden");
    }
    const header_theme_btn = document.getElementById("header-theme-button");
    header_theme_btn.addEventListener("click", function() {
      if (document.documentElement.classList.contains("dark")) {
        localStorage.theme = "light";
        document.documentElement.classList.remove("dark");
        light_mode_btn.classList.add("hidden");
        dark_mode_btn.classList.remove("hidden");
      } else {
        localStorage.theme = "dark";
        document.documentElement.classList.add("dark");
        dark_mode_btn.classList.add("hidden");
        light_mode_btn.classList.remove("hidden");
      }
    });
  });
})();
