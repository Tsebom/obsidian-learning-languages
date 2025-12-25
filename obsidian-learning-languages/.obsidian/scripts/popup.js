const popupContainer = document.createElement("div");
popupContainer.style.position = "fixed";
popupContainer.style.top = "50%";
popupContainer.style.left = "50%";
popupContainer.style.transform = "translate(-50%, -50%)";
popupContainer.style.display = "flex";
popupContainer.style.flexDirection = "column";
popupContainer.style.gap = "10px";
popupContainer.style.zIndex = "9999";
document.body.appendChild(popupContainer);

window.showForm = function(form) {
	form.style.opacity = "1";
  form.style.transform = "translateY(0)";
}

window.hideForm = function() {
	popupContainer.innerHTML = "";
}

// Форма для нового файла
window.showPopupNewName = function(
	templatePath, // Путь к шаблону файла
	targetFolder, // Целевая папка	
	url = "" // Ссылка на изучаемый ресурс (опционально)
) {

	const form = document.createElement("div");
	form.style.background = "#333";
	form.style.fontSize= "30px";
	form.style.padding = "20px 25px";
	form.style.borderRadius = "10px";
	form.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
	form.style.fontFamily = "sans-serif";
	form.style.opacity = "0";
	form.style.transform = "translateY(-20px)";
	form.style.transition = "opacity 0.3s, transform 0.3s";
	form.style.minWidth = "700px";

	const inputName = document.createElement("input");
	inputName.style.width = "100%";
	inputName.style.height = "40px";
	inputName.style.marginBottom = "10px";
	inputName.style.fontSize = "18px";

	const buttonContainer = document.createElement("div");
	buttonContainer.style.display = "flex";
	buttonContainer.style.justifyContent = "flex-end";
	buttonContainer.style.gap = "10px";

	const buttonSave = document.createElement("button");
	buttonSave.innerText = "Save";
	buttonSave.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonSave.style.background = "var(--interactive-accent)";
	buttonSave.style.fontWeight = "bold";

	const buttonCansel = document.createElement("button");
	buttonCansel.innerText = "Cansel";
	buttonCansel.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonCansel.style.background = "var(--background-modifier-error)";
	buttonCansel.style.fontWeight = "bold";

	buttonContainer.appendChild(buttonSave);
	buttonContainer.appendChild(buttonCansel);

	form.appendChild(inputName);
	form.appendChild(buttonContainer);

	buttonSave.addEventListener("click", async () => {
		const noteTitle = inputName.value.trim().trim();

		// Ограничиваем длину названия
		let safeTitle = noteTitle.replace(/[\\\/:*?"<>|']/g, "");
		if (safeTitle.length > 60) {
			safeTitle = safeTitle.slice(0, 60) + "...";
		}

		if(safeTitle === "") {
			showToast("Please, type the file name or click on cansel button.");
			return
		}

		hideForm();

		createFile(safeTitle, templatePath, targetFolder, url);
	});

	buttonCansel.addEventListener("click", () => {
		hideForm();
	});

	popupContainer.appendChild(form);

	showForm(form);
}

window.showPopupDeleteFile = function(message, quizFile, dataFile, thisFile) {

	const form = document.createElement("div");
	form.style.background = "#333";
	form.style.fontSize= "30px";
	form.style.padding = "20px 25px";
	form.style.borderRadius = "10px";
	form.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
	form.style.fontFamily = "sans-serif";
	form.style.opacity = "0";
	form.style.transform = "translateY(-20px)";
	form.style.transition = "opacity 0.3s, transform 0.3s";
	form.style.minWidth = "700px";

	const title = document.createElement("h1");
	title.innerText = message;
	title.style.marginBottom = "10px";
	title.style.fontSize = "18px";
	title.style.fontWeight = "bold";

	const buttonContainer = document.createElement("div");
	buttonContainer.style.display = "flex";
	buttonContainer.style.justifyContent = "flex-end";
	buttonContainer.style.gap = "10px";

	const buttonOk = document.createElement("button");
	buttonOk.innerText = "Ok";
	buttonOk.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonOk.style.background = "var(--interactive-accent)";
	buttonOk.style.fontWeight = "bold";

	const buttonCansel = document.createElement("button");
	buttonCansel.innerText = "Cansel";
	buttonCansel.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonCansel.style.background = "var(--background-modifier-error)";
	buttonCansel.style.fontWeight = "bold";

	buttonContainer.appendChild(buttonOk);
	buttonContainer.appendChild(buttonCansel);

	form.appendChild(title);
	form.appendChild(buttonContainer);

	buttonOk.addEventListener("click", async () => {
		await app.vault.adapter.remove(quizFile);
		await app.vault.adapter.remove(dataFile);
		await app.vault.adapter.remove(thisFile);
		hideForm();
	});

	buttonCansel.addEventListener("click", () => {
		hideForm();
	});

	popupContainer.appendChild(form);

	showForm(form);
}

window.showPopupEditTranslate = function(message, word, dataFile) {

	const form = document.createElement("div");
	form.style.background = "#333";
	form.style.fontSize= "30px";
	form.style.padding = "20px 25px";
	form.style.borderRadius = "10px";
	form.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
	form.style.fontFamily = "sans-serif";
	form.style.opacity = "0";
	form.style.transform = "translateY(-20px)";
	form.style.transition = "opacity 0.3s, transform 0.3s";
	form.style.minWidth = "700px";

	const title = document.createElement("h1");
	title.innerText = message;
	title.style.marginBottom = "10px";
	title.style.fontSize = "18px";
	title.style.fontWeight = "bold";

	const inputName = document.createElement("input");
	inputName.value = word.translate;
	inputName.style.width = "100%";
	inputName.style.height = "40px";
	inputName.style.marginBottom = "10px";
	inputName.style.fontSize = "18px";
	inputName.style.paddingLeft = "18px";

	const buttonContainer = document.createElement("div");
	buttonContainer.style.display = "flex";
	buttonContainer.style.justifyContent = "flex-end";
	buttonContainer.style.gap = "10px";

	const buttonEdit = document.createElement("button");
	buttonEdit.innerText = "Edit";
	buttonEdit.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonEdit.style.background = "var(--interactive-accent)";
	buttonEdit.style.fontWeight = "bold";

	const buttonCansel = document.createElement("button");
	buttonCansel.innerText = "Cansel";
	buttonCansel.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonCansel.style.background = "var(--background-modifier-error)";
	buttonCansel.style.fontWeight = "bold";

	buttonContainer.appendChild(buttonEdit);
	buttonContainer.appendChild(buttonCansel);

	form.appendChild(title);
	form.appendChild(inputName);
	form.appendChild(buttonContainer);

	buttonEdit.addEventListener("click", async () => {
		const translate = inputName.value.trim().trim();
		word.translate = translate;
		await writeData(dataFile, `word-${word.word}`, JSON.stringify(word))
		hideForm();
	});

	buttonCansel.addEventListener("click", () => {
		hideForm();
	});

	popupContainer.appendChild(form);

	showForm(form);
}

window.showPopupNewBook = function(
	templatePath, // Путь к шаблону файла
	targetFolder, // Целевая папка
) {

	const form = document.createElement("div");
	form.style.background = "#333";
	form.style.fontSize= "30px";
	form.style.padding = "20px 25px";
	form.style.borderRadius = "10px";
	form.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
	form.style.fontFamily = "sans-serif";
	form.style.opacity = "0";
	form.style.transform = "translateY(-20px)";
	form.style.transition = "opacity 0.3s, transform 0.3s";
	form.style.minWidth = "700px";

	const title = document.createElement("h1");
	title.innerText = "Book name:";
	title.style.marginBottom = "10px";
	title.style.fontSize = "18px";
	title.style.fontWeight = "bold";

	const inputName = document.createElement("input");
	inputName.style.width = "100%";
	inputName.style.height = "40px";
	inputName.style.marginBottom = "10px";
	inputName.style.fontSize = "18px";
	inputName.style.paddingLeft = "18px";

	const titleCover = document.createElement("h1");
	titleCover.innerText = "Book cover:";
	titleCover.style.marginBottom = "10px";
	titleCover.style.fontSize = "18px";
	titleCover.style.fontWeight = "bold";

	const inputCover = document.createElement("input");
	inputCover.type = "file";
	inputCover.style.width = "100%";
	inputCover.style.height = "40px";
	inputCover.style.marginBottom = "10px";
	inputCover.style.fontSize = "18px";
	inputCover.style.paddingLeft = "18px";

	const titleFile = document.createElement("h1");
	titleFile.innerText = "Book file:";
	titleFile.style.marginBottom = "10px";
	titleFile.style.fontSize = "18px";
	titleFile.style.fontWeight = "bold";

	const inputFile = document.createElement("input");
	inputFile.type = "file";
	inputFile.style.width = "100%";
	inputFile.style.height = "40px";
	inputFile.style.marginBottom = "10px";
	inputFile.style.fontSize = "18px";
	inputFile.style.paddingLeft = "18px";

	const titleDescription = document.createElement("h1");
	titleDescription.innerText = "Description:";
	titleDescription.style.marginBottom = "10px";
	titleDescription.style.fontSize = "18px";
	titleDescription.style.fontWeight = "bold";

	const description = document.createElement("textarea");
	description.style.width = "100%";
	description.style.marginBottom = "10px";
	description.style.fontSize = "18px";
	description.style.paddingLeft = "18px";

	const buttonContainer = document.createElement("div");
	buttonContainer.style.display = "flex";
	buttonContainer.style.justifyContent = "flex-end";
	buttonContainer.style.gap = "10px";

	const buttonSave = document.createElement("button");
	buttonSave.innerText = "Save";
	buttonSave.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonSave.style.background = "var(--interactive-accent)";
	buttonSave.style.fontWeight = "bold";

	const buttonCansel = document.createElement("button");
	buttonCansel.innerText = "Cansel";
	buttonCansel.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonCansel.style.background = "var(--background-modifier-error)";
	buttonCansel.style.fontWeight = "bold";

	buttonContainer.appendChild(buttonSave);
	buttonContainer.appendChild(buttonCansel);

	form.appendChild(title);
	form.appendChild(inputName);
	form.appendChild(titleCover);
	form.appendChild(inputCover);
	form.appendChild(titleFile);
	form.appendChild(inputFile);
	form.appendChild(titleDescription);
	form.appendChild(description);
	form.appendChild(buttonContainer);

	buttonSave.addEventListener("click", async () => {
		const name = inputName.value.trim().trim();
		const descript = description.value.trim().trim();
		const cover = inputCover.files[0];
		const file = inputFile.files[0];

		let extentionFile = file.name.split(".")[1];
		
		if(app.vault.getAbstractFileByPath(`Books/${name}.md`)) {
			title.innerText = "Book name: This file is existed";
			title.style.color = "red";
			return;
		}

		if(cover.name.split(".")[1] !== "jpg") {
			titleCover.innerText = "Book cover: The file must be jpg type";
			titleCover.style.color = "red";
			return;
		}

		if(extentionFile !== "pdf") {
			titleFile.innerText = "Book file: The file must be pdf type";
			titleFile.style.color = "red";
			return;
		}

		createBookFile(name, templatePath, targetFolder, descript)
		saveFileToVault(cover, `${name}.jpg`, 'service/book-cover');
		saveFileToVault(file, `${name}.${extentionFile}`, 'Books/BooksFile');

		hideForm();
	});

	buttonCansel.addEventListener("click", () => {
		hideForm();
	});

	popupContainer.appendChild(form);

	showForm(form);
}

// Создает файл на основе шаблона для главы книги
window.showPopupBookNewChapter = function(
	templatePath, // Путь к шаблону файла
	targetFolder, // Целевая папка	
	url = "" // Ссылка на изучаемый ресурс (опционально)
) {

	const form = document.createElement("div");
	form.style.background = "#333";
	form.style.fontSize= "30px";
	form.style.padding = "20px 25px";
	form.style.borderRadius = "10px";
	form.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
	form.style.fontFamily = "sans-serif";
	form.style.opacity = "0";
	form.style.transform = "translateY(-20px)";
	form.style.transition = "opacity 0.3s, transform 0.3s";
	form.style.minWidth = "700px";

	const inputName = document.createElement("input");
	inputName.style.width = "100%";
	inputName.style.height = "40px";
	inputName.style.marginBottom = "10px";
	inputName.style.fontSize = "18px";

	const buttonContainer = document.createElement("div");
	buttonContainer.style.display = "flex";
	buttonContainer.style.justifyContent = "flex-end";
	buttonContainer.style.gap = "10px";

	const buttonSave = document.createElement("button");
	buttonSave.innerText = "Save";
	buttonSave.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonSave.style.background = "var(--interactive-accent)";
	buttonSave.style.fontWeight = "bold";

	const buttonCansel = document.createElement("button");
	buttonCansel.innerText = "Cansel";
	buttonCansel.style.border = "1px solid rgba(0,0,0,0.2)";
	buttonCansel.style.background = "var(--background-modifier-error)";
	buttonCansel.style.fontWeight = "bold";

	buttonContainer.appendChild(buttonSave);
	buttonContainer.appendChild(buttonCansel);

	form.appendChild(inputName);
	form.appendChild(buttonContainer);

	buttonSave.addEventListener("click", async () => {
		const noteTitle = inputName.value.trim().trim();
		const date = getFormattedDate();

		if(noteTitle === "") {
			showToast("Please, type the file name or click on cansel button.");
			return
		}

		// Ограничиваем длину названия
		let safeTitle = date + " - " + noteTitle.replace(/[\\\/:*?"<>|']/g, "");
		if (safeTitle.length > 60) {
			safeTitle = safeTitle.slice(0, 60) + "...";
		}

		hideForm();

		createFile(safeTitle, templatePath, targetFolder, url);
	});

	buttonCansel.addEventListener("click", () => {
		hideForm();
	});

	popupContainer.appendChild(form);

	showForm(form);
}