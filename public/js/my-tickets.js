function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
          const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          };

          return entities[character];
        });
      }

      function formatDate(value) {
        if (!value) {
          return "Not available";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return escapeHTML(value);
        }

        return escapeHTML(
          date.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        );
      }

      async function loadTickets() {
        const ticketsList = document.getElementById("tickets-list");

        ticketsList.setAttribute("aria-busy", "true");

        try {
          const response = await fetch("/my-tickets");

          if (response.status === 401 || response.status === 403) {
            window.location.href = "/login.html";
            return;
          }

          if (!response.ok) {
            throw new Error("Unable to retrieve your requests.");
          }

          const tickets = await response.json();

          if (!Array.isArray(tickets)) {
            throw new Error("The server returned an unexpected response.");
          }

          if (tickets.length === 0) {
            ticketsList.innerHTML = `
              <div class="ticket-card">
                <h2>No Requests Yet</h2>
                <p>
                  You haven't submitted any support requests yet.
                  When you do, you can track their progress here.
                </p>
                <a href="submit-ticket.html" class="btn">
                  Submit a Request <span aria-hidden="true">→</span>
                </a>
              </div>
            `;

            return;
          }

          ticketsList.innerHTML = tickets
            .map((ticket) => {
              const priority = String(ticket.priority ?? "Low");
              const status = String(ticket.status ?? "Pending");

              const allowedPriorities = ["Low", "Medium", "High"];
              const allowedStatuses = [
                "Pending",
                "In Progress",
                "Resolved",
                "Closed",
              ];

              const priorityClass = allowedPriorities.includes(priority)
                ? `priority-${priority.toLowerCase()}`
                : "priority-medium";

              const statusClass = allowedStatuses.includes(status)
                ? `status-${status.toLowerCase().replace(/\s+/g, "-")}`
                : "status-pending";

              const paymentRequired =
                ticket.payment_required == 1 ||
                ticket.payment_required === true;

              const paymentStatus = String(ticket.payment_status || "Unpaid");
              const isPaid = paymentStatus.toLowerCase() === "paid";

              const amount = Number(ticket.amount || 0);
              const formattedAmount = Number.isFinite(amount)
                ? amount.toLocaleString()
                : "0";

              const staffSection = ticket.staff_name
                ? `
                  <div class="assigned-staff-box">
                    <strong>Assigned Support Staff</strong>
                    <p>${escapeHTML(ticket.staff_name)}</p>
                    ${
                      ticket.staff_email
                        ? `<p><strong>Email:</strong> ${escapeHTML(ticket.staff_email)}</p>`
                        : ""
                    }
                  </div>
                `
                : "";

              const paymentSection = paymentRequired
                ? `
                  <div class="payment-box">
                    <strong>Payment Required</strong>
                    <p>
                      Service Charge:
                      <strong>₦${formattedAmount}</strong>
                    </p>
                    <p>
                      <strong>Payment Status:</strong>
                      <span class="payment-status ${
                        isPaid ? "payment-paid" : "payment-unpaid"
                      }">
                        ${escapeHTML(paymentStatus)}
                      </span>
                    </p>
                    ${
                      !isPaid
                        ? `
                          <p class="payment-note">
                            Please contact Costech support for payment
                            instructions.
                          </p>
                        `
                        : ""
                    }
                  </div>
                `
                : "";

              const resolutionSection = ticket.resolution_notes
                ? `
                  <div class="resolution-box">
                    <strong>Support Resolution</strong>
                    <p>${escapeHTML(ticket.resolution_notes)}</p>
                  </div>
                `
                : "";

              return `
                <article class="ticket-card">
                  <h2>${escapeHTML(ticket.title || "Untitled Request")}</h2>

                  <p>
                    <strong>Request ID:</strong>
                    #${escapeHTML(ticket.id)}
                  </p>

                  <div class="ticket-meta">
                    <span class="ticket-badge ${priorityClass}">
                      Priority: ${escapeHTML(priority)}
                    </span>
                    <span class="ticket-badge ${statusClass}">
                      Status: ${escapeHTML(status)}
                    </span>
                  </div>

                  <p>
                    <strong>Category:</strong>
                    ${escapeHTML(ticket.category || "Not specified")}
                  </p>

                  <p>
                    <strong>Description:</strong>
                    ${escapeHTML(ticket.description || "No description provided.")}
                  </p>

                  ${staffSection}
                  ${paymentSection}

                  <p class="ticket-date">
                    <strong>Date Submitted:</strong>
                    ${formatDate(ticket.created_at)}
                  </p>

                  ${resolutionSection}
                </article>
              `;
            })
            .join("");
        } catch (error) {
          console.error("Unable to load support requests:", error);

          ticketsList.innerHTML = `
            <div class="ticket-card">
              <h2>Unable to Load Requests</h2>
              <p>
                We couldn't load your requests right now.
                Please check your connection and try again.
              </p>
              <button
                type="button"
                class="btn"
                onclick="loadTickets()"
              >
                Try Again <span aria-hidden="true">↻</span>
              </button>
            </div>
          `;
        } finally {
          ticketsList.removeAttribute("aria-busy");
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

          await loadTickets();
        } catch (error) {
          console.error("Unable to verify client session:", error);
          window.location.href = "/login.html";
        }
      }

      checkClientSession();
