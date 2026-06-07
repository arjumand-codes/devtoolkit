/* ================================
   DevToolKit Components Loader
   Header + Footer + Mobile Menu
================================ */

document.addEventListener("DOMContentLoaded", initComponents);

async function initComponents() {
  await loadComponent("#site-header", "/components/header.html");
  await loadComponent("#site-footer", "/components/footer.html");

  initMobileMenu();
  setActiveNavLink();
  setCurrentYear();
}

/* ================================
   Load HTML Components
================================ */

async function loadComponent(selector, filePath) {
  const target = document.querySelector(selector);

  if (!target) return;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}`);
    }

    const html = await response.text();
    target.innerHTML = html;
  } catch (error) {
    console.error(`Component load error: ${filePath}`, error);
  }
}

/* ================================
   Mobile Menu
================================ */

function initMobileMenu() {
  const menuToggle = document.querySelector("#menuToggle");
  const siteNav = document.querySelector("#siteNav");

  if (!menuToggle || !siteNav) {
    console.warn("Mobile menu elements not found.");
    return;
  }

  if (menuToggle.dataset.menuReady === "true") return;
  menuToggle.dataset.menuReady = "true";

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = siteNav.classList.toggle("is-open");

    menuToggle.classList.toggle("is-active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu(menuToggle, siteNav);
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = siteNav.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMobileMenu(menuToggle, siteNav);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu(menuToggle, siteNav);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMobileMenu(menuToggle, siteNav);
    }
  });
}

function closeMobileMenu(menuToggle, siteNav) {
  siteNav.classList.remove("is-open");
  menuToggle.classList.remove("is-active");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

/* ================================
   Active Nav Link
================================ */

function setActiveNavLink() {
  const currentPath = normalizePath(window.location.pathname);
  const navLinks = document.querySelectorAll("#siteNav a");

  navLinks.forEach((link) => {
    let linkPath = "";

    try {
      linkPath = normalizePath(new URL(link.href).pathname);
    } catch (error) {
      linkPath = "";
    }

    const isHomeActive =
      (currentPath === "/" || currentPath === "/index.html") &&
      (linkPath === "/" || linkPath === "/index.html");

    if (linkPath === currentPath || isHomeActive) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function normalizePath(path) {
  if (!path) return "/";

  let cleanPath = path.trim();

  if (cleanPath.endsWith("/") && cleanPath !== "/") {
    cleanPath = cleanPath.slice(0, -1);
  }

  return cleanPath;
}

/* ================================
   Current Year
================================ */

function setCurrentYear() {
  const yearEl = document.querySelector("#currentYear");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
