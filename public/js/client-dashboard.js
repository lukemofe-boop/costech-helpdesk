const dashboardNotice = document.getElementById("dashboard-notice");

      const dashboardNoticeText = document.getElementById(
        "dashboard-notice-text",
      );

      const retryStatsButton = document.getElementById("retry-stats");

      let sessionVerified = false;

      function showDashboardNotice(message, canRetry = false) {
        dashboardNoticeText.textContent = message;
        retryStatsButton.hidden = !canRetry;
        dashboardNotice.hidden = false;
      }

      function hideDashboardNotice() {
        dashboardNotice.hidden = true;
      }

      async function loadClientStats() {
        if (!sessionVerified) {
          return;
        }

        retryStatsButton.disabled = true;

        try {
          const response = await fetch("/client-stats");

          if (!response.ok) {
            throw new Error("Statistics request failed.");
          }

          const stats = await response.json();

          const values = {
            "client-total": stats.total,
            "client-pending": stats.pending,
            "client-progress": stats.inProgress,
            "client-resolved": stats.resolved,
          };

          let loadedCount = 0;

          for (const [elementId, value] of Object.entries(values)) {
            const element = document.getElementById(elementId);

            if (typeof value === "number" && Number.isFinite(value)) {
              element.textContent = value;
              loadedCount++;
            } else {
              element.textContent = "—";
            }
          }

          if (loadedCount === 4) {
            hideDashboardNotice();
          } else {
            showDashboardNotice(
              "Some statistics could not be displayed. Please try again.",
              true,
            );
          }
        } catch (error) {
          console.error("Unable to load client statistics:", error);

          showDashboardNotice(
            "We couldn't load your support statistics. Check your connection and try again.",
            true,
          );
        } finally {
          retryStatsButton.disabled = false;
        }
      }

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
            return;
          }

          document.getElementById("client-welcome").textContent =
            `Welcome, ${user.full_name}.`;

          sessionVerified = true;

          await loadClientStats();
        } catch (error) {
          console.error("Unable to verify client session:", error);

          window.location.href = "/login.html";
        }
      }

      retryStatsButton.addEventListener("click", loadClientStats);

      checkClientSession();
