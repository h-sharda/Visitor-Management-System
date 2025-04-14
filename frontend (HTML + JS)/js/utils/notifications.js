export function showNotification(message, type = "success") {
  // Check if notification container exists, if not create it
  let notificationContainer = document.getElementById("notificationContainer");
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notificationContainer";
    notificationContainer.className = "fixed top-4 right-4 z-50";
    document.body.appendChild(notificationContainer);
  }

  // Create notification
  const notification = document.createElement("div");
  notification.className = `mb-4 p-3 rounded shadow-md transition-all duration-300 transform translate-x-full ${
    type === "success"
      ? "bg-green-100 text-green-800 border-l-4 border-green-500"
      : "bg-red-100 text-red-800 border-l-4 border-red-500"
  }`;

  notification.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${
          type === "success"
            ? '<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
            : '<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
        }
      </div>
      <div class="ml-3">
        <p class="text-sm">${message}</p>
      </div>
    </div>
  `;

  // Add to container
  notificationContainer.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.remove("translate-x-full");
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("opacity-0");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
