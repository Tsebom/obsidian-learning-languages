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

eval(toast);
eval(home);

const dataTemplatePath = "service/template/data.md"; // шаблон
const dataFolder = "service/data"; // данные
const quizTemplatePath = "service/template/quiz.md"; // шаблон
const quizFolder = "service/quiz"; // quiz note

const buttonsContainer = document.createElement("div");
buttonsContainer.className = "buttons-container";

const videoBtn = document.createElement("button");
videoBtn.className = "video-btn btn";
videoBtn.textContent = "Video";

videoBtn.addEventListener("click", async () => {
	const videoTemplatePath = "service/template/video.md"; // шаблон
	const videoTargetFolder = "Videos"; // куда сохранять
	const date = getFormattedDate();

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
	let safeTitle = videoTitle.replace(/[\\\/:*?"<>|']/g, "");
	//let safeTitle = videoTitle.replace(/[\\\/:*?"<>|]/g, ""); // убираем запрещённые символы
	if (safeTitle.length > 60) {
		safeTitle = safeTitle.slice(0, 60) + "...";
	}

	//Формируем имя файла
	let baseName = `${safeTitle}`;
	let fileName = `${baseName}.md`;
	let videoTargetPath = `${videoTargetFolder}/${fileName}`;

	// Проверяем существование файла
	if (app.vault.getAbstractFileByPath(videoTargetPath)) {
		showToast(`The file ${videoTargetPath} is existed.`);
		return;
	}

	// Загружаем шаблон video
	const videoTemplateFile = app.vault.getAbstractFileByPath(videoTemplatePath);
	if (!videoTemplateFile) {
		showToast("The video template is not found: " + videoTemplatePath);
		return;
	}

	// Получаем содержимое шаблона
	let videoTemplateContent = await app.vault.read(videoTemplateFile);

	// Формируем имя файла для данных
	const videoDataBaseName = `data-${date}.md`;
	const videoDataTargetPath = `${dataFolder}/${videoDataBaseName}`;

	// Загружаем шаблон для данными
	const dataTemplateFile = app.vault.getAbstractFileByPath(dataTemplatePath);
	if (!dataTemplateFile) {
		showToast("The data template is not found: " + dataTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для данных
	let dataTemplateContent = await app.vault.read(dataTemplateFile);

	// Формируем имя файла для викторины
	const videoQuizBaseName = `quiz-${date}.md`;
	const videoQuizTargetPath = `${quizFolder}/${videoQuizBaseName}`;

	// Загружаем шаблон для вмкторины
	const quizTemplateFile = app.vault.getAbstractFileByPath(quizTemplatePath);
	if (!quizTemplateFile) {
		showToast("The quiz template is not found: " + quizTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для викторины
	let quizTemplateContent = await app.vault.read(quizTemplateFile);

	let quizNoteContent = quizTemplateContent
	.replace(/{{dataFile}}/g, videoDataTargetPath)
	.replace(/{{contentType}}/g, videoTargetFolder)
	.replace(/{{title}}/g, safeTitle);

	// Подставляем переменные
  let videoNoteContent = videoTemplateContent
	.replace(/{{title}}/g, safeTitle)
	.replace(/{{dataFile}}/g, videoDataBaseName)
	.replace(/{{quizFile}}/g, videoQuizBaseName)
	.replace(/{{videoUrl}}/g, videoUrl);

	// Создаём файл для video
	await app.vault.create(videoTargetPath, videoNoteContent);
	// Создаём файл для данных
	await app.vault.create(videoDataTargetPath, dataTemplateContent);
	// Создаём файл для quiz
	await app.vault.create(videoQuizTargetPath, quizNoteContent);

	let newFile = app.vault.getAbstractFileByPath(videoTargetPath);
	app.workspace.getLeaf(true).openFile(newFile);
});

const articlBtn = document.createElement("button");
articlBtn.className = "articl-btn btn";
articlBtn.textContent = "Articl";

articlBtn.addEventListener("click", async () => {
	const articlTemplatePath = "service/template/articl.md"; // шаблон
	const articlTargetFolder = "Articls"; // куда сохранять
	const date = getFormattedDate();

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

	if(!articlTitle) return

	// Ограничиваем длину названия
	let safeTitle = articlTitle.replace(/[\\\/:*?"<>|']/g, ""); // убираем запрещённые символы
	if (safeTitle.length > 60) {
		safeTitle = safeTitle.slice(0, 60) + "...";
	}

	//Формируем имя файла
	let baseName = `${safeTitle}`;
	let fileName = `${baseName}.md`;
	let articlTargetPath = `${articlTargetFolder}/${fileName}`;

	// Проверяем существование файла
	if (app.vault.getAbstractFileByPath(articlTargetPath)) {
		showToast(`The file ${articlTargetPath} is existed.`);
		return;
	}

	// Загружаем шаблон articl
	const articlTemplateFile = app.vault.getAbstractFileByPath(articlTemplatePath);
	if (!articlTemplateFile) {
		showToast("The articl template is not found: " + articlTemplatePath);
		return;
	}

	// Получаем содержимое шаблона
	let articlTemplateContent = await app.vault.read(articlTemplateFile);

	// Формируем имя файла для данных
	const articlDataBaseName = `data-${date}.md`;
	const articlDataTargetPath = `${dataFolder}/${articlDataBaseName}`;

	// Загружаем шаблон для данными
	const dataTemplateFile = app.vault.getAbstractFileByPath(dataTemplatePath);
	if (!dataTemplateFile) {
		showToast("The data template is not found: " + dataTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для данных
	let dataTemplateContent = await app.vault.read(dataTemplateFile);

	// Формируем имя файла для викторины
	const articlQuizBaseName = `quiz-${date}.md`;
	const articlQuizTargetPath = `${quizFolder}/${articlQuizBaseName}`;

	// Загружаем шаблон для викторины
	const quizTemplateFile = app.vault.getAbstractFileByPath(quizTemplatePath);
	if (!quizTemplateFile) {
		showToast("The quiz template is not found: " + quizTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для викторины
	let quizTemplateContent = await app.vault.read(quizTemplateFile);

	let quizNoteContent = quizTemplateContent
	.replace(/{{dataFile}}/g, articlDataTargetPath)
	.replace(/{{contentType}}/g, articlTargetFolder)
	.replace(/{{title}}/g, safeTitle);

	// Подставляем переменные
  let articlNoteContent = articlTemplateContent
	.replace(/{{title}}/g, safeTitle)
	.replace(/{{dataFile}}/g, articlDataBaseName)
	.replace(/{{quizFile}}/g, articlQuizBaseName)
	.replace(/{{articlUrl}}/g, clipboardText);

	// Создаём файл для articl
	await app.vault.create(articlTargetPath, articlNoteContent);
	// Создаём файл для данных
	await app.vault.create(articlDataTargetPath, dataTemplateContent);
	// Создаём файл для quiz
	await app.vault.create(articlQuizTargetPath, quizNoteContent);

	let newFile = app.vault.getAbstractFileByPath(articlTargetPath);
	app.workspace.getLeaf(true).openFile(newFile);
});

const buttonSetting = document.createElement("button");
buttonSetting.className = "setting-btn btn";
buttonSetting.textContent = "⚙️";

buttonSetting.onclick = () => app.workspace.openLinkText("service/settings", "/", false);

buttonsContainer.appendChild(videoBtn);
buttonsContainer.appendChild(articlBtn);
buttonsContainer.appendChild(buttonSetting);

dv.container.appendChild(buttonsContainer);

```


//////////////////////////////////////////

```dataviewjs
const toast = await app.vault.adapter.read(".obsidian/scripts/toast.js");
const home = await app.vault.adapter.read(".obsidian/scripts/home.js");

eval(toast);
eval(home);

const buttonsContainer = document.createElement("div");
buttonsContainer.className = "buttons-container";

const wordBtn = document.createElement("button");
wordBtn.className = "word-btn btn";
wordBtn.textContent = "Word";

wordBtn.addEventListener("click", async () => {
	const videoTemplatePath = "service/template/video.md"; // шаблон
	const videoTargetFolder = "Videos"; // куда сохранять
	const dataTemplatePath = "service/template/data.md"; // шаблон
	const dataFolder = "service/data/video"; // данные
	const quizTemplatePath = "service/template/quiz.md"; // шаблон
	const quizFolder = "service/quiz"; // quiz note
	const date = getFormattedDate();

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
	let safeTitle = videoTitle.replace(/[\\\/:*?"<>|']/g, "");
	//let safeTitle = videoTitle.replace(/[\\\/:*?"<>|]/g, ""); // убираем запрещённые символы
	if (safeTitle.length > 60) {
		safeTitle = safeTitle.slice(0, 60) + "...";
	}

	//Формируем имя файла
	let baseName = `${safeTitle}`;
	let fileName = `${baseName}.md`;
	let videoTargetPath = `${videoTargetFolder}/${fileName}`;

	// Проверяем существование файла
	if (app.vault.getAbstractFileByPath(videoTargetPath)) {
		showToast(`The file ${videoTargetPath} is existed.`);
		return;
	}

	// Загружаем шаблон video
	const videoTemplateFile = app.vault.getAbstractFileByPath(videoTemplatePath);
	if (!videoTemplateFile) {
		showToast("The video template is not found: " + videoTemplatePath);
		return;
	}

	// Получаем содержимое шаблона
	let videoTemplateContent = await app.vault.read(videoTemplateFile);

	// Формируем имя файла для данных
	const videoDataBaseName = `data-${date}.md`;
	const videoDataTargetPath = `${dataFolder}/${videoDataBaseName}`;

	// Загружаем шаблон для данными
	const dataTemplateFile = app.vault.getAbstractFileByPath(dataTemplatePath);
	if (!dataTemplateFile) {
		showToast("The data template is not found: " + dataTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для данных
	let dataTemplateContent = await app.vault.read(dataTemplateFile);

	// Формируем имя файла для викторины
	const videoQuizBaseName = `quiz-${date}.md`;
	const videoQuizTargetPath = `${quizFolder}/${videoQuizBaseName}`;

	// Загружаем шаблон для вмкторины
	const quizTemplateFile = app.vault.getAbstractFileByPath(quizTemplatePath);
	if (!quizTemplateFile) {
		showToast("The quiz template is not found: " + quizTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для викторины
	let quizTemplateContent = await app.vault.read(quizTemplateFile);

	let quizNoteContent = quizTemplateContent
	.replace(/{{dataFile}}/g, videoDataTargetPath)
	.replace(/{{title}}/g, safeTitle);

	// Подставляем переменные
  let videoNoteContent = videoTemplateContent
	.replace(/{{title}}/g, safeTitle)
	.replace(/{{dataFile}}/g, videoDataBaseName)
	.replace(/{{quizFile}}/g, videoQuizBaseName)
	.replace(/{{videoUrl}}/g, videoUrl);

	// Создаём файл для video
	await app.vault.create(videoTargetPath, videoNoteContent);
	// Создаём файл для данных
	await app.vault.create(videoDataTargetPath, dataTemplateContent);
	// Создаём файл для quiz
	await app.vault.create(videoQuizTargetPath, quizNoteContent);

	let newFile = app.vault.getAbstractFileByPath(videoTargetPath);
	app.workspace.getLeaf(true).openFile(newFile);
});



buttonsContainer.appendChild(wordBtn);

dv.container.appendChild(buttonsContainer);

```