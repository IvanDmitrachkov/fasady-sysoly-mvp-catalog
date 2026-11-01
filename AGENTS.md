<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Проект: «Фасады Сысолы», сайт-каталог (MVP)

Это **MVP**: прототип для показа заказчику, не готовый к публикации продукт. Данные предварительные, фото на сценах без подтверждённых прав.

Перед работой прочитайте [docs/README.md](docs/README.md) (индекс) и [docs/mvp.md](docs/mvp.md) (что входит, что нет, ограничения). Остальное по задаче:

- 3D-фасады и профили фрезеровок: [docs/facade-3d.md](docs/facade-3d.md)
- Примерочная кухни и маски: [docs/kitchen-tryon.md](docs/kitchen-tryon.md)
- Структура и стек: [docs/architecture.md](docs/architecture.md)
- Принятые решения: [docs/decisions.md](docs/decisions.md)
- Данные от заказчика и права на изображения: [docs/data-and-assets.md](docs/data-and-assets.md)
- Запуск и проверки: [docs/development.md](docs/development.md)

Правила:

- Меняя поведение сайта, обновляйте соответствующий документ в `docs/`.
- Не выдавайте приблизительные данные (размеры профилей, HEX-цвета, тексты карточек) за окончательные.
- Перед сдачей: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
