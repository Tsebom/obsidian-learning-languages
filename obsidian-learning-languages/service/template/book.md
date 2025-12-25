---
banner: "![[service/book-cover/{{title}}.jpg]]"
cssclasses:
  - wide-85
banner_x: 0.49804
banner_lock: true
completed: false
tags:
  - book
---
---
> [!info]  Status: `BUTTON[quiz]`| `BUTTON[delete]`
> COMPLETED: `INPUT[toggle:completed]` 

```meta-bind-button
style: destructive
label: Delete Book
id: delete
icon: trash
action:
 type: inlineJS
 code: "window.showPopupDeleteFile('Are you sure you want to delete this file?', 'service/book-cover/{{title}}.jpg', 'Books/BooksFile/{{title}}.pdf', 'Books/{{title}}.md');deleteFolder('Books/BooksData/{{title}}');"
hidden: true
```
```meta-bind-button
style: primary 
label: Add Note
id: quiz
icon: rocket
action:
 type: inlineJS
 code: "showPopupBookNewChapter('service/template/book-chapter.md', 'Books/BooksData/{{title}}');"
hidden: true
```

> [!todo] File:
> ```dataviewjs
> let file = dv.fileLink(`Books/BooksFile/${dv.current().file.name}.pdf`,
  false,
  dv.current().title);
  dv.paragraph(file);
>```

> [!summary] Description
>  "{{description}}"

<hr>

```dataviewjs
// Берем все записи
let allPages = dv.pages('"Books/BooksData/{{title}}"');

const container = document.createElement('div');
container.className = "book-container";
container.style.marginBottom = "20px";

allPages.forEach(p => {
	const itemChapter = document.createElement('div');
	itemChapter.className = "book-container-item";

	let itemStatus = document.createElement("div");
	itemStatus.className = "book-status-item book-item";

	let itemName = document.createElement("div");
	itemName.className = "book-name-item book-item";

	if(!p.completed) {
		itemStatus.innerText = "🚀";
	}
	else {
		itemStatus.innerText = "✅";
	}

  let a = document.createElement("a");
  a.href = "obsidian://open?vault=" + app.vault.getName() + "&file=" + p.file.path;
	let name = p.file.name.split(" - ")[1];
  a.innerText = name;
  itemName.appendChild(a);

	itemChapter.appendChild(itemStatus);
	itemChapter.appendChild(itemName);

	container.appendChild(itemChapter);
});

dv.container.appendChild(container);

```