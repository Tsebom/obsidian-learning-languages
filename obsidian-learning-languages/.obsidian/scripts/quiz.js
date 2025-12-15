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
