import { renderAuthUI } from "./components/AuthUI.js";
import { renderEntryForm } from "./components/EntryForm.js";
import { renderEntryTable } from "./components/EntryTable.js";
import { renderImageViewer } from "./components/ImageViewer.js";
import { checkAuthState } from "./utils/auth.js";
import { hasPermission } from "./utils/permissions.js";
import { currentUser, setCurrentUser } from "./utils/state.js";

// Initialize application
document.addEventListener("DOMContentLoaded", async function () {
  // Set up modals and components that don't depend on auth state
  renderImageViewer();

  // Check authentication
  await initializeApp();

  // Add event listener for sign in button
  document.getElementById("goToSignIn").addEventListener("click", () => {
    window.location.href = "/signin";
  });
});

async function initializeApp() {
  try {
    // Check authentication state
    const authResult = await checkAuthState();
    setCurrentUser(authResult.user);
    console.log(currentUser);

    // Render authentication UI
    renderAuthUI(authResult.authenticated, currentUser);

    if (authResult.authenticated) {
      // User is authenticated, show main content and hide auth required message
      document.getElementById("authRequiredMessage").classList.add("hidden");
      document.getElementById("mainContent").classList.remove("hidden");

      // Render components based on permissions
      await loadComponentsByPermission();
    } else {
      // User is not authenticated, show auth required message and hide main content
      document.getElementById("authRequiredMessage").classList.remove("hidden");
      document.getElementById("mainContent").classList.add("hidden");
    }
  } catch (error) {
    console.error("Error initializing app:", error);
    // Handle initialization error, show auth required message
    document.getElementById("authRequiredMessage").classList.remove("hidden");
    document.getElementById("mainContent").classList.add("hidden");
  }
}

async function loadComponentsByPermission() {
  // Always render the entry table for all authenticated users
  await renderEntryTable();

  // Render entry form for OPERATOR and ADMIN
  if (hasPermission(currentUser, ["OPERATOR", "ADMIN"])) {
    renderEntryForm();
  }
}
