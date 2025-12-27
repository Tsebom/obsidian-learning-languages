---
banner_y: 0.49333
banner_lock: true
banner: "![[quiz.jpg]]"
cssclasses:
  - wide-85
tags:
  - quiz
settings: service/settings
datawords: {{dataFile}}
mainFile: {{contentType}}/{{title}}.md
---

```meta-bind-button
style: primary 
label: Save
id: save
icon: rocket
action:
 type: inlineJS
 code: "saveResult();"
hidden: true
```

> [!summary] Save intermediate result
> `BUTTON[save]`

```dataviewjs
const toast = await app.vault.adapter.read(".obsidian/scripts/toast.js");
const data = await app.vault.adapter.read(".obsidian/scripts/data.js");
const quiz = await app.vault.adapter.read(".obsidian/scripts/quiz.js");
const file = await app.vault.adapter.read(".obsidian/scripts/file.js");

eval(toast);
eval(data);
eval(quiz);
eval(file);

//-----------------------VARIABLES---------------------------------

const meta = app.plugins.plugins["metaedit"].api;

const thisFile = dv.current(); // Текущий файл
const thisTFile = app.vault.getAbstractFileByPath(thisFile.file.path); // 
const dataFile = app.vault.getAbstractFileByPath(thisFile.datawords); // Файл с данными слов

const setting = dv.page(thisFile.settings);
const maxgrade = setting.maxgrade; // Максимальное количчество правильных ответов
const wordsCountStudy = setting.wordscountstudy; // Количество слов изучаемых в quiz

const listWords = getListWords(thisFile.datawords); // Список слов хранящихся в файле "thisFile.datawords"
const wordForRepeate = []; // Список слов для повторении
const wordsForStudy = []; // Список слов для изучения

let studyWords = []; // Список слов на изучении

//-------------------------QUIZ-----------------------------------

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

// Проверяем наличие необходимого количества слов для изучения или повторения
if (listWords.isEmpty || listWords.length < wordsCountStudy) {
	questionWord.innerText = `There are no words to learn. Please add at least ${wordsCountStudy} words!`;
	return;
}

// Заполняем списки wordForRepeate и wordsForStudy
listWords.forEach((word) => {
	const grade = word.statistics.grade;
	if (grade < maxgrade) {
		wordsForStudy.push(word);
	} else {
		wordForRepeate.push(word);
	}
});

const completed = await meta.getPropertyValue("completed", thisFile.mainFile);

if(listWords.length === wordForRepeate.length && !completed) {
	await meta.update("completed", true, thisFile.mainFile);
	showToast("Quiz is completed", 3000);
	app.workspace.openLinkText(thisFile.mainFile, '/', false);
} else if(listWords.length === wordForRepeate.length && completed) {
	showToast("Quiz is completed", 3000);
}

// Заполняем список слов на изучении и добавляем ему слова
if (studyWords.length < wordsCountStudy) {
	studyWords = getWordForStudy(wordsForStudy, wordForRepeate, studyWords, wordsCountStudy);
}

const button1 = document.createElement("button");
button1.className = "quiz-answer-button";
button1.addEventListener("click", () => {
	cheakAnswer(button1);
});

const button2 = document.createElement("button");
button2.className = "quiz-answer-button";
button2.addEventListener("click", () => {
	cheakAnswer(button2);
});

const button3 = document.createElement("button");
button3.className = "quiz-answer-button";
button3.addEventListener("click", () => {
	cheakAnswer(button3);
});

const button4 = document.createElement("button");
button4.className = "quiz-answer-button";
button4.addEventListener("click", () => {
	cheakAnswer(button4);
});

answerContainer.appendChild(button1);
answerContainer.appendChild(button2);
answerContainer.appendChild(button3);
answerContainer.appendChild(button4);

getQuiz();

// Заполняет поле вопроса и кнопки контентом
function getQuiz() {
	const wordsQuestion = [];

	while(wordsQuestion.length < 4) {
		let word = getRandomWord(studyWords);

		let exist = wordsQuestion.some(item => item.word === word.word);
		if(!exist) {
			wordsQuestion.push(word);
		}
	}

	const wordQuestion = getRandomWord(wordsQuestion);
	questionWord.innerText = wordQuestion.translate;
	questionWord.dataset.word = wordQuestion.word;
	console.log({wordQuestion})

	button1.textContent = wordsQuestion[0].word;
	button2.textContent = wordsQuestion[1].word;
	button3.textContent = wordsQuestion[2].word;
	button4.textContent = wordsQuestion[3].word;
}

// Очищает поле вопроса и кнопки от контента
function cleanQuiz() {
	questionWord.innerText = "";

	const buttons = Array.from(document.getElementsByClassName("quiz-answer-button"));
	buttons.forEach(btn => {
		btn.textContent = "";
		btn.style.backgroundColor = "";
		btn.style.color = "";
	});
}

// Получение из списка объект слова
// list: list[object] - список слов
// word: string - слово искомого объекта
function getWordFromList(list, word) {
	const wObj = list.find(w => w.word === word);
	return wObj;
}

// Проверка правильности ответа
// button - нажатая кнопка
function cheakAnswer(button) {
	const question = getWordFromList(studyWords, questionWord.dataset.word);
	
	const answer = button.textContent;

	if(answer === question.word) {
		button.style.backgroundColor = "var(--color-green)";
		button.style.color = "var(--color-base-00)";

		if(question.statistics.grade < maxgrade) {
			question.statistics.grade = question.statistics.grade + 1;
		}

		if(question.statistics.grade === Number(maxgrade)) {
			saveResult(question);
			return;
		}
	} else {
		button.style.backgroundColor = "var(--color-red)";
		button.style.color = "var(--color-base-00)";

		if(question.statistics.grade > 0 && question.statistics.grade < maxgrade) {
			question.statistics.grade = question.statistics.grade - 1;
		}

		if(question.statistics.grade === Number(maxgrade)) {
			question.statistics.grade = Math.floor(question.statistics.grade / 2);
			saveResult(question);
			return;
		}
	}
	setTimeout(() => cleanQuiz(), 1000);
	setTimeout(() => getQuiz(), 1100);
}

// Сохраняем результат изучения
window.saveResult = async function () {
	for (const w of studyWords) {
		await writeData(dataFile, `word-${w.word}`, JSON.stringify(w));
	}
}
```