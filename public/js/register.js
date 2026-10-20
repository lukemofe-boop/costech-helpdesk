"use strict";

// ==================== PASSWORD VISIBILITY ====================

const passwordToggles = document.querySelectorAll("[data-password-target]");

passwordToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const targetId = toggle.dataset.passwordTarget;
    const passwordInput = document.getElementById(targetId);

    if (!passwordInput) {
      return;
    }

    const isVisible = passwordInput.type === "text";

    passwordInput.type = isVisible ? "password" : "text";
    toggle.textContent = isVisible ? "Show" : "Hide";
    toggle.setAttribute("aria-pressed", String(!isVisible));
    toggle.setAttribute(
      "aria-label",
      `${isVisible ? "Show" : "Hide"} ${
        targetId === "password" ? "password" : "confirm password"
      }`,
    );
  });
});

// ==================== PASSWORD MATCH VALIDATION ====================

const registerForm = document.getElementById("register-form");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const registerMessage = document.getElementById("register-message");

if (registerForm && passwordInput && confirmPasswordInput && registerMessage) {
  function validatePasswords() {
    const passwordsMatch = passwordInput.value === confirmPasswordInput.value;

    if (confirmPasswordInput.value.length === 0) {
      confirmPasswordInput.setCustomValidity("");
      return true;
    }

    confirmPasswordInput.setCustomValidity(
      passwordsMatch ? "" : "Your passwords do not match.",
    );

    return passwordsMatch;
  }

  confirmPasswordInput.addEventListener("input", () => {
    validatePasswords();
    registerMessage.hidden = true;
    registerMessage.textContent = "";
  });

  passwordInput.addEventListener("input", () => {
    if (confirmPasswordInput.value.length > 0) {
      validatePasswords();
    }

    registerMessage.hidden = true;
    registerMessage.textContent = "";
  });

  registerForm.addEventListener("submit", (event) => {
    registerMessage.hidden = true;
    registerMessage.textContent = "";

    if (!validatePasswords()) {
      event.preventDefault();

      registerMessage.textContent =
        "Your passwords do not match. Please check both fields.";

      registerMessage.hidden = false;
      confirmPasswordInput.focus();
    }
  });
}
