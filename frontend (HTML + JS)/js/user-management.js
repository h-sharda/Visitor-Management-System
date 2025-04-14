import { renderAuthUI } from "./components/AuthUI.js";
import { renderUserForm } from "./components/UserForm.js";
import { renderUsersTable } from "./components/UserTable.js";
import { checkAuthState } from "./utils/auth.js";
import { hasPermission } from "./utils/permissions.js";
import { currentUser, setCurrentUser } from "./utils/state.js";

// Initialize application
document.addEventListener("DOMContentLoaded", async function () {
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
      // Check if user has admin permission
      if (hasPermission(currentUser, ["ADMIN"])) {
        // User is authenticated and has admin rights, show main content
        document.getElementById("authRequiredMessage").classList.add("hidden");
        document.getElementById("mainContent").classList.remove("hidden");

        // Render components
        renderUserForm();
        renderUsersTable();
      } else {
        // User is authenticated but doesn't have admin rights
        document
          .getElementById("authRequiredMessage")
          .classList.remove("hidden");
        document
          .getElementById("authRequiredMessage")
          .querySelector(".bg-yellow-100").innerHTML = `
                    <p class="font-bold">Access Denied</p>
                    <p>You do not have permission to access this page.</p>
                    <button id="goToHome" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn-press-effect">
                        Go to Home
                    </button>
                `;
        document.getElementById("goToHome").addEventListener("click", () => {
          window.location.href = "/";
        });
        document.getElementById("mainContent").classList.add("hidden");
      }
    } else {
      // User is not authenticated, show auth required message
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
