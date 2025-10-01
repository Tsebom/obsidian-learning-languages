// Создаем строку с данными слова
function createWordRow(item, index) {
	const wordItem = item?.word ?? "";
	const translateItem = item?.translate ?? "";

	const audioUrl = item?.definition?.audio ?? "";
	const audio = new Audio(audioUrl);

	// Создаем контейнер данных для слова
	let wordRowContainer = document.createElement("div");
	wordRowContainer.className = "word-row-container";

	wordRowContainer.addEventListener("click", (event) => {
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
		posAndDefinitionContainer.appendChild(fillDefinition(words[index]));
	});
 
	// Создаем аудио кнопку
	let audioButton = document.createElement("button");
	audioButton.className = "word-btn word-audio-btn";
	audioButton.textContent = "🔊";
	audioButton.addEventListener("click", () => {
		audio.play();
	});

	// Создаем контейнер для слова + содержимое
	let word = document.createElement("div");
	word.className = "word-container";
	word.innerText = wordItem;

		// Создаем контейнер для перевода + содержимое
	let translate = document.createElement("div");
	translate.className = "word-container";
	translate.innerText = translateItem;

	// Создаем кнопку удаления слова
	let wordDelete = document.createElement("button");
	wordDelete.className = "word-btn word-delete-btn";
	wordDelete.textContent = "❌";
	wordDelete.addEventListener("click", async () => {
		// Функция для удаления слова
		words.splice(index, 1);
		await writeData("words", words);
	});

	// Упаковываем в контейнер для слова
	wordRowContainer.appendChild(audioButton)
	wordRowContainer.appendChild(word);
	wordRowContainer.appendChild(translate);
	wordRowContainer.appendChild(wordDelete);

	if (index === 0 ) {
		wordRowContainer.style = "border: 1px solid var(--text-title-h1);";
	}

	return wordRowContainer;
}