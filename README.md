# ExoGen

> A desktop application for generating AI images locally using Stable Diffusion models from HuggingFace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

https://github.com/user-attachments/assets/909182ce-e921-4b94-a653-add58d5717d9

## About

ExoGen is a privacy-focused desktop application that lets you generate AI images completely offline on your own machine. Download models from HuggingFace, configure generation parameters, and create stunning images without sending your data to the cloud.

**Why ExoGen?**

- 🔒 **100% Private** - Everything runs locally, your prompts and images never leave your computer
- 💰 **Free Forever** - No API costs, no subscriptions, completely free and open-source
- 🚀 **Powerful** - Support for various Stable Diffusion models from HuggingFace
- ⚡ **Fast** - GPU acceleration support for lightning-fast generation
- 🎨 **Flexible** - Advanced controls for fine-tuning your generations

## Features

- 🎨 **AI Image Generation** - Create images from text prompts using Stable Diffusion models
- 🤖 **Smart Model Recommendations** - Get model suggestions based on your hardware capabilities
- 🔍 **HuggingFace Integration** - Browse and download models directly from HuggingFace
- 🎭 **LoRA Support** - Apply LoRA models for fine-tuned styles and characters with adjustable weights
- 🔎 **High-Resolution Upscaling** - Enhance images with Hires.fix using AI upscalers (Real-ESRGAN) or traditional methods
- 📊 **Real-Time Progress** - See generation phases and model loading progress in real-time
- 🎨 **Styles System** - Search, filter, and apply style presets with automatic defaults for new users
- 📜 **Generation History** - Browse past generations in fullscreen photoview with navigation
- 📝 **Backend Logs** - Stream and monitor backend logs in real-time
- 💾 **Memory Configuration** - Configure GPU and RAM memory allocation with visual previews
- 🔄 **Automatic Updates** - Get notified and install updates seamlessly
- ⚙️ **Advanced Configuration**
  - Sampling methods (Euler, DPM++, etc.)
  - Seed control for reproducible results
  - Batch generation support
- 🖥️ **Fully Offline** - Works completely offline after initial model download
- 🔒 **Privacy-Focused** - All processing happens locally on your machine

## Prerequisites

Before you begin, ensure you have the following installed:

- **CUDA** - Required for Nvidia GPU acceleration ([Download](https://developer.nvidia.com/cuda-downloads))

### System Requirements

- **RAM**: 8GB minimum (16GB recommended for larger models)
- **GPU**: Recommended for faster generation (CPU mode available but slower)
- **Storage**: 30GB+ free disk space for models
- **OS**: Windows, macOS, or Linux

## Installation

1. Download the latest release for your platform from the [Releases](https://github.com/andyngdz/exogen/releases) page:
   - Windows: `.exe` installer
   - macOS: `.dmg` installer
   - Linux: `.AppImage`, `.deb`, or `.rpm` package

2. Run the installer and launch ExoGen

The application will automatically:

1. Copy its bundled Python backend into the app data folder, keeping downloaded models, history and generated images
2. Install required Python dependencies with uv
3. Open the application window

## Development

### Available Scripts

- **`pnpm run dev`** - Start Next.js development server with Turbopack
- **`pnpm run desktop`** - Run full desktop app (Next.js + Electron + Python backend)
- **`pnpm run desktop:local`** - Run frontend only (for Python backend development)
- **`pnpm test`** - Run test suite
- **`pnpm run type-check`** - Run TypeScript type checking
- **`pnpm run lint`** - Run ESLint
- **`pnpm run format`** - Format code with Prettier
- **`pnpm run build`** - Build for production distribution

### Development Workflow

The Python backend lives in `backend/` and runs as its own process. `pnpm run desktop` copies `backend/` into the app data folder on every start and runs it there. To work on the backend itself, run it from `backend/` and start the frontend without it:

```bash
# Start the backend (in backend/)
cd backend
uv sync
uv run uvicorn main:app --host 127.0.0.1 --port 8000

# Start frontend development (in the repository root)
pnpm run desktop:local

# Run tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm run test:coverage

# Check code quality
pnpm run type-check
pnpm run lint
pnpm run format
```

## Building for Production

```bash
# Build the application
pnpm run build
```

The build output will be in the `dist/` directory:

- Windows: `.exe` installer
- macOS: `.dmg` installer
- Linux: `.AppImage`, `.deb`, `.rpm` packages

## Testing

ExoGen uses **Vitest** and **React Testing Library** for comprehensive testing.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage report
pnpm run test:coverage

# Run specific test file
pnpm test -- path/to/test.tsx
```

Tests are co-located with source files in `__tests__/` directories.

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feat/amazing-feature`)
3. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
4. **Push to your branch** (`git push origin feat/amazing-feature`)
5. **Open a Pull Request**

### Commit Message Format

```bash
feat(generators): add new sampling method
fix(model-search): resolve download timeout issue
docs: update installation instructions
```

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Desktop powered by [Electron](https://www.electronjs.org/)
- Models from [HuggingFace](https://huggingface.co/)
- UI components from [HeroUI](https://www.heroui.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/andyngdz/exogen/issues) page
2. Open a new issue with detailed information

---

⭐ **Star this repository** if you find it helpful!
