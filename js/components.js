async function loadComponent(selector, file) {
  const target = document.querySelector(selector);

  if (!target) return;

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Failed to load ${file}`);
    }

    const html = await response.text();
    target.innerHTML = html;
  } catch (error) {
    console.error(error);
  }
}

async function initComponents() {
  await loadComponent("#site-header", "/components/header.html");
  await loadComponent("#site-footer", "/components/footer.html");

  initMobileMenu();
  setActiveNavLink();
  setCurrentYear();
}

function initMobileMenu() {
  const menuToggle = document.querySelector("#menuToggle");
  const siteNav = document.querySelector("#siteNav");

  if (!menuToggle || !siteNav) return;

  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-active");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.classList.remove("is-active");
    });
  });
}

function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("[data-nav]");

  navLinks.forEach((link) => {
    const navPath = link.getAttribute("data-nav");

    if (navPath === currentPath) {
      link.classList.add("active");
    }

    if (currentPath === "/" && navPath === "/") {
      link.classList.add("active");
    }
  });
}

function setCurrentYear() {
  const yearEl = document.querySelector("#currentYear");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", initComponents);