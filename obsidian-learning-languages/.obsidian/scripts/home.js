// Читает буфер обмена
window.getClipboard = async function() {
	let clipboardText = "";
	try {
		clipboardText = await navigator.clipboard.readText();
		
	} catch (e) {
		showToast("Can not read your clipboard");
	}
	return clipboardText;
}

// Возвращает дату в формате day.month.year-hour-minutes-seconds
window.getFormattedDate = function() {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}.${month}.${year}-${hours}-${minutes}-${seconds}`;
}

window.getFirstH1 = async function (url) {
  try {
    // Используем встроенный requestUrl — работает в Obsidian БЕЗ CORS!
    const response = await requestUrl(url);
    if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

    const text = response.text;
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const h1 = doc.querySelector("h1");

    return h1 ? h1.textContent.trim() : "H1 не найден";
  } catch (e) {
    console.warn("Ошибка загрузки:", url, e);
    showPopupNewArticleName();
    return "Не удалось загрузить";
  }
}