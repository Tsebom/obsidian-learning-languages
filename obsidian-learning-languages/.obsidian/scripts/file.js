// Добавляем атрибут и данные в файл
// file: Tfile - объект файла в который записываем данные
// attribute: string - наименование атрибута в котором хранятся данные
// data: string - данные записываемые в файл
window.writeData = async function(file, attribute, data) {
	let content = await app.vault.read(file);
	
	if(content.startsWith("---")) {
		const yamlEnd = content.indexOf('---', 3); //ищем позицию второго ---, начиная поиск с позиции 3
    let yaml = content.slice(0, yamlEnd + 3); // всё от начала до конца второго --- включительно
    const body = content.slice(yamlEnd + 3);


		let lines = yaml.split("\n");
		let found = false;

		lines = lines.map(line => {
			const pattern = new RegExp(`^\\s*${attribute}\\s*:`);

			if(pattern.test(line)) {
				found =true;
				return `${attribute}: ${data}`; // заменяем строку
			}
			return line;
		})

		if(!found) {
			lines.splice(lines.length - 1, 0, `${attribute}: ${data}`);
		}

		content = lines.join("\n") + body;
	} else {
		content = `---\n${attribute}: ${data}\n---`
	}

	await app.vault.modify(file, content);
}

// Удаляем атрибут из файла
// file: Tfile - объект файла из которого удаляем данные
// attribute: string - наименование атрибута который удаляем
window.deleteData = async function(file, attribute) {
	let content = await app.vault.read(file);
	
	if(content.startsWith("---")) {
		const yamlEnd = content.indexOf('---', 3); //ищем позицию второго ---, начиная поиск с позиции 3
		let yaml = content.slice(0, yamlEnd + 3); // всё от начала до конца второго --- включительно
		const body = content.slice(yamlEnd + 3);

		// Удаляем строку с указанным атрибутом
		const lines = yaml.split('\n');
		const filteredLines = lines.filter(line => {
			// Проверяем, что строка содержит атрибут и это не просто часть другого значения
			const trimmedLine = line.trim();
			return !trimmedLine.startsWith(`${attribute}:`);
		});
		
		// Собираем новый YAML
		let newYaml = filteredLines.join('\n');
		
		// Убеждаемся что YAML начинается и заканчивается ---
		if (!newYaml.startsWith('---')) {
			newYaml = '---\n' + newYaml;
		}
		if (!newYaml.endsWith('---')) {
			newYaml = newYaml.replace(/\n*$/, '') + '\n---';
		}
		
		content = newYaml + body;

	} else {
		// Если нет frontmatter, ничего не делаем
		return;
	}

	await app.vault.modify(file, content);
}

// Читаем данные из атрибута файла
// file: object file - объект файла из которого читаются данные
// attribute: string - наименование атрибута в котором хранятся данные
window.readData = async function (file, attribute) {
	return await meta.getPropertyValue(attribute, file);
}

// Удаляет папку со всем содержимым
window.deleteFolder = async function(path) {
	const files = app.vault.getFiles().filter(f => f.path.startsWith(path));

	for (const file of files) {
		await app.vault.delete(file);
	}

	await app.vault.adapter.rmdir(path, true);
}

// Сохраняет файлы в заданую директорию
window.saveFileToVault = async function (file, fileName, folderPath) {
	const arrayBuffer = await file.arrayBuffer();
	const filePath = `${folderPath}/${fileName}`;

	await app.vault.adapter.writeBinary(filePath, arrayBuffer);
};