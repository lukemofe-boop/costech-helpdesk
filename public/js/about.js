// Mobile navigation menu
      const menuToggle = document.getElementById("about-menu-toggle");
      const navigationLinks = document.getElementById("about-nav-links");

      menuToggle.addEventListener("click", function () {
        const isOpen = navigationLinks.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
          "aria-label",
          isOpen ? "Close navigation menu" : "Open navigation menu",
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";
      });

      // Close the mobile menu after a navigation link is selected
      navigationLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navigationLinks.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.setAttribute("aria-label", "Open navigation menu");
          menuToggle.textContent = "☰";
        });
      });

      // Update the footer year automatically
      document.getElementById("current-year").textContent =
        new Date().getFullYear();

      // Reveal content as it enters the viewport
      const revealElements = document.querySelectorAll(".about-page .reveal");

      if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.12,
          },
        );

        revealElements.forEach(function (element) {
          revealObserver.observe(element);
        });
      } else {
        revealElements.forEach(function (element) {
          element.classList.add("is-visible");
        });
      }
