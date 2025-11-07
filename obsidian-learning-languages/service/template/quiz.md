---
banner_y: 0.49333
banner_lock: true
banner: "![[crayons.jpg]]"
cssclasses:
  - wide-85
tags:
  - quiz
settings: service/settings
datawords: {{dataFile}}
mainFile: {{contentType}}/{{title}}.md
---


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
const dataFile = app.vault.getAbstractFileByPath(thisFile.datawords); // Файл с данными слов

const setting = dv.page(thisFile.settings);
const maxgrade = setting.maxgrade; // Максимальное количчество правильных ответов
const wordsCountStudy = setting.wordscountstudy; // Количество слов изучаемых в quiz

const listWords = getListWords(thisFile.datawords); // Список слов хранящихся в файле "thisFile.datawords"
const studyWords = []; // Список слов на изучении
const wordForRepeate = []; // Список слов для повторении
const wordsForStudy = []; // Список слов для изучения

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
if (listWords.isEmpty || listWords.length < 4) {
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
	showToast("Quiz is comlited", 3000);
	app.workspace.openLinkText(thisFile.mainFile, '/', false);
} else if(listWords.length === wordForRepeate.length && completed) {
	showToast("Quiz is comlited", 3000);
}

// Заполняем список слов на изучении и добавляем ему слова
getWordForStudy(wordsForStudy, wordForRepeate, studyWords, wordsCountStudy);

// Запускаем qiuz
quizLoop();

```