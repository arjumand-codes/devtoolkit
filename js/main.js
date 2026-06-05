/* ================================
   DevToolKit - Main JS
   Mobile Menu + Common UI
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");
  const navActions = document.querySelector(".nav-actions");

  function closeMobileMenu() {
    document.body.classList.remove("mobile-menu-open");

    if (mobileMenuBtn) {
      mobileMenuBtn.classList.remove("active");
      mobileMenuBtn.setAttribute("aria-label", "Open mobile menu");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }
  }

  function openMobileMenu() {
    document.body.classList.add("mobile-menu-open");

    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add("active");
      mobileMenuBtn.setAttribute("aria-label", "Close mobile menu");
      mobileMenuBtn.setAttribute("aria-expanded", "true");
    }
  }

  function toggleMobileMenu() {
    const isOpen = document.body.classList.contains("mobile-menu-open");

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }

  if (navMenu) {
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  if (navActions) {
    navActions.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      closeMobileMenu();
    }
  });

  window.addEventListener("scroll", () => {
    if (!header) return;

    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  });
});