(function () {
  if (typeof window === "undefined") {
    return;
  }

  const toggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const showIcon = document.getElementById("show-button");
  const hideIcon = document.getElementById("hide-button");
  const header = document.querySelector(".header");

  const setNavState = (isOpen) => {
    if (!navMenu) {
      return;
    }
    navMenu.classList.toggle("hidden", !isOpen);
    if (showIcon && hideIcon) {
      showIcon.classList.toggle("hidden", isOpen);
      hideIcon.classList.toggle("hidden", !isOpen);
    }
    document.body.classList.toggle("overflow-hidden", isOpen);
  };

  if (toggle) {
    setNavState(toggle.checked);
    toggle.addEventListener("change", () => {
      setNavState(toggle.checked);
    });
  }

  const closeNav = () => {
    if (toggle && toggle.checked) {
      toggle.checked = false;
      setNavState(false);
    }
  };

  if (navMenu) {
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("click", (event) => {
    if (!toggle || !navMenu) {
      return;
    }
    const clickedInsideToggle = toggle.contains(event.target);
    const clickedInsideMenu = navMenu.contains(event.target);
    if (!clickedInsideToggle && !clickedInsideMenu) {
      closeNav();
    }
  });

  const updateHeaderShadow = () => {
    if (!header) {
      return;
    }
    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", updateHeaderShadow, { passive: true });
  updateHeaderShadow();

  const activeButtonClasses = [
    "bg-white",
    "text-rose-700",
    "shadow-inner",
    "border-rose-200",
    "border-b-white",
  ];
  const inactiveButtonClasses = ["text-slate-600", "border-transparent"];

  const activateTab = (container, targetId) => {
    const buttons = container.querySelectorAll("[data-tab-button]");
    const panels = container.querySelectorAll("[data-tab-panel]");
    buttons.forEach((button) => {
      const isActive = button.dataset.tabTarget === targetId;
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.classList.remove(...activeButtonClasses, ...inactiveButtonClasses);
      if (isActive) {
        button.classList.add(...activeButtonClasses);
      } else {
        button.classList.add(...inactiveButtonClasses);
      }
    });
    panels.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.classList.toggle("hidden", !isActive);
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
      panel.tabIndex = isActive ? 0 : -1;
    });
  };

  const initTabs = (container) => {
    if (!container || container.__tabsReady) {
      return;
    }
    const buttons = container.querySelectorAll("[data-tab-button]");
    const panels = container.querySelectorAll("[data-tab-panel]");
    if (!buttons.length || !panels.length) {
      return;
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        activateTab(container, button.dataset.tabTarget);
      });
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
          return;
        }
        event.preventDefault();
        const offset = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + offset + buttons.length) % buttons.length;
        buttons[nextIndex].focus();
        activateTab(container, buttons[nextIndex].dataset.tabTarget);
      });
    });

    const activeButton = Array.from(buttons).find(
      (button) => button.getAttribute("aria-selected") === "true",
    );
    if (activeButton) {
      activateTab(container, activeButton.dataset.tabTarget);
    } else {
      activateTab(container, buttons[0].dataset.tabTarget);
    }
    container.__tabsReady = true;
  };

  window.__ghTabsInit = (element) => {
    initTabs(element);
  };

  document.querySelectorAll("[data-tabs]").forEach((tabsRoot) => {
    initTabs(tabsRoot);
  });
})();
