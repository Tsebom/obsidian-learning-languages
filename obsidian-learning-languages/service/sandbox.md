---
cssclasses:
  - wide-85
banner_y: 0.49333
banner_lock: true
banner: "![[crayons.jpg]]"

---

---

> [!info] 
> **This note is existing for experiments with obsidian. Here I will be check my ideas and purpose.**
>  

---

# DataviewJS

```dataviewjs

//------------------CUSTOM ALERT-------------------------------

const toastContainer = document.createElement("div");
toastContainer.style.position = "fixed";
toastContainer.style.top = "50%";
toastContainer.style.left = "50%";
toastContainer.style.transform = "translate(-50%, -50%)";
toastContainer.style.display = "flex";
toastContainer.style.flexDirection = "column";
toastContainer.style.gap = "10px";
toastContainer.style.zIndex = "9999";
document.body.appendChild(toastContainer);

function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.textContent = message;

  // Стили для тоста
  toast.style.background = "#333";
	toast.style.fontSize= "30px";
  toast.style.color = "#ff0000";
  toast.style.padding = "20px 25px";
  toast.style.borderRadius = "10px";
  toast.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
  toast.style.fontFamily = "sans-serif";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-20px)";
  toast.style.transition = "opacity 0.3s, transform 0.3s";

  toastContainer.appendChild(toast);

  // плавное появление
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // скрытие через duration
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

//----------------------------------------------------------

// Получаем настройки
const setting = dv.page("service/Settings");
const maxgrade = setting.maxgrade;

const container = this.container;
const meta = app.plugins.plugins["metaedit"].api;

const libretranslateURL = `http://${setting.libretranslateHost}/translate`;
const API_KEY = setting.API_KEY;

// Получаем активный файл (скрипт запускается из него же)
const file = app.vault.getAbstractFileByPath("service/Data.md");

// Получаем массив объектов со словами
const words = await readData("words"); 

// Получаем массив объектов с фразами
const phrases = await readData("phrases");

//----------------------QUIZ VIEW---------------------------------

const quizContainer = document.createElement("div");
quizContainer.className = "quiz-container"; 

const questionContainer = document.createElement("div");
questionContainer.className = "question-container"; 

const questionWord = document.createElement("div");
questionWord.className = "question-word";

const answerContainer = document.createElement("div");
answerContainer.className = "answer-container"; 

quizContainer.appendChild(questionContainer);
questionContainer.appendChild(questionWord);

quizContainer.appendChild(answerContainer);

dv.container.appendChild(quizContainer);

// Список слов для изучения
const wordList = () => {
	const list = [];

	words.forEach(w => {
		list.unshift(w.word);
	});

	return list;
};
let countBeforeSave = 0;
quizLoop();

//--------------------QUIZ LOGIC---------------------------------

function quizLoop() {
	const answerWords = getRandomWords(wordList(), 4);
	const questionedWord = getRandomWords(answerWords, 1);

	const questionedWordObject = words.find(w => w.word === questionedWord[0])
	const questionedWordTranslate = questionedWordObject?.translate;
	const statistic = questionedWordObject.statistics;
	const grade = statistic.grade;
	const qiuzSave = statistic.quizautosave;

	questionWord.innerText = questionedWordTranslate;

	answerWords.forEach(word => {
		const answerBtn = document.createElement("button");
		answerBtn.className = "quiz-answer-button";
		answerBtn.textContent = word;

		answerBtn.addEventListener("click", (event) => {
			const answeredWord = event.currentTarget.textContent;
			countBeforeSave = countBeforeSave + 1;

			showToast(countBeforeSave);

			if (answeredWord === questionedWord[0]) {
				answerBtn.style.backgroundColor = "var(--color-green)";
				answerBtn.style.color = "black";
				if (grade < maxgrade) {
					statistic.grade = grade + 1;
				}
				
			} else {
				answerBtn.style.backgroundColor = "var(--color-red)";
				answerBtn.style.color = "black";
				if (grade > 0) {
					statistic.grade = grade - 1;
				}
			}

			setTimeout(() => {
				if (countBeforeSave > qiuzSave) {
					writeData("words", words);
				} else {
					questionWord.innerHTML = "";
					answerContainer.innerHTML = "";
					quizLoop();
				}
			}, 500);
		});

		answerContainer.appendChild(answerBtn);
	});
}


//------------------QUIZ FUNCTIONS-------------------------------

// Получаем лист случайных слов
function getRandomWords(arr, count) {
	const list = [];

	while(list.length < count) {
		let randomElement = arr[Math.floor(Math.random() * arr.length)];

		if (!list.includes(randomElement)) {
			list.unshift(randomElement);
		}
	}

	return list;
}

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

//------------------FUNCTIONS FOR INPUT-------------------------------

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
			let translationPhrase = await getTranslation(text);    // вызываем функцию для фраз

			data = phraseData(text, translationPhrase);
			let row = createRow(data, phrasesAttr);
			updateLastPhrase(row);
			phrasesContainer.insertBefore(row, phrasesContainer.children[1]);

			const updateData = await attributeData(data, phrasesAttr)
			if (updateData) await writeData(phrasesAttr, updateData);
		} else {
			const wordsAttr = "words";
			let translationWord = await getTranslation(text);        // функция для одиночного слова
			let definitionWord = await getDefinition(text);   // получаем определение

			data = wordData(text, translationWord, definitionWord);
			let row = createRow(data, wordsAttr);
			wordsContainer.insertBefore(row, wordsContainer.children[1]);
			row.click();

			const updateData = await attributeData(data, wordsAttr);
			if (updateData) await writeData(wordsAttr, updateData);
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

// Возвращает ответ с сервера Libretranslate в формате JSON
async function getTranslation(text) {
	try {
		// Создаем AbortController для таймаута
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут

		const res = await fetch(libretranslateURL, {
			method: "POST",
			body: JSON.stringify({
				q: text,
				source: "en",
				target: "ru",
				format: "text",
				alternatives: 3,
				api_key: API_KEY || undefined // убираем пустой ключ
			}),
			headers: { "Content-Type": "application/json" },
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`Translation API error: ${res.status} - ${errorText}`);
		}

		const data = await res.json();
		
		// Валидация ответа
		if (!data || typeof data !== 'object') {
			throw new Error('Invalid response format from translation API');
		}

		return data;

	} catch (err) {			
		// Cообщения об ошибках
		let errorMessage = "Translation failed";
		if (err.name === 'AbortError') {
			errorMessage = "Translation timeout - Libretranslate server is not responding";
		} else if (err.message.includes('Failed to fetch')) {
			errorMessage = "Cannot connect to translation server. Check if LibreTranslate is running";
		} else if (err.message.includes('Translation API error')) {
			errorMessage = err.message;
		}
		showToast(errorMessage);
		return { 
			translatedText: "",
			alternatives: [] 
		};
	}
}

// Возвращает ответ с сервиса Free Dictionary API в формате JSON
async function getDefinition(word) {
	try {
		// Создаем AbortController для таймаута
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд таймаут

		const res = await fetch(
			`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
			{
				signal: controller.signal
			}
		);
		
		clearTimeout(timeoutId);

		if (!res.ok) {
			if (res.status === 404) {
				showToast(`Word "${word}" not found in dictionary`);
				return [];
			}
			throw new Error(`Dictionary API error: ${res.status}`);
		}

		const data = await res.json();
		
		// Валидация ответа
		if (!Array.isArray(data)) {
			showToast('Invalid response format from dictionary API');
			return [];
		}

		return data;
	} catch (err) {
		showToast(`Dictionary API error: ${err}`);
		
		// Сообщения об ошибках
		if (err.name === 'AbortError') {
			showToast('Dictionary API timeout - server is not responding');
		} else if (err.message.includes('Failed to fetch')) {
			showToast('Cannot connect to dictionary server. Check your internet connection');
		}
		
		return [];
	}
}

// Формируем объект слова для записи в атрибут
function wordData(word, libretranslate, definition) {
	// Валидация входных параметров
	if (!word || typeof word !== 'string') {
		showToast('Invalid word parameter in wordData');
		return null;
	}

	// Если нет определения, возвращаем базовую структуру
	if (!Array.isArray(definition) || !definition[0]) { 
		return { 
			word: word.trim(),
			statistics: {
				grade: 0
			},
			translate: libretranslate?.translatedText || "",
			alternatives: libretranslate?.alternatives ?? [],
			definition: {
				audio: "",
				meanings: []
			}
		};
	}

	// Безопасное получение фонетики
	let audioUrl = "";
	try {
		const phonetics = definition[0].phonetics;
		if (Array.isArray(phonetics)) {
			const phonetic = phonetics.find(p => p && p.audio && typeof p.audio === 'string');
			if (phonetic) {
				if (phonetic.audio.startsWith("https:")) {
					audioUrl = phonetic.audio;
				} else if (phonetic.audio.startsWith("//")) {
					audioUrl = `https:${phonetic.audio}`;
				} else if (phonetic.audio.startsWith("/")) {
					audioUrl = `https:${phonetic.audio}`;
				} else {
					audioUrl = phonetic.audio; // уже полный URL
				}
			}
		}
	} catch (err) {
		showToast(`Error processing audio URL: ${err}`);
	}

	// Безопасное получение значений
	let meanings = [];
	try {
		meanings = definition[0].meanings || [];
		if (!Array.isArray(meanings)) {
			meanings = [];
		}
	} catch (err) {
		showToast(`Error processing meanings: ${err}`);
	}

	return {
		word: word.trim(),
		statistics: {
			grade: 0
		},
		translate: libretranslate?.translatedText || "",
		alternatives: libretranslate?.alternatives ?? [],
		definition: {
			audio: audioUrl,
			meanings: meanings
		}
	};
}

// Формируем объект фразы для записи в атрибут
function phraseData(phrase, libretranslate) {
		// Валидация входных параметров
		if (!phrase || typeof phrase !== 'string') {
			showToast('Invalid phrase parameter in phraseData');
			return null;
		}

		// Очищаем фразу от лишних пробелов
		const cleanPhrase = phrase.trim();
		
		if (!cleanPhrase) {
			showToast('Empty phrase in phraseData');
			return null;
		}

		return {
			phrase: cleanPhrase,
			translate: libretranslate?.translatedText || "",
		};
}

// Формируем данные для атрибута
async function attributeData(data, attribute) {
	// Валидация входных параметров
	if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
		showToast('Invalid data parameter in attributeData');
		return null;
	}

	if (!attribute || typeof attribute !== 'string') {
		showToast('Invalid attribute parameter in attributeData');
		return null;
	}

	try {
		const currentList = await readData(attribute);
		const list = Array.isArray(currentList) ? [...currentList] : [];

		// Определяем ключевое поле для проверки дубликатов
		const keyField = ("word" in data ? "word" : ("phrase" in data ? "phrase" : null));
		
		if (!keyField) {
			showToast('Invalid data structure: missing word or phrase field');
			return null;
		}

		// Проверяем на дубликаты (регистронезависимо)
		const exists = list.some(item => {
			if (item && typeof item === "object" && keyField in item) {
				const existingValue = String(item[keyField]).toLowerCase().trim();
				const newValue = String(data[keyField]).toLowerCase().trim();
				return existingValue === newValue;
			}
			return false;
		});

		if (exists) {
			showToast(`"${data[keyField]}" already exists in your ${attribute} list`);
			return null;
		}

		// Защитимся от пустых объектов и невалидных записей
		if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
			return list;
		}

		// Добавляем в начало списка (новые элементы сверху)
		list.unshift(data);

		return list;

	} catch (error) {
		showToast(`Error in attributeData: ${error}`);
		return null;
	}
}

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

//------------------FUNCTIONS FOR INFO BLOCK-------------------------------

// Создаем заголовок
function createTitle(title) {
	const titleContainer = document.createElement("div");
	titleContainer.className = "word-title-container";

	const titleContent = document.createElement("h1");
	titleContent.className = "word-title";
	titleContent.textContent = `${title}`;

	titleContainer.appendChild(titleContent);

	return titleContainer
}

function createRow(item, type) {
	const isWord = type === "words";
	const keyField = isWord ? "word" : "phrase";

	const textValue = item?.[keyField] ?? "";
	const translateValue = item?.translate ?? "";

	// Контейнер строки
	const rowContainer = document.createElement("div");
	rowContainer.className = isWord ? "word-row-container" : "phrase-row-container";

	// Контейнер для слова или фразы
	const textContainer = document.createElement("div");
	textContainer.className = isWord ? "word-container" : "phrase-container";
	textContainer.innerText = textValue;

	// Контейнер для перевода
	const translateContainer = document.createElement("div");
	translateContainer.className = isWord ? "word-container" : "phrase-container";
	translateContainer.innerText = translateValue;

	// Кнопка удаления
	const deleteBtn  = document.createElement("button");
	deleteBtn.className = isWord ? "word-btn word-delete-btn" : "phrase-delete-btn";
	deleteBtn.textContent = "❌";
	deleteBtn.addEventListener("click", async () => {
		const list = isWord ? words : phrases;
		const index = list.findIndex(e => e[keyField].toLowerCase() === textValue.toLowerCase());

		if (index !== -1) {
			list.splice(index, 1);
			await writeData(type, list);
			rowContainer.remove();
		}

		if (isWord) {
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
		const grade = item?.statistics.grade;

		const audioUrl = item?.definition?.audio ?? "";
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
			posAndDefinitionContainer.appendChild(fillDefinition(item));
		});

	}

	rowContainer.appendChild(textContainer);
	rowContainer.appendChild(translateContainer);
	rowContainer.appendChild(deleteBtn);

	return rowContainer;
}

function highlightRow(row) {
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
function createPartsOfSpeech(item = words[0]) {
	const meanings = item?.definition?.meanings ?? [];

	if (!meanings && meanings.length === 0) {
		return null;
	}

	return meanings;
}

// Создать параграф для definition
function appendParagraph(text) {
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
function fillDefinition(data) {
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

//--------------------FUNCTIONS--------------------------------

// Читает данные из атрибута файла
async function readData(attribute) {
	try {
		const value = await meta.getPropertyValue(attribute, file);
		if (Array.isArray(value)) return value;
		if (value == null) return [];
		if (typeof value === "object") return [value];
		return [];
	} catch (e) {
		return [];
	}
}

// Добавляет данные в атрибут файла
async function writeData(attribute, data) {
	await meta.update(attribute, data, file);
}

```