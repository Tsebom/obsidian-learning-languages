// Создаем строку с данными фразы
function createPhraseRow(item, index) {
	const phraseItem = item?.phrase ?? "";
	const translateItem = item?.translate ?? "";

	// Создаем контейнер данных для фраз
	let phraseRowContainer = document.createElement("div");
	phraseRowContainer.className = "phrase-row-container";

	// Создаем контейнер для фразы + содержимое
	let phrase = document.createElement("div");
	phrase.className = "phrase-container";
	phrase.innerText = phraseItem;

	// Создаем контейнер для перевода + содержимое
	let translate = document.createElement("div");
	translate.className = "phrase-container";
	translate.innerText = translateItem;


	// Создаем кнопку удаления слова
	let phraseDelete = document.createElement("button");
	phraseDelete.className = "phrase-btn phrase-delete-btn";
	phraseDelete.textContent = "❌";
	phraseDelete.addEventListener("click", async () => {
		// Функция для удаления слова
		phrases.splice(index, 1);
		await writeData("phrases", phrases);
	});

	// Упаковываем в контейнер для фраз
	phraseRowContainer.appendChild(phrase);
	phraseRowContainer.appendChild(translate);
	phraseRowContainer.appendChild(phraseDelete);

	return phraseRowContainer;
}