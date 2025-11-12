#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

function exitWithError(message) {
  console.error(`[env-example] ${message}`);
  process.exit(1);
}

function printHelp() {
  console.log(
    `env-example v${pkg.version}

Usage:
  env-example [options]
  env-example [input=.env] [output=.env.example]

Options:
  -i, --input <file>         .env file to read (repeat to merge multiple files)
  -o, --output <file>        Output file path (default: .env.example)
  -p, --placeholder <value>  Placeholder for every variable (default: empty)
      --keep-values          Copy real values instead of blank/placeholder
      --force                Overwrite output if it already exists
      --allow-duplicates     Keep duplicate keys instead of skipping them
  -q, --quiet                Only print errors
  -h, --help                 Show this help
  -v, --version              Show package version`
  );
}

function printVersion() {
  console.log(pkg.version);
}

function parseArguments(argv) {
  const options = {
    inputs: [],
    output: '.env.example',
    placeholder: '',
    keepValues: false,
    force: false,
    allowDuplicates: false,
    quiet: false
  };
  let outputProvided = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
    if (arg === '-v' || arg === '--version') {
      printVersion();
      process.exit(0);
    }

    if (arg === '-i' || arg === '--input') {
      const value = requireOptionValue(arg, argv[++i]);
      options.inputs.push(value);
      continue;
    }
    if (arg.startsWith('--input=')) {
      options.inputs.push(arg.split('=').slice(1).join('='));
      continue;
    }
    if (arg === '-o' || arg === '--output') {
      const value = requireOptionValue(arg, argv[++i]);
      options.output = value;
      outputProvided = true;
      continue;
    }
    if (arg.startsWith('--output=')) {
      options.output = arg.split('=').slice(1).join('=');
      outputProvided = true;
      continue;
    }
    if (arg === '-p' || arg === '--placeholder') {
      const value = requireOptionValue(arg, argv[++i]);
      options.placeholder = value;
      continue;
    }
    if (arg.startsWith('--placeholder=')) {
      options.placeholder = arg.split('=').slice(1).join('=');
      continue;
    }
    if (arg === '--keep-values') {
      options.keepValues = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--allow-duplicates') {
      options.allowDuplicates = true;
      continue;
    }
    if (arg === '-q' || arg === '--quiet') {
      options.quiet = true;
      continue;
    }

    if (!arg.startsWith('-')) {
      if (options.inputs.length === 0) {
        options.inputs.push(arg);
        continue;
      }
      if (!outputProvided) {
        options.output = arg;
        outputProvided = true;
        continue;
      }
    }

    exitWithError(`Unknown argument: ${arg}`);
  }

  options.inputs = options.inputs.filter(Boolean);
  if (options.inputs.length === 0) {
    options.inputs.push('.env');
  }

  return options;
}

function requireOptionValue(option, value) {
  if (value === undefined) {
    exitWithError(`Option ${option} requires a value.`);
  }
  return value;
}

function classifyLine(line) {
  if (line.trim() === '') {
    return { type: 'blank', raw: '' };
  }

  const trimmedStart = line.trimStart();
  if (trimmedStart.startsWith('#')) {
    return { type: 'comment', raw: line };
  }

  const eqIndex = findEquals(line);
  if (eqIndex === -1) {
    return { type: 'unknown', raw: line };
  }

  const key = line.slice(0, eqIndex).trim();
  if (!key) {
    return { type: 'unknown', raw: line };
  }

  const remainder = line.slice(eqIndex + 1);
  const { value, comment } = splitValueAndComment(remainder);
  const trimmedValue = value.trim();
  const quote = detectQuote(trimmedValue);

  return {
    type: 'entry',
    key,
    value: trimmedValue,
    comment,
    quote
  };
}

function findEquals(line) {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === '=' && !inSingle && !inDouble) {
      return i;
    }
  }

  return -1;
}

function splitValueAndComment(segment) {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < segment.length; i++) {
    const char = segment[i];
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === '#' && !inSingle && !inDouble) {
      return {
        value: segment.slice(0, i),
        comment: segment.slice(i).trim()
      };
    }
  }

  return { value: segment, comment: '' };
}

function detectQuote(value) {
  if (!value || value.length < 2) {
    return null;
  }
  const first = value[0];
  if ((first === '"' || first === "'") && value[value.length - 1] === first) {
    return first;
  }
  return null;
}

function buildValue(entry, options) {
  if (options.keepValues) {
    return entry.value;
  }

  if (!options.placeholder) {
    return '';
  }

  if (entry.quote) {
    return `${entry.quote}${options.placeholder}${entry.quote}`;
  }

  return options.placeholder;
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const seenKeys = new Set();
  const outputLines = [];
  let emittedEntries = 0;

  for (const inputPath of options.inputs) {
    const absoluteInput = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(absoluteInput)) {
      exitWithError(`Input file not found: ${inputPath}`);
    }

    const fileContents = fs.readFileSync(absoluteInput, 'utf8');
    const lines = fileContents.split(/\r?\n/);

    for (const line of lines) {
      const classified = classifyLine(line);

      if (classified.type === 'blank') {
        if (outputLines[outputLines.length - 1] !== '') {
          outputLines.push('');
        }
        continue;
      }

      if (classified.type === 'comment') {
        outputLines.push(classified.raw);
        continue;
      }

      if (classified.type === 'entry') {
        if (!options.allowDuplicates && seenKeys.has(classified.key)) {
          continue;
        }
        seenKeys.add(classified.key);
        const value = buildValue(classified, options);
        const suffix = classified.comment ? ` ${classified.comment}` : '';
        outputLines.push(`${classified.key}=${value}${suffix}`);
        emittedEntries += 1;
        continue;
      }

      outputLines.push(classified.raw ?? '');
    }
  }

  if (outputLines.length === 0) {
    exitWithError('Nothing to write. Make sure the input file contains variables.');
  }

  const finalContent = outputLines.join('\n').replace(/\n{3,}/g, '\n\n');
  const outputPath = path.resolve(process.cwd(), options.output);

  if (fs.existsSync(outputPath) && !options.force) {
    exitWithError(
      `Output file "${options.output}" already exists. Use --force to overwrite.`
    );
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, finalContent.endsWith('\n') ? finalContent : `${finalContent}\n`);

  if (!options.quiet) {
    console.log(
      `[env-example] Created ${path.relative(process.cwd(), outputPath)} with ${emittedEntries} entr${emittedEntries === 1 ? 'y' : 'ies'}.`
    );
  }
}

try {
  main();
} catch (error) {
  exitWithError(error.message || String(error));
}
