const toastContainer = document.createElement("div");
toastContainer.style.position = "fixed";
toastContainer.style.top = "50%";
toastContainer.style.left = "50%";
toastContainer.style.transform = "translate(-50%, -50%)";
toastContainer.style.display = "flex";
toastContainer.style.flexDirection = "column";
toastContainer.style.gap = "10px";
toastContainer.style.zIndex = "9999";
document.body.appendChild(toastContainer);

window.showToast = function(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.textContent = message;

  // Стили для тоста
  toast.style.background = "#333";
	toast.style.fontSize= "30px";
  toast.style.color = "#ff0000";
  toast.style.padding = "20px 25px";
  toast.style.borderRadius = "10px";
  toast.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
  toast.style.fontFamily = "sans-serif";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-20px)";
  toast.style.transition = "opacity 0.3s, transform 0.3s";

  toastContainer.appendChild(toast);

  // плавное появление
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // скрытие через duration
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}