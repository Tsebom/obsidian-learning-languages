// Возвращает список слов для изучения
// wordsForStudy: list[object] - список слов для изучения
// wordForRepeate: list[object] - список слов для повторении
// studyWords: list[object] - список слов на изучении
// wordsCountStudy: number - количество слов изучаемых в quiz
window.getWordForStudy = function(wordsForStudy, wordForRepeate, studyWords, wordsCountStudy) {
	let word;

	while(studyWords.length < wordsCountStudy) {
		if(wordsForStudy.length === 0 && wordForRepeate.length === 0) {
			showToast(`There are no words to learn. Please add at least ${wordsCountStudy} words!`, 3000);
			return;
		}
		if(wordsForStudy.length !== 0) {
			word = getRandomWord(wordsForStudy);
			wordsForStudy = deleteWordFromList(word, wordsForStudy);
		} else if(wordForRepeate.length !== 0) {
			word = getRandomWord(wordForRepeate);
			wordForRepeate = deleteWordFromList(word, wordForRepeate);
		} else {
			return studyWords;
		}
		studyWords.push(word);
	}
	return studyWords;
}

// Удаляет из данного списка данное слово
// word: string - слово
// list: list[object] - список слов
window.deleteWordFromList = function(word, list) {
	let index = list.findIndex(el => el.word === word.word);
	list.splice(index, 1);
	return list;
}

// Возвращает случайное слово из заданного списка
// list: list[object] - список слов из которого выбирается слово
window.getRandomWord = function(list) {
	return list[Math.floor(Math.random() * list.length)];
}

// Заполняет поле вопроса и кнопки контентом
window.getQuiz = function() {
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

	button1.textContent = wordsQuestion[0].word;
	button2.textContent = wordsQuestion[1].word;
	button3.textContent = wordsQuestion[2].word;
	button4.textContent = wordsQuestion[3].word;
}

// Очищает поле вопроса и кнопки от контента
window.cleanQuiz = function() {
	questionWord.innerText = "";

	const button = Array.from(document.getElementsByClassName("quiz-answer-button"));
	button.forEach(btn => {
		btn.textContent = "";
		btn.style.backgroundColor = "";
		btn.style.color = "";
	});
}

// Получение из списка объект слова
// list: list[object] - список слов
// word: string - слово искомого объекта
window.getWordFromList = function(list, word) {
	const wObj = list.find(w => w.word === word);
	return wObj;
}

// Проверка правильности ответа
// button - нажатая кнопка
window.cheakAnswer = function(button) {
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
	setTimeout(() => getQuiz(), 1000);
}

// Сохраняем результат изучения
window.saveResult = async function(word="") {
	for (const w of studyWords) {
		await writeData(dataFile, `word-${w.word}`, JSON.stringify(w));
	}
}
