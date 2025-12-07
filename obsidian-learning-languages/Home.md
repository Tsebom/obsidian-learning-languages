---
banner: "![[home.jpg]]"
banner_y: 0.36667
banner_lock: true
cssclasses:
  - wide-85
---

```dataviewjs
const toast = await app.vault.adapter.read(".obsidian/scripts/toast.js");
const home = await app.vault.adapter.read(".obsidian/scripts/home.js");
const popup = await app.vault.adapter.read(".obsidian/scripts/popup.js");

eval(toast);
eval(home);
eval(popup);

const buttonsContainer = document.createElement("div");
buttonsContainer.className = "buttons-container";

const videoBtn = document.createElement("button");
videoBtn.className = "video-btn btn";
videoBtn.textContent = "Video";

videoBtn.addEventListener("click", async () => {
	const videoTemplatePath = "service/template/video.md"; // шаблон
	const videoTargetFolder = "Videos"; // куда сохранять

	// Читаем буфер обмена
	let clipboardText = await getClipboard();

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
	let safeTitle = videoTitle.replace(/[\\\/:*?"<>|']/g, ""); // убираем запрещённые символы
	if (safeTitle.length > 60) {
		safeTitle = safeTitle.slice(0, 60) + "...";
	}

	createFile(safeTitle, videoTemplatePath, videoTargetFolder, videoUrl);
});

const articlBtn = document.createElement("button");
articlBtn.className = "articl-btn btn";
articlBtn.textContent = "Articl";

articlBtn.addEventListener("click", async () => {
	const articlTemplatePath = "service/template/articl.md"; // шаблон
	const articlTargetFolder = "Articls"; // куда сохранять

	// Читаем буфер обмена
	let clipboardText = await getClipboard();

	// Ищем YouTube-ссылку
	let youtubeRegex = /(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[^&\s]+)/;
	let match = clipboardText.match(youtubeRegex);
	let videoUrl = match ? match[1] : null;

	if (videoUrl) {
		showToast("Please use the video button for Youtube video");
		return;
	}

	// Получаем название статьи
	let articlTitle = await getFirstH1(clipboardText);

	if(!articlTitle) {
		showPopupNewName(articlTemplatePath, articlTargetFolder, clipboardText);
	} else {
		// Ограничиваем длину названия
		let safeTitle = articlTitle.replace(/[\\\/:*?"<>|']/g, ""); // убираем запрещённые символы
		if (safeTitle.length > 60) {
			safeTitle = safeTitle.slice(0, 60) + "...";
		}

		createFile(safeTitle, articlTemplatePath, articlTargetFolder, clipboardText);
	}
});

const wordBtn = document.createElement("button");
wordBtn.className = "word-btn btn";
wordBtn.textContent = "Word";

wordBtn.addEventListener("click", async () => {
	const wordTemplatePath = "service/template/word.md"
	const wordTargetFolder = "Words";

	showPopupNewName(wordTemplatePath, wordTargetFolder);
});

const buttonSetting = document.createElement("button");
buttonSetting.className = "setting-btn btn";
buttonSetting.textContent = "⚙️";

buttonSetting.onclick = () => app.workspace.openLinkText("service/settings", "/", false);

buttonsContainer.appendChild(videoBtn);
buttonsContainer.appendChild(articlBtn);
buttonsContainer.appendChild(wordBtn);
buttonsContainer.appendChild(buttonSetting);

dv.container.appendChild(buttonsContainer);

```