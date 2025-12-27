// Читает буфер обмена
window.getClipboard = async function() {
	let clipboardText = "";
	try {
		clipboardText = await navigator.clipboard.readText();
		
	} catch (e) {
		showToast("Can not read your clipboard");
	}
	return clipboardText;
}

// Возвращает дату в формате day.month.year-hour-minutes-seconds
window.getFormattedDate = function() {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}.${month}.${year}-${hours}-${minutes}-${seconds}`;
}

// Функция для случайного перемешивания массива
// array: array - перемешиваемый массив
window.shuffleArray = function(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Получает заголовок h1 с веб-страницы
// url: string - url веб-страницы
window.getFirstH1 = async function (url) {
  try {
    // Используем встроенный requestUrl — работает в Obsidian БЕЗ CORS!
    const response = await requestUrl(url);
    if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

    const text = response.text;
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const h1 = doc.querySelector("h1");

    return h1 ? h1.textContent.trim() : false;
  } catch (e) {
    console.warn("Ошибка загрузки:", url, e);
    return false;
  }
}

// Создает файл на основе шаблона
window.createFile = async function(
	title, // Название файла
	templatePath, // Путь к шаблону файла
	targetFolder, // Целевая папка	
	url = "" // Ссылка на изучаемый ресурс (опционально)
) {
	const dataTemplatePath = "service/template/data.md"; // шаблон
	const dataFolder = "service/data"; // данные
	const quizTemplatePath = "service/template/quiz.md"; // шаблон
	const quizFolder = "service/quiz"; // quiz note
	const date = getFormattedDate();

	//Формируем имя файла
	let baseName = `${title}`;
	let fileName = `${baseName}.md`;
	let targetPath = `${targetFolder}/${fileName}`;

	// Проверяем существование файла
	if (app.vault.getAbstractFileByPath(targetPath)) {
		showToast(`The file "${targetPath}" is existed.`);
		return;
	}

	// Загружаем шаблон
	const templateFile = app.vault.getAbstractFileByPath(templatePath);
	if (!templateFile) {
		showToast("The template is not found: " + templatePath);
		return;
	}

	// Получаем содержимое шаблона
	let templateContent = await app.vault.read(templateFile);

	// Формируем имя файла для данных
	const dataBaseName = `data-${date}.md`;
	const dataTargetPath = `${dataFolder}/${dataBaseName}`;

	// Загружаем шаблон для данными
	const dataTemplateFile = app.vault.getAbstractFileByPath(dataTemplatePath);
	if (!dataTemplateFile) {
		showToast("The data template is not found: " + dataTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для данных
	let dataTemplateContent = await app.vault.read(dataTemplateFile);

	// Формируем имя файла для викторины
	const quizBaseName = `quiz-${date}.md`;
	const quizTargetPath = `${quizFolder}/${quizBaseName}`;

	// Загружаем шаблон для вмкторины
	const quizTemplateFile = app.vault.getAbstractFileByPath(quizTemplatePath);
	if (!quizTemplateFile) {
		showToast("The quiz template is not found: " + quizTemplatePath);
		return;
	}

	// Получаем содержимое шаблона для викторины
	let quizTemplateContent = await app.vault.read(quizTemplateFile);

	// Подставляем переменные в файл quiz
	let quizNoteContent = quizTemplateContent
	.replace(/{{dataFile}}/g, dataTargetPath)
	.replace(/{{contentType}}/g, targetFolder)
	.replace(/{{title}}/g, title);

	// Подставляем переменные в основной файл
	let noteContent;
	if (url) {
		noteContent = templateContent
		.replace(/{{title}}/g, title)
		.replace(/{{dataFile}}/g, dataBaseName)
		.replace(/{{quizFile}}/g, quizBaseName)
		.replace(/{{url}}/g, url);
	} else {
		noteContent = templateContent
		.replace(/{{title}}/g, title)
		.replace(/{{dataFile}}/g, dataBaseName)
		.replace(/{{quizFile}}/g, quizBaseName)
	}

	// Создаём файл для video
	await app.vault.create(targetPath, noteContent);
	// Создаём файл для данных
	await app.vault.create(dataTargetPath, dataTemplateContent);
	// Создаём файл для quiz
	await app.vault.create(quizTargetPath, quizNoteContent);

	let newFile = app.vault.getAbstractFileByPath(targetPath);
	app.workspace.getLeaf(true).openFile(newFile);
}

// Создает файл книги на основе шаблона
window.createBookFile = async function(
	title, // Название файла
	templatePath, // Путь к шаблону файла
	targetFolder, // Целевая папка	
	description = "" // Описание книги
) {
	//Формируем имя файла
	let baseName = `${title}`;
	let fileName = `${baseName}.md`;
	let targetPath = `${targetFolder}/${fileName}`;

	// Проверяем существование файла
	if (app.vault.getAbstractFileByPath(targetPath)) {
		showToast(`The file "${targetPath}" is existed.`);
		return;
	}

	// Загружаем шаблон
	const templateFile = app.vault.getAbstractFileByPath(templatePath);
	if (!templateFile) {
		showToast("The template is not found: " + templatePath);
		return;
	}

	// Получаем содержимое шаблона
	let templateContent = await app.vault.read(templateFile);

	// Подставляем переменные в основной файл
	let noteContent = templateContent
		.replace(/{{title}}/g, title)
		.replace(/{{description}}/g, description);

	// Создаём файл для 
	await app.vault.createFolder(`Books/BooksData/${title}`);
	await app.vault.create(targetPath, noteContent);

	let newFile = app.vault.getAbstractFileByPath(targetPath);
	app.workspace.getLeaf(true).openFile(newFile);
}

