// Создаем заголовок
// title: string - заголовок
window.createTitle = function(title) {
	const titleContainer = document.createElement("div");
	titleContainer.className = "word-title-container";

	const titleContent = document.createElement("h1");
	titleContent.className = "word-title";
	titleContent.textContent = `${title}`;

	titleContainer.appendChild(titleContent);

	return titleContainer
}

// Обновление последней введеной фразы
// row - контейнер с фразами
window.updateLastPhrase = function(row) {
	const date = row.getElementsByClassName("phrase-container");

	lastPhraseSourse.textContent = date[0].textContent;
	lastPhraseTarget.textContent = date[1].textContent;
}

// Создает строку со словом или фразой
// data: json - данные слова или фразы
// type: string - тип контента (слово или фраза)
window.createRow = function(data, type) {
	const isWord = type === "words";
	const keyField = isWord ? "word" : "phrase";

	const textValue = data?.[keyField] ?? "";
	let translateValue = data?.translate;

	// Контейнер строки
	const rowContainer = document.createElement("div");
	rowContainer.className = isWord ? "word-row-container" : "phrase-row-container";

	// Контейнер для слова или фразы
	const textContainer = document.createElement("div");
	textContainer.className = isWord ? "word-container" : "phrase-container";
	textContainer.innerText = textValue;

	// Кнопка редактирования перевода
	const editButton = document.createElement("button");
	editButton.className = "word-btn word-edit-btn";
	editButton.textContent = "✏️...";
	editButton.addEventListener("click", () => {
		showPopupEditTranslate(`Edit translate for word "${data.word}":`, data, dataFile);
	});

	// Контейнер для перевода
	const translateContainer = document.createElement("div");
	translateContainer.className = isWord ? "translate-container" : "phrase-container";
	translateContainer.innerText = translateValue;

	// Кнопка удаления
	const deleteBtn  = document.createElement("button");
	deleteBtn.className = isWord ? "word-btn word-delete-btn" : "phrase-delete-btn";
	deleteBtn.textContent = "❌";
	deleteBtn.addEventListener("click", async () => {
		const list = isWord ? words : phrases;
		const index = list.findIndex(element => element[keyField].toLowerCase() === textValue.toLowerCase());
		
		list.splice(index, 1);
		if (index !== -1) {
			if(isWord) {
				await deleteData(dataFile, `word-${data.word}`);
			} else {
				await writeData(dataFile, type, JSON.stringify(list));
			}
			rowContainer.remove();
		}

		if(!isWord) {
			const rows = phrasesContainer.getElementsByClassName("phrase-row-container");
			if (rows.length !== 0) {
				updateLastPhrase(rows[0]);
			} else {
				lastPhraseSourse.textContent = "";
				lastPhraseTarget.textContent = "";
			}
		}
	});

	// Фишки для слов (аудио и обработка клика)
	if (isWord) {
		const grade = data?.statistics.grade;

		const audioUrl = data?.definition?.audio ?? "";
		const audio = new Audio(audioUrl);

		const audioButton = document.createElement("button");
		audioButton.className = "word-btn word-audio-btn";
		audioButton.textContent = "🔊";
		audioButton.addEventListener("click", () => {
			audio.play();
		});

		if (grade / maxgrade < 0.5) {
			audioButton.style.backgroundColor = "var(--color-red)";
		} else if (grade / maxgrade >= 0.5 && grade / maxgrade < 1) {
			audioButton.style.backgroundColor = "var(--color-yellow)";
		} else if (grade / maxgrade >= 1) {
			audioButton.style.backgroundColor = "var(--color-green)";
		}

		rowContainer.appendChild(audioButton);

		rowContainer.addEventListener("click", (event) => {
			const curentTarget = event.currentTarget;

			// При удалении активного слова переключить активное состояние на соседнее
			if (curentTarget.classList.contains("word-row-container-active") && event.target === deleteBtn) {
				const next = curentTarget.nextElementSibling;
				const prev = curentTarget.previousElementSibling;

				posAndDefinitionContainer.innerHTML = "";
				if(prev && !prev.classList.contains("word-title-container")) {
					highlightRow(prev);
					prev.click();
					return;
				} else if(next) {
					highlightRow(next);
					next.click();
					return;
				}
			}

			if (event.target === audioButton || event.target === deleteBtn) {
				return;
			}

			highlightRow(curentTarget);

			posAndDefinitionContainer.innerHTML = ""; 
			posAndDefinitionContainer.appendChild(fillDefinition(data));
		});

	}

	rowContainer.appendChild(textContainer);
	if (isWord) {
		rowContainer.appendChild(editButton);
	}
	rowContainer.appendChild(translateContainer);
	rowContainer.appendChild(deleteBtn);

	return rowContainer;
}

// Посвечивает слочку со словом при клике
// row - объект строки в DOM
window.highlightRow = function(row) {
	const parent = row.parentElement;
	const children = Array.from(parent.children);

	children.forEach(child => {
		if (child.classList.contains("word-row-container-active")) {
			child.classList.remove("word-row-container-active");
		}
	});

	row.classList.add("word-row-container-active");
}

// Получаем meanings из words[index]
// item: object[json] - объект слова
window.createPartsOfSpeech = function(item = words[0]) {
	const meanings = item?.definition?.meanings ?? [];

	if (!meanings || meanings.length === 0) {
		return null;
	}

	return meanings;
}

// Создать параграф для definition
// text: string - текст
window.appendParagraph = function(text) {
	const paragraphContainer = document.createElement("div");
	paragraphContainer.className = "paragraph-container";

	const textContainer = document.createElement("div");

	const paragraph = document.createElement("p");
	paragraph.className = "paragraph-definition";
	paragraph.textContent = `${text}`;

	const btn = document.createElement("button");
	btn.textContent = "Translate";

	textContainer.appendChild(paragraph);

	let click = 1;
	btn.addEventListener("click", async () => {
		if(click) {
			click = 0;
			let taranslate = await getTranslation(text);

			const paragraph = document.createElement("p");
			paragraph.className = "paragraph-definition-translate";
			paragraph.textContent = `${taranslate.translatedText}`;

			textContainer.appendChild(paragraph);
		}
	})

	paragraphContainer.appendChild(btn);
	paragraphContainer.appendChild(textContainer);

	return paragraphContainer;
}

// Заполняет данными difinition
// data: object[json] - данные слова
window.fillDefinition = function(data) {
	// Получаем массив объектов partOfSpeach
	const partsOfSpeach = createPartsOfSpeech(data);

	const partsOfSpeechContainer = document.createElement("div");

	partsOfSpeach.forEach(p => {
		// Контейнер для части речи
		const partOfSpeechContainer = document.createElement("div");
		partOfSpeechContainer.className = "partofspeach-container";

		// Часть речи
		const pos = document.createElement("div");
		pos.className = "pos";
		pos.textContent = `${p.partOfSpeech + ":"}`;

		// Получаем массив объектов definitions
		const definitions = p?.definitions ?? [];

	// Контейнер для всех definitions
		const definitionsContainer = document.createElement("div");
		definitionsContainer.className = "definitions-container";

		definitions.forEach(d => {
			// Контейнер для defenitions
			const definitionContainer = document.createElement("div");
			definitionContainer.className = "definition-container";

			// Контейнер для defenition
			const definition = document.createElement("div");
			d.definition ? definition.textContent = `definition: ` : "";
			definition.appendChild(appendParagraph(`${d.definition}`));

			// Контейнер для example
			const example = document.createElement("div");
			if (d.example) {
				example.textContent = `example: `;
				example.appendChild(appendParagraph(`${d.example}`));
			}

			// Контейнер для synonyms
			const synonyms = document.createElement("div");
			if (d.synonyms && d.synonyms.length !== 0) {
				synonyms.textContent = `synonyms: `;
				d.synonyms.forEach(s => {
					synonyms.appendChild(appendParagraph(`${s}`));
				})
			}

			// Контейнер для antonyms
			const antonyms = document.createElement("div");
			if (d.antonyms && d.antonyms.length !== 0) {
				antonyms.textContent = `antonyms: `;
				d.antonyms.forEach(a => {
					antonyms.appendChild(appendParagraph(`${a}`));
				})
			}

			// Упаковываем definitionContainer
			definitionContainer.appendChild(definition);
			definitionContainer.appendChild(example);
			definitionContainer.appendChild(synonyms);
			definitionContainer.appendChild(antonyms);
			
			// Упаковываем defenitions для конкрктного partofspeech
			definitionsContainer.appendChild(definitionContainer);
		});

		partOfSpeechContainer.appendChild(pos);
		partOfSpeechContainer.appendChild(definitionsContainer);

		partsOfSpeechContainer.appendChild(partOfSpeechContainer);
	});

	return partsOfSpeechContainer;
}