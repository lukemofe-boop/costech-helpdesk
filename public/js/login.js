"use strict";

      const passwordInput = document.getElementById("password");
      const togglePassword = document.getElementById("togglePassword");

      if (passwordInput && togglePassword) {
        togglePassword.addEventListener("click", () => {
          const shouldShowPassword = passwordInput.type === "password";

          passwordInput.type = shouldShowPassword ? "text" : "password";
          togglePassword.textContent = shouldShowPassword ? "Hide" : "Show";

          togglePassword.setAttribute(
            "aria-pressed",
            String(shouldShowPassword),
          );

          togglePassword.setAttribute(
            "aria-label",
            shouldShowPassword ? "Hide password" : "Show password",
          );
        });
      }
