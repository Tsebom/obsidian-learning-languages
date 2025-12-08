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

```dataviewjs
// Берем все записи
let allPages = dv.pages();

const container = document.createElement('div');
container.className = "container";

// Блок video
let videos = allPages.where(p => p.file.name !== "video" &&  p.file.tags.includes("#video") && p.completed === false); // Отбираем video (completed false)
let shuffleVideos = shuffleArray(videos).slice(0, 10); // Рандомизируем и ограничиваем до 10

const video = document.createElement('div');
video.className = "video-box container-item";

const videoTitle = document.createElement('h2');
videoTitle.className = "video-title";
videoTitle.innerText = `Video ( ${videos.length} )`;

video.appendChild(videoTitle);

let videoList = document.createElement("ol");
videoList.className = "video-list";

shuffleVideos.forEach(p => {
  let li = document.createElement("li");
  let a = document.createElement("a");
  a.href = "obsidian://open?vault=" + app.vault.getName() + "&file=" + p.file.path;
  a.innerText = p.file.name;
  li.appendChild(a);
  videoList.appendChild(li);
});

video.appendChild(videoList);

// Блок articl
let articls = allPages.where(p => p.file.name !== "articl" &&  p.file.tags.includes("#articl") && p.completed === false); // Отбираем articl (completed false)
let shuffleArticl = shuffleArray(articls).slice(0, 10); // Рандомизируем и ограничиваем до 10

const articl = document.createElement('div');
articl.className = "articl-box container-item";

const articlTitle = document.createElement('h2');
articlTitle.className = "articl-title";
articlTitle.innerText = `Articl ( ${articls.length} )`;

articl.appendChild(articlTitle);

let articlList = document.createElement("ol");
articlList.className = "video-list";

shuffleArticl.forEach(p => {
  let li = document.createElement("li");
  let a = document.createElement("a");
  a.href = "obsidian://open?vault=" + app.vault.getName() + "&file=" + p.file.path;
  a.innerText = p.file.name;
  li.appendChild(a);
  articlList.appendChild(li);
});

articl.appendChild(articlList);

// Блок word
let words = allPages.where(p => p.file.name !== "word" &&  p.file.tags.includes("#word") && p.completed === false); // Отбираем word (completed false)
let shuffleWord = shuffleArray(words).slice(0, 10); // Рандомизируем и ограничиваем до 10

const word = document.createElement('div');
word.className = "word-box container-item";

const wordTitle = document.createElement('h2');
wordTitle.className = "word-title";
wordTitle.innerText = `Word ( ${words.length} )`;

word.appendChild(wordTitle);

let wordList = document.createElement("ol");
wordList.className = "word-list";

shuffleWord.forEach(p => {
  let li = document.createElement("li");
  let a = document.createElement("a");
  a.href = "obsidian://open?vault=" + app.vault.getName() + "&file=" + p.file.path;
  a.innerText = p.file.name;
  li.appendChild(a);
  wordList.appendChild(li);
});

word.appendChild(wordList);

// Добавляем блоки в контейнер
container.appendChild(video);
container.appendChild(articl);
container.appendChild(word);

dv.container.appendChild(container);

```