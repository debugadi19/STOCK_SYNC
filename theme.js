// theme.js
// Shared light/dark theme toggle for all pages.

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

window.toggleTheme = function () {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeButtons(next);
};

function updateThemeButtons(theme) {
  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.textContent = theme === "dark" ? "Light" : "Dark";
    btn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateThemeButtons(document.documentElement.getAttribute("data-theme") || "light");
});
