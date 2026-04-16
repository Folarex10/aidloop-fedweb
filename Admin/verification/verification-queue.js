
// const API_BASE_URL = "https://aidloop-backend.onrender.com/api";

// const els = {
//   searchInput: document.getElementById("searchInput"),
//   orgTable: document.getElementById("orgTable"),
//   orgTableWrap: document.getElementById("orgTableWrap"),
//   pendingCount: document.getElementById("pendingCount"),
//   adminName: document.getElementById("adminName"),
//   adminAvatar: document.getElementById("adminAvatar"),
//   filterButtons: document.querySelectorAll(".filter-btn"),
//   emptyState: document.getElementById("emptyState"),
//   logoutBtn: document.getElementById("logoutBtn"),
//   logoutModal: document.getElementById("logoutModal"),
//   closeLogoutModal: document.getElementById("closeLogoutModal"),
//   cancelLogout: document.getElementById("cancelLogout"),
//   confirmLogout: document.getElementById("confirmLogout")
// };

// let organizers = [];
// let currentFilter = "awaiting";

// async function apiRequest(endpoint, options = {}) {
//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {})
//     },
//     ...options
//   });

//   const contentType = response.headers.get("content-type") || "";
//   const data = contentType.includes("application/json")
//     ? await response.json()
//     : await response.text();

//   if (!response.ok) {
//     throw new Error(
//       (data && data.message) ||
//       (data && data.error) ||
//       "Request failed"
//     );
//   }

//   return data;
// }

// function normalizeUsers(payload) {
//   if (Array.isArray(payload)) return payload;
//   if (Array.isArray(payload?.users)) return payload.users;
//   if (Array.isArray(payload?.data)) return payload.data;
//   return [];
// }

// function getVerificationStatus(user) {
//   const status = String(user.status || "").toLowerCase();
//   const approvalStatus = String(user.approvalStatus || "").toLowerCase();
//   const isVerified = Boolean(user.isVerified);

//   if (status === "rejected" || approvalStatus === "rejected") {
//     return "rejected";
//   }

//   if (
//     status === "approved" ||
//     approvalStatus === "approved" ||
//     status === "verified" ||
//     approvalStatus === "verified" ||
//     isVerified
//   ) {
//     return "approved";
//   }

//   return "awaiting";
// }

// function applyQueuedStatusOverride(list) {
//   const raw = sessionStorage.getItem("aidloop_verification_queue_update");
//   if (!raw) return list;

//   try {
//     const queued = JSON.parse(raw);
//     if (!queued?.id || !queued?.status) return list;

//     const updated = list.map((org) => {
//       const orgId = String(org._id || org.id || "");
//       if (orgId !== String(queued.id)) return org;

//       return {
//         ...org,
//         status: queued.status,
//         approvalStatus: queued.status,
//         isVerified: queued.status === "approved" ? true : org.isVerified,
//         _verificationStatus: queued.status
//       };
//     });

//     sessionStorage.removeItem("aidloop_verification_queue_update");
//     return updated;
//   } catch {
//     sessionStorage.removeItem("aidloop_verification_queue_update");
//     return list;
//   }
// }

// function getLocation(user) {
//   if (typeof user.location === "string" && user.location.trim()) {
//     return user.location;
//   }

//   if (user.location && typeof user.location === "object") {
//     return (
//       user.location.city ||
//       user.location.state ||
//       user.location.venue ||
//       "—"
//     );
//   }

//   return user.city || user.state || "—";
// }

// function getDisplayName(user) {
//   return user.fullName || user.name || user.organizationName || "Unnamed Organizer";
// }

// function badgeText(status) {
//   if (status === "approved") return "Approved";
//   if (status === "rejected") return "Rejected";
//   return "Awaiting Verification";
// }

// function getSortDate(user) {
//   return new Date(
//     user.createdAt ||
//     user.updatedAt ||
//     user.dateCreated ||
//     0
//   ).getTime();
// }

// function updatePendingCount() {
//   const count = organizers.filter(
//     (org) => org._verificationStatus === "awaiting"
//   ).length;

//   els.pendingCount.textContent = count;
// }

// function renderTable() {
//   const query = els.searchInput.value.trim().toLowerCase();

//   const filtered = organizers.filter((org) => {
//     const matchesFilter =
//       currentFilter === "all"
//         ? true
//         : org._verificationStatus === currentFilter;

//     const searchText = `
//       ${getDisplayName(org)}
//       ${org.email || ""}
//       ${getLocation(org)}
//       ${org._verificationStatus}
//     `.toLowerCase();

//     return matchesFilter && searchText.includes(query);
//   });

//   if (!filtered.length) {
//     els.orgTableWrap.style.display = "none";
//     els.emptyState.style.display = "block";
//     return;
//   }

//   els.orgTableWrap.style.display = "table";
//   els.emptyState.style.display = "none";

//   els.orgTable.innerHTML = filtered.map((org) => {
//     const id = org._id || org.id || "";
//     const status = org._verificationStatus;

//     return `
//       <tr data-status="${status}">
//         <td>${getDisplayName(org)}</td>
//         <td>${org.email || "—"}</td>
//         <td>${getLocation(org)}</td>
//         <td>
//           <span class="badge ${status}">
//             ${badgeText(status)}
//           </span>
//         </td>
//         <td>
//           <button class="view" data-id="${id}">
//             View Details
//           </button>
//         </td>
//       </tr>
//     `;
//   }).join("");

//   attachViewDetailsHandlers();
// }

// function attachViewDetailsHandlers() {
//   document.querySelectorAll(".view").forEach((btn) => {
//     btn.addEventListener("click", () => {
//       const id = btn.dataset.id;
//       window.location.href = `verification-details.html?id=${encodeURIComponent(id)}`;
//     });
//   });
// }

// async function loadAdminProfile() {
//   try {
//     let profile;

//     try {
//       profile = await apiRequest("/users/me");
//     } catch {
//       profile = await apiRequest("/user/me");
//     }

//     els.adminName.textContent =
//       profile.fullName || profile.name || "Admin";

//     if (profile.profileImage) {
//       els.adminAvatar.src = profile.profileImage;
//     }
//   } catch (err) {
//     console.error("Admin profile error:", err.message);
//   }
// }

// async function loadVerificationQueue() {
//   try {
//     let payload;

//     try {
//       payload = await apiRequest("/user");
//     } catch {
//       payload = await apiRequest("/users");
//     }

//     const users = normalizeUsers(payload);

//     organizers = users
//       .filter((u) => String(u.role || "").toLowerCase() === "organizer")
//       .map((u) => ({
//         ...u,
//         _verificationStatus: getVerificationStatus(u)
//       }));

//     organizers = applyQueuedStatusOverride(organizers)
//       .sort((a, b) => getSortDate(b) - getSortDate(a));

//     updatePendingCount();
//     renderTable();
//   } catch (err) {
//     console.error("Verification queue error:", err.message);
//     els.orgTable.innerHTML = `
//       <tr><td colspan="5">Failed to load data</td></tr>
//     `;
//   }
// }

// function bindFilters() {
//   els.filterButtons.forEach((btn) => {
//     btn.addEventListener("click", () => {
//       els.filterButtons.forEach((b) => b.classList.remove("active"));
//       btn.classList.add("active");

//       currentFilter = btn.dataset.filter;
//       renderTable();
//     });
//   });
// }

// function openLogoutModal() {
//   els.logoutModal?.classList.remove("hidden");
// }

// function closeLogoutModal() {
//   els.logoutModal?.classList.add("hidden");
// }

// async function handleLogout() {
//   try {
//     await apiRequest("/auth/logout", { method: "POST" });
//   } catch (err) {
//     console.warn("Logout failed:", err.message);
//   } finally {
//     localStorage.clear();
//     sessionStorage.clear();
//     window.location.href = "../../index.html";
//   }
// }

// function bindUI() {
//   els.searchInput?.addEventListener("input", renderTable);
//   bindFilters();

//   els.logoutBtn?.addEventListener("click", openLogoutModal);
//   els.cancelLogout?.addEventListener("click", closeLogoutModal);
//   els.closeLogoutModal?.addEventListener("click", closeLogoutModal);
//   els.confirmLogout?.addEventListener("click", handleLogout);
// }

// document.addEventListener("DOMContentLoaded", async () => {
//   bindUI();
//   await loadAdminProfile();
//   await loadVerificationQueue();
// });













const API_BASE_URL = "https://aidloop-backend.onrender.com/api";
const VERIFICATION_STATUS_STORAGE_KEY = "aidloop_verification_status_overrides";

const els = {
  searchInput: document.getElementById("searchInput"),
  orgTable: document.getElementById("orgTable"),
  orgTableWrap: document.getElementById("orgTableWrap"),
  pendingCount: document.getElementById("pendingCount"),
  adminName: document.getElementById("adminName"),
  adminAvatar: document.getElementById("adminAvatar"),
  filterButtons: document.querySelectorAll(".filter-btn"),
  emptyState: document.getElementById("emptyState"),
  logoutBtn: document.getElementById("logoutBtn"),
  logoutModal: document.getElementById("logoutModal"),
  closeLogoutModal: document.getElementById("closeLogoutModal"),
  cancelLogout: document.getElementById("cancelLogout"),
  confirmLogout: document.getElementById("confirmLogout")
};

let organizers = [];
let currentFilter = "awaiting";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      (data && data.message) ||
      (data && data.error) ||
      "Request failed"
    );
  }

  return data;
}

function normalizeUsers(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getStoredVerificationOverrides() {
  try {
    return JSON.parse(localStorage.getItem(VERIFICATION_STATUS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function getVerificationStatus(user) {
  const status = String(user.status || "").toLowerCase();
  const approvalStatus = String(user.approvalStatus || "").toLowerCase();
  const isVerified = Boolean(user.isVerified);

  if (status === "rejected" || approvalStatus === "rejected") {
    return "rejected";
  }

  if (
    status === "approved" ||
    approvalStatus === "approved" ||
    status === "verified" ||
    approvalStatus === "verified" ||
    isVerified
  ) {
    return "approved";
  }

  return "awaiting";
}

function applyStoredVerificationOverrides(list) {
  const overrides = getStoredVerificationOverrides();

  return list.map((org) => {
    const id = String(org._id || org.id || "");
    const override = overrides[id];

    if (!override?.status) {
      return {
        ...org,
        _verificationStatus: getVerificationStatus(org)
      };
    }

    return {
      ...org,
      status: override.status,
      approvalStatus: override.status,
      isVerified: override.status === "approved",
      _verificationStatus: override.status
    };
  });
}

function getLocation(user) {
  if (typeof user.location === "string" && user.location.trim()) {
    return user.location;
  }

  if (user.location && typeof user.location === "object") {
    return (
      user.location.city ||
      user.location.state ||
      user.location.venue ||
      "—"
    );
  }

  return user.city || user.state || "—";
}

function getDisplayName(user) {
  return user.fullName || user.name || user.organizationName || "Unnamed Organizer";
}

function badgeText(status) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Awaiting Verification";
}

function getSortDate(user) {
  return new Date(
    user.createdAt ||
    user.updatedAt ||
    user.dateCreated ||
    0
  ).getTime();
}

function updatePendingCount() {
  const count = organizers.filter(
    (org) => org._verificationStatus === "awaiting"
  ).length;

  els.pendingCount.textContent = count;
}

function renderTable() {
  const query = els.searchInput.value.trim().toLowerCase();

  const filtered = organizers.filter((org) => {
    const matchesFilter =
      currentFilter === "all"
        ? true
        : org._verificationStatus === currentFilter;

    const searchText = `
      ${getDisplayName(org)}
      ${org.email || ""}
      ${getLocation(org)}
      ${org._verificationStatus}
    `.toLowerCase();

    return matchesFilter && searchText.includes(query);
  });

  if (!filtered.length) {
    els.orgTableWrap.style.display = "none";
    els.emptyState.style.display = "block";
    return;
  }

  els.orgTableWrap.style.display = "table";
  els.emptyState.style.display = "none";

  els.orgTable.innerHTML = filtered
    .map((org) => {
      const id = org._id || org.id || "";
      const status = org._verificationStatus;

      return `
        <tr data-status="${status}">
          <td>${getDisplayName(org)}</td>
          <td>${org.email || "—"}</td>
          <td>${getLocation(org)}</td>
          <td>
            <span class="badge ${status}">
              ${badgeText(status)}
            </span>
          </td>
          <td>
            <button class="view" data-id="${id}">View Details</button>
          </td>
        </tr>
      `;
    })
    .join("");

  attachViewDetailsHandlers();
}

function attachViewDetailsHandlers() {
  document.querySelectorAll(".view").forEach((button) => {
    button.addEventListener("click", () => {
      const organizerId = button.dataset.id;
      window.location.href = `verification-details.html?id=${encodeURIComponent(organizerId)}`;
    });
  });
}

async function loadAdminProfile() {
  try {
    let profile;

    try {
      profile = await apiRequest("/users/me");
    } catch {
      profile = await apiRequest("/user/me");
    }

    els.adminName.textContent =
      profile.fullName || profile.name || "Admin";

    if (profile.profileImage) {
      els.adminAvatar.src = profile.profileImage;
    }
  } catch (error) {
    console.error("Failed to load admin profile:", error.message);
  }
}

async function loadVerificationQueue() {
  try {
    let usersPayload;

    try {
      usersPayload = await apiRequest("/user");
    } catch {
      usersPayload = await apiRequest("/users");
    }

    const users = normalizeUsers(usersPayload);

    organizers = users
      .filter((user) => String(user.role || "").toLowerCase() === "organizer");

    organizers = applyStoredVerificationOverrides(organizers)
      .sort((a, b) => getSortDate(b) - getSortDate(a));

    updatePendingCount();
    renderTable();
  } catch (error) {
    console.error("Failed to load verification queue:", error.message);
    els.orgTable.innerHTML = `
      <tr>
        <td colspan="5">Failed to load verification queue.</td>
      </tr>
    `;
  }
}

function bindFilters() {
  els.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      els.filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      renderTable();
    });
  });
}

function openLogoutModal() {
  if (!els.logoutModal) return;
  els.logoutModal.classList.remove("hidden");
}

function closeLogoutModal() {
  if (!els.logoutModal) return;
  els.logoutModal.classList.add("hidden");
  if (els.confirmLogout) {
    els.confirmLogout.disabled = false;
    els.confirmLogout.textContent = "Yes, Log out";
  }
}

async function handleLogout() {
  try {
    if (els.confirmLogout) {
      els.confirmLogout.disabled = true;
      els.confirmLogout.textContent = "Logging out...";
    }

    await apiRequest("/auth/logout", {
      method: "POST"
    });
  } catch (error) {
    console.warn("Logout failed:", error.message);
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../index.html";
  }
}

function bindUI() {
  els.searchInput?.addEventListener("input", renderTable);
  bindFilters();

  els.logoutBtn?.addEventListener("click", openLogoutModal);
  els.closeLogoutModal?.addEventListener("click", closeLogoutModal);
  els.cancelLogout?.addEventListener("click", closeLogoutModal);
  els.confirmLogout?.addEventListener("click", handleLogout);

  els.logoutModal?.addEventListener("click", (event) => {
    if (event.target === els.logoutModal) {
      closeLogoutModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.logoutModal && !els.logoutModal.classList.contains("hidden")) {
      closeLogoutModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindUI();
  await loadAdminProfile();
  await loadVerificationQueue();
});