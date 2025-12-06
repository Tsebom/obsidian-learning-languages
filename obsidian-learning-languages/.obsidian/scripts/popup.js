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
window.showPopupNewName = function() {

	const wordTemplatePath = "service/template/word.md"
	const wordTargetFolder = "Words";

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

		createFile(safeTitle, wordTemplatePath, wordTargetFolder);
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