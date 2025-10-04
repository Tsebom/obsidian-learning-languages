---
banner: "![[home.jpg]]"
banner_y: 0.35334
banner_lock: true
cssclasses:
  - wide-85
---

```dataviewjs
const buttonsContainer = document.createElement("div");
buttonsContainer.className = "buttons-container";

const videoBtn = document.createElement("button");
videoBtn.className = "video-btn";
videoBtn.textContent = "Video";

videoBtn.addEventListener("click", async () => {
	const templatePath = "Services/Template/EVS.md"; // шаблон
	const targetFolder = "English/Ьн Videos"; // куда сохранять
	const dataFolder = "Services/Data/Video"; // данные

	// Читаем буфер обмена
	let clipboardText = "";
	try {
		clipboardText = await navigator.clipboard.readText();
	} catch (e) {
		showToast("Can not read your clipboard");
	}

	// Ищем YouTube-ссылку
	let youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[^&\s]+|youtu\.be\/[^\s]+))/;
	let match = clipboardText.match(youtubeRegex);
	let videoUrl = match ? match[1] : null;

	if (!videoUrl) {
		showToast("Please add the Youtube video link to your clipboard");
		return;
	}

	// Получаем videoId
	let videoId = videoUrl.includes("v=")
		? videoUrl.split("v=")[1].split("&")[0]
		: videoUrl.split("/").pop();

	// Получаем название видео через oEmbed
	let videoTitle = videoId;
	try {
		let response = await requestUrl({
			url: `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
			});
		videoTitle = response.json.title;
	} catch (e) {
		showToast(`Unable to get video title: ${e}`);
	}

	// Ограничиваем длину названия
	let safeTitle = videoTitle.replace(/[\\\/:*?"<>|]/g, ""); // убираем запрещённые символы
	if (safeTitle.length > 60) {
		safeTitle = safeTitle.slice(0, 60) + "...";
	}

	// Загружаем шаблон
	const templateFile = app.vault.getAbstractFileByPath(templatePath);
	if (!templateFile) {
		showToast("The template is not found: " + templatePath);
		return;
	}

	// Получаем содержимое шаблона
	let templateContent = await app.vault.read(templateFile);

	
});

buttonsContainer.appendChild(videoBtn);
dv.container.appendChild(buttonsContainer);

//------------------CUSTOM ALERT-------------------------------

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

function showToast(message, duration = 3000) {
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
```