# env-example-cli

[![npm version](https://img.shields.io/npm/v/env-example-cli.svg)](https://www.npmjs.com/package/env-example-cli)
[![npm downloads](https://img.shields.io/npm/dt/env-example-cli.svg)](https://www.npmjs.com/package/env-example-cli)
[![license](https://img.shields.io/github/license/OneSilverFinger/env-example-cli)](LICENSE)

[English](#english-version) • [Русский](#русская-версия)

## English Version

### Overview
`env-example-cli` turns real `.env` files into safe `.env.example` templates. It keeps comments and spacing intact, merges several inputs, supports placeholders, and protects existing files from accidental overwrites.

### Requirements
- Node.js 16+ (tested on 18/20)

### Quick Start
```bash
# show help
node bin/env-example.js --help

# default run: ./.env -> ./.env.example
node bin/env-example.js

# global install for PATH access
npm install -g .
env-example --help
```

### Typical Scenarios
```bash
# 1. Plain anonymized export
env-example

# 2. Custom placeholder for every secret
env-example --placeholder CHANGE_ME

# 3. Keep real values (e.g., build artifacts for deploy)
env-example --keep-values

# 4. Merge multiple sources into a custom file and force overwrite
env-example \
  --input .env \
  --input .env.local \
  --output config/sample.env \
  --force
```

### CLI Options
| Flag | Description |
| --- | --- |
| `-i, --input <file>` | Input `.env` file (repeatable). Default: `.env`. |
| `-o, --output <file>` | Output path. Default: `.env.example`. |
| `-p, --placeholder <value>` | Placeholder injected for every value. |
| `--keep-values` | Preserve real values instead of placeholders. |
| `--force` | Overwrite the output file if it exists. |
| `--allow-duplicates` | Keep duplicate keys when merging inputs. |
| `-q, --quiet` | Only print errors. |
| `-h, --help` / `-v, --version` | Show help or version. |

### How It Works
1. Reads every declared `.env` file sequentially.
2. Preserves comments, blank lines, and quoting.
3. Swaps values for placeholders (or keeps them) while keeping inline comments intact.
4. Skips duplicate keys unless `--allow-duplicates` is set.
5. Writes to the requested path (creating directories when necessary).

### Tips
- Add an npm script (e.g., `env:example`) so the team can run `npm run env:example`.
- Run `env-example --placeholder TBD` before committing to keep templates current.
- Combine `--keep-values --output ci.env` to produce env files for CI/CD systems.

## Русская версия

### Обзор
`env-example-cli` превращает реальные `.env` файлы в безопасные `.env.example`. Скрипт сохраняет комментарии и форматирование, умеет объединять несколько источников, поддерживает плейсхолдеры и защищает готовый файл от случайной перезаписи.

### Требования
- Node.js 16+ (проверено на 18/20)

### Быстрый старт
```bash
# показать справку
node bin/env-example.js --help

# базовый запуск: ./.env -> ./.env.example
node bin/env-example.js

# глобальная установка (чтобы env-example был в PATH)
npm install -g .
env-example --help
```

### Основные сценарии
```bash
# 1. Базовый запуск
env-example

# 2. Указать плейсхолдер
env-example --placeholder CHANGE_ME

# 3. Сохранить реальные значения (например, для деплоя)
env-example --keep-values

# 4. Несколько источников + другой выход + принудительное перезаписывание
env-example \
  --input .env \
  --input .env.local \
  --output config/sample.env \
  --force
```

### Опции
| Опция | Описание |
| --- | --- |
| `-i, --input <file>` | Конкретный `.env` (можно повторять). По умолчанию `.env`. |
| `-o, --output <file>` | Файл результата. По умолчанию `.env.example`. |
| `-p, --placeholder <value>` | Значение вместо секретов. По умолчанию пустая строка. |
| `--keep-values` | Не затирать значения. |
| `--force` | Перезаписать файл, если он уже существует. |
| `--allow-duplicates` | Не удалять дубликаты ключей при слиянии. |
| `-q, --quiet` | Только ошибки. |
| `-h, --help` / `-v, --version` | Справка и версия. |

### Как это работает
1. Скрипт поочередно читает каждый указанный `.env`.
2. Комментарии и пустые строки сохраняются.
3. Значения заменяются плейсхолдером (или остаются при `--keep-values`), при этом сохраняются кавычки и комментарии.
4. Дубликаты ключей пропускаются, если не указан `--allow-duplicates`.
5. Результат записывается в выбранный файл, директории создаются автоматически.

### Полезные советы
- Добавьте команду в `package.json`, чтобы запускать `npm run env:example`.
- Используйте `env-example --placeholder TBD` перед коммитом для актуального `.env.example`.
- Для CI/CD можно комбинировать `--keep-values` и `--output ci.env`, чтобы получить полный env-файл.

Приятной автоматизации!
