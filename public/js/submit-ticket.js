async function checkClientSession() {
        try {
          const response = await fetch("/session-user");

          if (!response.ok) {
            window.location.href = "/login.html";
            return;
          }

          const user = await response.json();

          if (user.role !== "client") {
            window.location.href = "/admin-dashboard.html";
          }
        } catch (error) {
          console.error("Unable to verify client session:", error);

          window.location.href = "/login.html";
        }
      }

      const descriptionField = document.getElementById("description");
      const descriptionCount = document.getElementById("description-count");

      function updateDescriptionCount() {
        descriptionCount.textContent = `${descriptionField.value.length} / 3000`;
      }

      descriptionField.addEventListener("input", updateDescriptionCount);

      updateDescriptionCount();

      checkClientSession();
