# QVAC Pocket Translator

A lightweight English ↔ Spanish translator powered by the Tether QVAC SDK.

The application uses QVAC's local translation capability with Bergamot models. It provides a simple browser interface for translating text, switching languages, copying results, and keeping a small local translation history.

## Features

- English → Spanish translation
- Spanish → English translation
- Local QVAC inference
- Language swap button
- Copy translated text
- Character counter
- Recent translation history
- Responsive web interface
- No OpenAI or Anthropic API required

## QVAC SDK

This project uses:

- `@qvac/sdk` version `0.20.0`
- QVAC `loadModel()`
- QVAC `translate()`
- QVAC `unloadModel()`
- Bergamot translation models
- Translation engine: `Bergamot`

The translation models are loaded locally through QVAC. The first model use may require model files to be obtained before inference can run locally.

## Requirements

- Node.js 22.17 or newer
- npm 10.9 or newer
- A computer capable of running the QVAC SDK

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/qvac-pocket-translator.git
cd qvac-pocket-translator