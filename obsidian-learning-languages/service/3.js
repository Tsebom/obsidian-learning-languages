function createRow(item, type) {
	const list = type === "words" ? words : phrases;
	const index = list.findIndex(e => e[keyField].toLowerCase() === textValue.toLowerCase());

	const keyField = type === "words" ? "word" : "phrase";

	const textValue = item?.[keyField] ?? "";
	const translateValue = item?.translate ?? "";

	// Контейнер строки
	let rowContainer = document.createElement("div");
	rowContainer.className = type === "words" ? "word-row-container" : "phrase-row-container";

	if (index === 0 ) {
		rowContainer.style = "border: 1px solid var(--text-title-h1);";
	}

	// Контейнер для слова или фразы
	let textContainer = document.createElement("div");
	textContainer.className = type === "words" ? "word-container" : "phrase-container";
	textContainer.innerText = textValue;

	// Контейнер для перевода
	let translateContainer = document.createElement("div");
	translateContainer.className = type === "words" ? "word-container" : "phrase-container";
	translateContainer.innerText = translateValue;

	// Кнопка удаления
	let deleteBtn  = document.createElement("button");
	deleteBtn.className = type === "words" ? "word-btn word-delete-btn" : "phrase-delete-btn";
	deleteBtn.textContent = "❌";
	deleteBtn.addEventListener("click", async () => {
		if (index !== -1) {
			list.splice(index, 1);
			await writeData(type, list);
			rowContainer.remove();
		}
	});

	// Кнопка аудио
	if (type === "words") {
		const audioUrl = item?.definition?.audio ?? "";
		const audio = new Audio(audioUrl);

		let audioButton = document.createElement("button");
		audioButton.className = "word-btn word-audio-btn";
		audioButton.textContent = "🔊";
		audioButton.addEventListener("click", () => {
			audio.play();
		});

		rowContainer.appendChild(audioButton);

		rowContainer.addEventListener("click", (event) => {
			let curentTarget = event.currentTarget;

			const parent = curentTarget.parentElement;
			const children = Array.from(parent.children);

			children.forEach(child => {
				if (child.className !== "word-title-container") {
					child.style = "border-bottom: 1px solid var(--text-muted);";
				}
			});

			curentTarget.style = "border: 1px solid var(--text-title-h1) !important;";

			posAndDefinitionContainer.innerHTML = ""; 
			posAndDefinitionContainer.appendChild(fillDefinition(item));
		});
	}

	rowContainer.appendChild(textContainer);
	rowContainer.appendChild(translateContainer);
	rowContainer.appendChild(deleteBtn);

	return rowContainer;
}