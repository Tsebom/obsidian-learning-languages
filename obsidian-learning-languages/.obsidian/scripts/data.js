// Получаем список слов хранящихся в файле
// file: string - путь к файлу
window.getListWords = function(file) {
	const list = [];

	const page = dv.page(file); // заметка с данными
	const keys = Object.keys(page); // список ключей(ат)

	keys.slice().reverse().forEach((key) => {
		if(key.startsWith("word-") && page[key] !== null) {
			list.push(page[key]);
		}
	});

	return list;
}

// Получаем данные слова хранящиеся в файле
// file: string - путь к файлу
window.getWord = function(file, word) {
	const attribute = `word-${word}`;
	const page = dv.page(file); // заметка с данными
	return page[attribute];
}

// Возвращает ответ с сервера Libretranslate в формате JSON
// text: string - слово или фраза для перевода
window.getTranslation = async function(text) {
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
// word: string - слово для которого получаем определение
window.getDefinition = async function(word) {
	try {
		// Создаем AbortController для таймаута
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 15 секунд таймаут

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
// word: string - записываемое слово
// libretranslate: json - данные с сервиса Libretranslate
// definition: json - данные с сервиса Free Dictionary
window.wordData = function(word, libretranslate, definition) {
	// Валидация входных параметров
	if (!word || typeof word !== 'string') {
		showToast('Invalid word parameter in wordData');
		return null;
	}

	// Если нет определения, возвращаем базовую структуру
	if (!Array.isArray(definition) || !definition[0]) { 
		return { 
			word: word,
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
		meanings = [];
	}

	return {
		word: word,
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
// phrase: string - записываемая фраза
// libretranslate: json - данные с сервиса Libretranslate
window.phraseData = function(phrase, libretranslate) {
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