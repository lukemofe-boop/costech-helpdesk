let allTickets = [];
      let allUsers = [];
      let allStaff = [];

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

      function safeClass(value, allowedValues, fallback) {
        return allowedValues.includes(value) ? value : fallback;
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

      function showMessage(container, heading, message) {
        container.innerHTML = `
          <div class="empty-state">
            <h2>${escapeHTML(heading)}</h2>
            <p>${escapeHTML(message)}</p>
          </div>
        `;
      }

      async function loadAdminTickets() {
        const container = document.getElementById("admin-tickets");

        try {
          const response = await fetch("/admin-tickets");

          if (response.status === 401 || response.status === 403) {
            showMessage(
              container,
              "Admin Access Required",
              "You do not have permission to view support requests.",
            );
            return;
          }

          if (!response.ok) {
            throw new Error("Unable to load tickets.");
          }

          const tickets = await response.json();

          if (!Array.isArray(tickets)) {
            throw new Error("Unexpected ticket response.");
          }

          allTickets = tickets;
          displayTickets(allTickets);
        } catch (error) {
          console.error("Unable to load admin tickets:", error);

          showMessage(
            container,
            "Unable to Load Requests",
            "Something went wrong while loading support requests. Refresh the page and try again.",
          );
        }
      }

      function displayTickets(tickets) {
        const container = document.getElementById("admin-tickets");

        if (tickets.length === 0) {
          showMessage(
            container,
            "No Matching Requests",
            "No support requests match your current search or filters.",
          );
          return;
        }

        container.innerHTML = tickets
          .map((ticket) => {
            const priority = String(ticket.priority || "Medium");
            const status = String(ticket.status || "Pending");

            const priorityClass = safeClass(
              priority,
              ["Low", "Medium", "High"],
              "Medium",
            ).toLowerCase();

            const statusClass = safeClass(
              status,
              ["Pending", "In Progress", "Resolved", "Closed"],
              "Pending",
            )
              .toLowerCase()
              .replace(/\s+/g, "-");

            const assignedStaff = allStaff.find(
              (staff) => staff.id == ticket.assigned_staff_id,
            );

            const ticketId = escapeHTML(ticket.id);
            const title = escapeHTML(ticket.title || "Untitled Request");
            const clientName = escapeHTML(ticket.full_name || "Unknown client");
            const clientEmail = escapeHTML(ticket.email || "Not available");
            const category = escapeHTML(ticket.category || "Not specified");
            const description = escapeHTML(
              ticket.description || "No description provided.",
            );
            const staffName = assignedStaff
              ? escapeHTML(assignedStaff.full_name)
              : "Not assigned";

            const amount = Number(ticket.amount || 0);
            const formattedAmount = Number.isFinite(amount)
              ? amount.toLocaleString()
              : "0";

            const paymentRequired =
              ticket.payment_required == 1 || ticket.payment_required === true;

            const paymentStatus = String(ticket.payment_status || "Unpaid");

            return `
              <article class="ticket-card">
                <h2>${title}</h2>

                <p><strong>Request ID:</strong> #${ticketId}</p>
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Email:</strong> ${clientEmail}</p>
                <p><strong>Assigned Staff:</strong> ${staffName}</p>

                <div class="ticket-meta">
                  <span class="ticket-badge priority-${priorityClass}">
                    Priority: ${escapeHTML(priority)}
                  </span>
                  <span class="ticket-badge status-${statusClass}">
                    Status: ${escapeHTML(status)}
                  </span>
                </div>

                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p class="ticket-date">
                  <strong>Date Submitted:</strong>
                  ${formatDate(ticket.created_at)}
                </p>

                <div class="admin-update-box">
                  <form action="/update-ticket" method="POST">
                    <div class="form-group">
                      <label for="staff-${ticketId}">Assign Support Staff</label>
                      <select id="staff-${ticketId}" name="assigned_staff_id">
                        <option value="">Select support staff</option>
                        ${allStaff
                          .map(
                            (staff) => `
                              <option
                                value="${escapeHTML(staff.id)}"
                                ${
                                  ticket.assigned_staff_id == staff.id
                                    ? "selected"
                                    : ""
                                }
                              >
                                ${escapeHTML(staff.full_name)} (${escapeHTML(staff.email)})
                              </option>
                            `,
                          )
                          .join("")}
                      </select>
                    </div>

                    <input
                      type="hidden"
                      name="ticket_id"
                      value="${ticketId}"
                    />

                    <div class="form-group">
                      <label for="status-${ticketId}">Update Status</label>
                      <select
                        id="status-${ticketId}"
                        name="status"
                        required
                      >
                        ${["Pending", "In Progress", "Resolved"]
                          .map(
                            (option) => `
                              <option
                                value="${option}"
                                ${status === option ? "selected" : ""}
                              >
                                ${option}
                              </option>
                            `,
                          )
                          .join("")}
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="resolution-${ticketId}">Resolution Notes</label>
                      <textarea
                        id="resolution-${ticketId}"
                        name="resolution_notes"
                        rows="4"
                        placeholder="Enter details about the solution or action taken..."
                      >${escapeHTML(ticket.resolution_notes || "")}</textarea>
                    </div>

                    <div class="form-group">
                      <label for="payment-${ticketId}">Payment Required</label>
                      <select id="payment-${ticketId}" name="payment_required">
                        <option
                          value="0"
                          ${!paymentRequired ? "selected" : ""}
                        >
                          No
                        </option>
                        <option
                          value="1"
                          ${paymentRequired ? "selected" : ""}
                        >
                          Yes
                        </option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="amount-${ticketId}">Service Charge (₦)</label>
                      <input
                        type="number"
                        id="amount-${ticketId}"
                        name="amount"
                        min="0"
                        step="0.01"
                        value="${escapeHTML(formattedAmount.replace(/,/g, ""))}"
                        placeholder="Enter service charge"
                      />
                    </div>

                    <div class="form-group">
                      <label for="payment-status-${ticketId}">Payment Status</label>
                      <select
                        id="payment-status-${ticketId}"
                        name="payment_status"
                      >
                        <option
                          value="Unpaid"
                          ${paymentStatus === "Unpaid" ? "selected" : ""}
                        >
                          Unpaid
                        </option>
                        <option
                          value="Paid"
                          ${paymentStatus === "Paid" ? "selected" : ""}
                        >
                          Paid
                        </option>
                      </select>
                    </div>

                    <button type="submit" class="btn">
                      Update Request
                    </button>
                  </form>
                </div>
              </article>
            `;
          })
          .join("");
      }

      function filterTickets() {
        const searchText = document
          .getElementById("search-tickets")
          .value.trim()
          .toLowerCase();

        const statusFilter = document.getElementById("filter-status").value;
        const priorityFilter = document.getElementById("filter-priority").value;
        const categoryFilter = document.getElementById("filter-category").value;

        const filteredTickets = allTickets.filter((ticket) => {
          const title = String(ticket.title || "").toLowerCase();
          const clientName = String(ticket.full_name || "").toLowerCase();
          const email = String(ticket.email || "").toLowerCase();

          const matchesSearch =
            title.includes(searchText) ||
            clientName.includes(searchText) ||
            email.includes(searchText);

          const matchesStatus =
            statusFilter === "All" || ticket.status === statusFilter;

          const matchesPriority =
            priorityFilter === "All" || ticket.priority === priorityFilter;

          const matchesCategory =
            categoryFilter === "All" || ticket.category === categoryFilter;

          return (
            matchesSearch && matchesStatus && matchesPriority && matchesCategory
          );
        });

        displayTickets(filteredTickets);
      }

      function filterUsers() {
        const searchText = document
          .getElementById("search-users")
          .value.trim()
          .toLowerCase();

        const filteredUsers = allUsers.filter((user) => {
          const name = String(user.full_name || "").toLowerCase();
          const email = String(user.email || "").toLowerCase();

          return name.includes(searchText) || email.includes(searchText);
        });

        displayUsers(filteredUsers);
      }

      document
        .getElementById("search-tickets")
        .addEventListener("input", filterTickets);

      document
        .getElementById("filter-status")
        .addEventListener("change", filterTickets);

      document
        .getElementById("filter-priority")
        .addEventListener("change", filterTickets);

      document
        .getElementById("filter-category")
        .addEventListener("change", filterTickets);

      document.getElementById("reset-filters").addEventListener("click", () => {
        document.getElementById("search-tickets").value = "";
        document.getElementById("filter-status").value = "All";
        document.getElementById("filter-priority").value = "All";
        document.getElementById("filter-category").value = "All";

        displayTickets(allTickets);
      });

      document
        .getElementById("search-users")
        .addEventListener("input", filterUsers);

      async function loadAdminStats() {
        try {
          const response = await fetch("/admin-stats");

          if (!response.ok) {
            throw new Error("Unable to load statistics.");
          }

          const stats = await response.json();

          document.getElementById("total-requests").textContent =
            stats.total ?? 0;

          document.getElementById("pending-requests").textContent =
            stats.pending ?? 0;

          document.getElementById("progress-requests").textContent =
            stats.inProgress ?? 0;

          document.getElementById("resolved-requests").textContent =
            stats.resolved ?? 0;
        } catch (error) {
          console.error("Unable to load admin statistics:", error);
        }
      }

      async function loadAdminUsers() {
        const container = document.getElementById("admin-users");

        try {
          const response = await fetch("/admin-users");

          if (response.status === 401 || response.status === 403) {
            showMessage(
              container,
              "Admin Access Required",
              "You do not have permission to view registered clients.",
            );
            return;
          }

          if (!response.ok) {
            throw new Error("Unable to load users.");
          }

          const users = await response.json();

          if (!Array.isArray(users)) {
            throw new Error("Unexpected client response.");
          }

          allUsers = users;
          displayUsers(allUsers);
        } catch (error) {
          console.error("Unable to load registered clients:", error);

          showMessage(
            container,
            "Unable to Load Clients",
            "Something went wrong while loading registered clients.",
          );
        }
      }

      function displayUsers(users) {
        const container = document.getElementById("admin-users");

        if (users.length === 0) {
          showMessage(
            container,
            "No Matching Clients",
            "No registered clients match your search.",
          );
          return;
        }

        container.innerHTML = users
          .map((user) => {
            const userId = escapeHTML(user.id);

            return `
              <article class="user-card">
                <div class="user-card-header">
                  <div>
                    <h3>${escapeHTML(user.full_name || "Unnamed Client")}</h3>
                    <p class="user-email">${escapeHTML(user.email || "No email")}</p>
                  </div>
                  <span class="user-id">Client #${userId}</span>
                </div>

                <div class="user-card-details">
                  <div class="user-detail">
                    <span class="detail-label">Support Requests</span>
                    <strong>${escapeHTML(user.ticket_count ?? 0)}</strong>
                  </div>

                  <div class="user-detail">
                    <span class="detail-label">Registered</span>
                    <strong>${formatDate(user.created_at)}</strong>
                  </div>
                </div>

                <form
                  action="/delete-user"
                  method="POST"
                  class="delete-user-form"
                  data-client-name="${escapeHTML(user.full_name || "this client")}"
                >
                  <input type="hidden" name="user_id" value="${userId}" />
                  <button type="submit" class="delete-btn">
                    Delete Client
                  </button>
                </form>
              </article>
            `;
          })
          .join("");
      }

      document
        .getElementById("admin-users")
        .addEventListener("submit", (event) => {
          const form = event.target.closest(".delete-user-form");

          if (!form) {
            return;
          }

          const clientName = form.dataset.clientName || "this client";

          if (
            !window.confirm(
              `Are you sure you want to delete ${clientName}'s account?`,
            )
          ) {
            event.preventDefault();
          }
        });

      async function loadSupportStaff() {
        try {
          const response = await fetch("/support-staff");

          if (!response.ok) {
            throw new Error("Unable to load support staff.");
          }

          const staff = await response.json();

          if (!Array.isArray(staff)) {
            throw new Error("Unexpected support staff response.");
          }

          allStaff = staff;
          displayTickets(
            allTickets.filter((ticket) => {
              return matchesCurrentTicketFilters(ticket);
            }),
          );
        } catch (error) {
          console.error("Unable to load support staff:", error);
        }
      }

      function matchesCurrentTicketFilters(ticket) {
        const searchText = document
          .getElementById("search-tickets")
          .value.trim()
          .toLowerCase();

        const statusFilter = document.getElementById("filter-status").value;
        const priorityFilter = document.getElementById("filter-priority").value;
        const categoryFilter = document.getElementById("filter-category").value;

        return (
          (String(ticket.title || "")
            .toLowerCase()
            .includes(searchText) ||
            String(ticket.full_name || "")
              .toLowerCase()
              .includes(searchText) ||
            String(ticket.email || "")
              .toLowerCase()
              .includes(searchText)) &&
          (statusFilter === "All" || ticket.status === statusFilter) &&
          (priorityFilter === "All" || ticket.priority === priorityFilter) &&
          (categoryFilter === "All" || ticket.category === categoryFilter)
        );
      }

      async function loadPriorityStats() {
        try {
          const response = await fetch("/admin-priority-stats");

          if (!response.ok) {
            throw new Error("Unable to load priority statistics.");
          }

          const stats = await response.json();

          document.getElementById("low-priority-count").textContent =
            stats.low ?? 0;

          document.getElementById("medium-priority-count").textContent =
            stats.medium ?? 0;

          document.getElementById("high-priority-count").textContent =
            stats.high ?? 0;
        } catch (error) {
          console.error("Unable to load priority statistics:", error);
        }
      }

      async function loadCategoryStats() {
        const container = document.getElementById("category-report-list");

        try {
          const response = await fetch("/admin-category-stats");

          if (!response.ok) {
            throw new Error("Unable to load category statistics.");
          }

          const categories = await response.json();

          if (!Array.isArray(categories) || categories.length === 0) {
            showMessage(
              container,
              "No Category Data",
              "No support requests have been submitted yet.",
            );
            return;
          }

          container.innerHTML = categories
            .map(
              (item) => `
                <article class="report-card">
                  <h3>${escapeHTML(item.category || "Other")}</h3>
                  <p class="report-number">${escapeHTML(item.count ?? 0)}</p>
                  <p>Support requests</p>
                </article>
              `,
            )
            .join("");
        } catch (error) {
          console.error("Unable to load category reports:", error);

          showMessage(
            container,
            "Unable to Load Reports",
            "Something went wrong while loading category statistics.",
          );
        }
      }

      async function loadStaffStats() {
        const container = document.getElementById("staff-report-list");

        try {
          const response = await fetch("/admin-staff-stats");

          if (!response.ok) {
            throw new Error("Unable to load staff statistics.");
          }

          const staffStats = await response.json();

          if (!Array.isArray(staffStats) || staffStats.length === 0) {
            showMessage(
              container,
              "No Support Staff",
              "No support staff report data is available.",
            );
            return;
          }

          container.innerHTML = staffStats
            .map(
              (staff) => `
                <article class="report-card">
                  <h3>${escapeHTML(staff.full_name || "Unnamed Staff Member")}</h3>
                  <p>${escapeHTML(staff.email || "No email available")}</p>
                  <p class="report-number">${escapeHTML(staff.ticket_count ?? 0)}</p>
                  <p>Assigned Requests</p>
                </article>
              `,
            )
            .join("");
        } catch (error) {
          console.error("Unable to load staff reports:", error);

          showMessage(
            container,
            "Unable to Load Staff Reports",
            "Something went wrong while loading support staff statistics.",
          );
        }
      }

      async function loadSupportStaffManagement() {
        const container = document.getElementById(
          "support-staff-management-list",
        );

        try {
          const response = await fetch("/support-staff");

          if (!response.ok) {
            throw new Error("Unable to load support staff.");
          }

          const staffMembers = await response.json();

          if (!Array.isArray(staffMembers) || staffMembers.length === 0) {
            showMessage(
              container,
              "No Support Staff",
              "No support staff members have been added yet.",
            );
            return;
          }

          container.innerHTML = staffMembers
            .map(
              (staff) => `
                <article class="user-card">
                  <h3>${escapeHTML(staff.full_name || "Unnamed Staff Member")}</h3>
                  <p><strong>Email:</strong> ${escapeHTML(staff.email || "No email")}</p>

                  <form
                    action="/delete-support-staff"
                    method="POST"
                    class="delete-staff-form"
                    data-staff-name="${escapeHTML(staff.full_name || "this staff member")}"
                  >
                    <input
                      type="hidden"
                      name="staff_id"
                      value="${escapeHTML(staff.id)}"
                    />
                    <button type="submit" class="delete-btn">
                      Delete Staff
                    </button>
                  </form>
                </article>
              `,
            )
            .join("");
        } catch (error) {
          console.error("Unable to load staff management list:", error);

          showMessage(
            container,
            "Unable to Load Staff",
            "Something went wrong while loading the support staff list.",
          );
        }
      }

      document
        .getElementById("support-staff-management-list")
        .addEventListener("submit", (event) => {
          const form = event.target.closest(".delete-staff-form");

          if (!form) {
            return;
          }

          const staffName = form.dataset.staffName || "this staff member";

          if (
            !window.confirm(`Are you sure you want to delete ${staffName}?`)
          ) {
            event.preventDefault();
          }
        });

      async function checkAdminSession() {
        try {
          const response = await fetch("/session-user");

          if (!response.ok) {
            window.location.href = "/login.html";
            return false;
          }

          const user = await response.json();

          if (user.role !== "admin") {
            window.location.href = "/client-dashboard.html";
            return false;
          }

          document.getElementById("admin-welcome").textContent =
            `Welcome, ${user.full_name || "Administrator"}. Manage and monitor client support requests.`;

          return true;
        } catch (error) {
          console.error("Unable to verify admin session:", error);
          window.location.href = "/login.html";
          return false;
        }
      }

      async function startAdminDashboard() {
        const isAdmin = await checkAdminSession();

        if (!isAdmin) {
          return;
        }

        await Promise.all([
          loadAdminTickets(),
          loadAdminUsers(),
          loadAdminStats(),
          loadSupportStaff(),
          loadPriorityStats(),
          loadCategoryStats(),
          loadStaffStats(),
          loadSupportStaffManagement(),
        ]);
      }

      startAdminDashboard();
