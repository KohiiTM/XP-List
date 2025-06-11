// Toast icons
const icons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

// Create toast container if it doesn't exist
function getToastContainer() {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

// Create and show a toast notification
export function showToast(message, type = "info", duration = 5000) {
  const container = getToastContainer();

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Create icon
  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.textContent = icons[type] || icons.info;

  // Create message
  const messageElement = document.createElement("span");
  messageElement.className = "toast-message";
  messageElement.textContent = message;

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.className = "toast-close";
  closeButton.textContent = "×";
  closeButton.onclick = () => removeToast(toast);

  // Assemble toast
  toast.appendChild(icon);
  toast.appendChild(messageElement);
  toast.appendChild(closeButton);

  // Add to container
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }

  return toast;
}

// Remove a toast
function removeToast(toast) {
  toast.classList.remove("show");
  setTimeout(() => toast.remove(), 300); // Wait for animation to complete
}

// Convenience methods
export const toast = {
  success: (message, duration) => showToast(message, "success", duration),
  error: (message, duration) => showToast(message, "error", duration),
  info: (message, duration) => showToast(message, "info", duration),
};
