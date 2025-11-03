// Возвращает список слов для изучения
// wordsForStudy: list[object] - список слов для изучения
// wordForRepeate: list[object] - список слов для повторении
// studyWords: list[object] - список слов на изучении
// wordsCountStudy: number - количество слов изучаемых в quiz
window.getWordForStudy = function(wordsForStudy, wordForRepeate, studyWords, wordsCountStudy) {
	let word;

	while(studyWords.length < wordsCountStudy) {
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

// Создаем quiz
window.quizLoop = function() {
	const wordsQuestion = [];
	let click = true;

	while(wordsQuestion.length < 4) {
		let word = getRandomWord(studyWords);

		let exist = wordsQuestion.some(item => item.word === word.word);
		if(!exist) {
			wordsQuestion.push(word);
		}
	}

	const wordQuestion = getRandomWord(wordsQuestion);
	questionWord.innerText = wordQuestion.translate;

	wordsQuestion.forEach(word => {
		const button = document.createElement("button");
		button.className = "quiz-answer-button";
		button.textContent = word.word;

		answerContainer.appendChild(button);

		button.addEventListener("click", () => {
			if(click === false) return;
			click = false;
			if(word.word === wordQuestion.word) {
				button.style.backgroundColor = "var(--color-green)";
				button.style.color = "var(--color-base-00)";
				if(wordQuestion.statistics.grade < maxgrade) {
					wordQuestion.statistics.grade = wordQuestion.statistics.grade + 1;
				}
			} else {
				button.style.backgroundColor = "var(--color-red)";
				button.style.color = "var(--color-base-00)";

				const buttonList = Array.from(document.getElementsByClassName("quiz-answer-button"));
				buttonList.forEach(button => {
					if(button.textContent === wordQuestion.word) {
						button.style.backgroundColor = "var(--color-green)";
						button.style.color = "var(--color-base-00)";
					}
				});

				if(wordQuestion.statistics.grade > 0 && wordQuestion.statistics.grade < maxgrade) {
					wordQuestion.statistics.grade = wordQuestion.statistics.grade - 1;
				}

				if(wordQuestion.statistics.grade === maxgrade) {
					wordQuestion.statistics.grade = Math.floor(wordQuestion.statistics.grade / 2);
				}
			}

			writeData(dataFile,`word-${wordQuestion.word}`, JSON.stringify(wordQuestion));
		});

	});
}