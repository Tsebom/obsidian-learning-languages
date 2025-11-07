---
banner: "![[video.jpg]]"
banner_y: 0.72667
banner_lock: true
cssclasses:
  - wide-85
settings: service/settings
datawords: service/data/{{dataFile}}
quiz: service/quiz/{{quizFile}}
link: "{{articlUrl}}"
completed: false
tags:
  - articl
---

> [!info] COMPLETED: `INPUT[toggle:completed]`

```meta-bind-button
style: destructive
label: Delete Articl
id: delete
icon: trash
action:
 type: inlineJS
 code: "if (confirm('Are you sure you want to delete this file?')) {await app.vault.adapter.remove('service/quiz/{{quizFile}}');await app.vault.adapter.remove('service/data/{{dataFile}}');await app.vault.adapter.remove('Articls/{{title}}.md');}"
hidden: true
```
```meta-bind-button
style: primary 
label: Start Quiz
id: quiz
icon: rocket
action:
 type: inlineJS
 code: "app.workspace.openLinkText('service/quiz/{{quizFile}}', '/', false);"
hidden: true
```

> [!summary] Articl| `BUTTON[quiz]`| `BUTTON[delete]`
> ```dataviewjs
let url = dv.current()?.link;
let name = dv.current()?.file?.name;
dv.paragraph(`[${name}](${url})`);
>```

```dataviewjs
const toast = await app.vault.adapter.read(".obsidian/scripts/toast.js");
const data = await app.vault.adapter.read(".obsidian/scripts/data.js");
const file = await app.vault.adapter.read(".obsidian/scripts/file.js");
const view = await app.vault.adapter.read(".obsidian/scripts/view.js");

eval(toast);
eval(data);
eval(file);
eval(view);

//-----------------------VARIABLES---------------------------------

const meta = app.plugins.plugins["metaedit"].api;

const thisFile = dv.current(); // Текущий файл
const dataFile = app.vault.getAbstractFileByPath(thisFile.datawords); // Файл с данными слов

const setting = dv.page(thisFile.settings);
const maxgrade = setting.maxgrade; // Максимальное количчество правильных ответов
const libretranslateURL = `http://${setting.libretranslateHost}/translate`;
const API_KEY = setting.API_KEY;

const words = getListWords(thisFile.datawords); // Список слов хранящихся в файле "thisFile.datawords"

const phrases = await readData(dataFile, "phrases");

//------------------VIEW FOR INPUT-------------------------------

// Контейнер для блока добавления слов
const addWordsContainer = document.createElement("div");
addWordsContainer.className = "words-add-container"; 

// Поле input для ввода слова или фразы
const addWordInput = document.createElement("input");
addWordInput.className = "word-add-input";
addWordInput.type = "text";
addWordInput.placeholder = "Word/Phrase";

// Кнопка добавления слова или фразы
const addWordBtn = document.createElement("button");
addWordBtn.className = "word-add-btn";
addWordBtn.textContent = "Add";

addWordsContainer.appendChild(addWordInput);
addWordsContainer.appendChild(addWordBtn);

dv.container.appendChild(addWordsContainer);
addWordInput.focus();

// Событие для кнопки addWord 
addWordBtn.addEventListener("click", async () => {
	let text = addWordInput.value.trim();

	//Проверка: поле не пустое и только латиница + пробелы
	if (!text || !/^[A-Za-z][A-Za-z .,;:'"!?-]*$/.test(text)) {
		showToast("Please enter a word or a phrase using only Latin letters");
		addWordInput.placeholder = "Please enter a word or a phrase using only Latin letters";
		addWordInput.value = ""; // очищаем поле после alert
		addWordInput.focus(); // возвращаем фокус к полю ввода
		return;
	} else {
		addWordInput.placeholder = "Word/Phrase";
	}

	// Проверка: слово или фраза
	try {
		let data;

		if (text.includes(" ")) {
			const phrasesAttr = "phrases";
			let translationPhrase = await getTranslation(text); // получаем перевод фразы

			data = phraseData(text, translationPhrase);

			let row = createRow(data, phrasesAttr);
			updateLastPhrase(row);
			phrasesContainer.insertBefore(row, phrasesContainer.children[1]);

			phrases.unshift(data);

			await writeData(dataFile, phrasesAttr, JSON.stringify(phrases));
		} else {
			const wordsAttr = "words";
			let translationWord = await getTranslation(text); // функция для одиночного слова
			let definitionWord = await getDefinition(text); // получаем определение

			data = wordData(text, translationWord, definitionWord);

			let row = createRow(data, wordsAttr);
			wordsContainer.insertBefore(row, wordsContainer.children[1]);
			row.click();

			await writeData(dataFile, `word-${text}`, JSON.stringify(data));
		}
	} catch (err) {
		addWordInput.focus(); // возвращаем фокус при ошибке
	} finally {
		addWordInput.value = ""; // очищаем поле в любом случае
	}
});

// Добавляем обработчик для клавиши Enter в поле ввода
addWordInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		addWordBtn.click(); // имитируем клик по кнопке
	}
});

//------------------VIEW LAST PHRASE-------------------------

const lastPhraseContainer = document.createElement("div");
lastPhraseContainer.className = "last-phrase-container";

const lastPhraseSourse = document.createElement("div");
lastPhraseSourse.className = "last-phrase-sourse";

const lastPhraseTarget = document.createElement("div");
lastPhraseTarget.className = "last-phrase-target";

if (phrases && phrases.length > 0) {
	lastPhraseSourse.textContent = phrases[0].phrase;
	lastPhraseTarget.textContent = phrases[0].translate;
}

lastPhraseContainer.appendChild(lastPhraseSourse);
lastPhraseContainer.appendChild(lastPhraseTarget);

// Контейнер для таблицы слов и фраз
const tableContainer = document.createElement("div");
tableContainer.className = "table-words-container";

// Обновление последней введеной фразы
function updateLastPhrase(row) {
	const date = row.getElementsByClassName("phrase-container");

	lastPhraseSourse.textContent = date[0].textContent;
	lastPhraseTarget.textContent = date[1].textContent;
}

//------------------VIEW WORDS------------------------------------

// Контейнер для слов и определения выделенного слова
const wordsInfoContainer = document.createElement("div");
wordsInfoContainer.className = "words-info-container";

// Контейнер для слов
const wordsContainer = document.createElement("div");
wordsContainer.className = "words-container"; 

wordsContainer.appendChild(createTitle("Words"));

// Упаковываем все слова в контейнер для слов
words.forEach((w, index) => {
	const row = createRow(w, "words");
	wordsContainer.appendChild(row);

	if (index === 0) {
		highlightRow(row);
	}
});

//------------------VIEW DEFINITION-------------------------------

// Контейнер для определения выбранного слова
const wordDefinitionContainer = document.createElement("div");
wordDefinitionContainer.className = "word-definition-container";

// Добавляем title difinition
wordDefinitionContainer.appendChild(createTitle("Definition"));

// Контейнер для partOfSpeach и definition
const posAndDefinitionContainer = document.createElement("div");
posAndDefinitionContainer.className = "pos-and-definition-container";

posAndDefinitionContainer.appendChild(fillDefinition(words[0]));

// Добавляем после title и будем объновлять динамически
wordDefinitionContainer.appendChild(posAndDefinitionContainer);

// Упаковываем wordsContainer и wordDefinitionContainer в flex контейнер
wordsInfoContainer.appendChild(wordsContainer);
wordsInfoContainer.appendChild(wordDefinitionContainer);

// Добавляем в контейнер таблицы слов и фраз
tableContainer.appendChild(wordsInfoContainer);

//------------------VIEW PHRASES--------------------------------

// Контейнер для фраз
const phrasesContainer = document.createElement("div");
phrasesContainer.className = "phrases-container"; 

phrasesContainer.appendChild(createTitle("Phrases"));

// Упаковываем все фразы в контейнер для фраз
phrases.forEach(p => {
	phrasesContainer.appendChild(createRow(p, "phrases"));
});

// Упаковываем в общий контейнер
tableContainer.appendChild(phrasesContainer);

// Отображаем в заметке
dv.container.appendChild(lastPhraseContainer);
dv.container.appendChild(tableContainer);

```