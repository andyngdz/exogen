# LocalAI

> A desktop application for generating AI images locally using Stable Diffusion models from HuggingFace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<!-- Add your screenshot here -->
<!-- ![LocalAI Dashboard](path/to/screenshot.png) -->

## About

LocalAI is a privacy-focused desktop application that lets you generate AI images completely offline on your own machine. Download models from HuggingFace, configure generation parameters, and create stunning images without sending your data to the cloud.

**Why LocalAI?**

- 🔒 **100% Private** - Everything runs locally, your prompts and images never leave your computer
- 💰 **Free Forever** - No API costs, no subscriptions, completely free and open-source
- 🚀 **Powerful** - Support for various Stable Diffusion models from HuggingFace
- ⚡ **Fast** - GPU acceleration support for lightning-fast generation
- 🎨 **Flexible** - Advanced controls for fine-tuning your generations

## Features

- 🎨 **AI Image Generation** - Create images from text prompts using Stable Diffusion models
- 🤖 **Smart Model Recommendations** - Get model suggestions based on your hardware capabilities
- 🔍 **HuggingFace Integration** - Browse and download models directly from HuggingFace
- ⚙️ **Advanced Configuration**
  - Sampling methods (Euler, DPM++, etc.)
  - Custom styles and presets
  - Output format control (PNG, JPEG, WebP)
  - Seed control for reproducible results
  - Batch generation support
- 📊 **Automatic GPU Detection** - Detects your GPU and optimizes settings automatically
- 💾 **Memory Management** - Smart memory allocation based on available VRAM
- 📜 **Generation History** - View past generations and reuse successful configurations
- 🖥️ **Fully Offline** - Works completely offline after initial model download
- 🔒 **Privacy-Focused** - All processing happens locally on your machine

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS 4
- **Desktop**: Electron 38
- **Backend**: Python FastAPI
- **State Management**: Zustand, TanStack Query
- **UI Components**: HeroUI, Framer Motion
- **Real-time Communication**: Socket.io
- **Testing**: Vitest, React Testing Library

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **Python 3.11** (Required - other Python versions may not work)
- **pnpm** (version 8)
- **Git**

### System Requirements

- **RAM**: 8GB minimum (16GB recommended for larger models)
- **GPU**: Recommended for faster generation (CPU mode available but slower)
- **Storage**: 30GB+ free disk space for models
- **OS**: Windows, macOS, or Linux

## Installation

```bash
# Clone the repository
git clone https://github.com/andyngdz/localai.git
cd localai

# Install dependencies
pnpm install

# Run the desktop application
pnpm run desktop
```

The application will:

1. Set up the Python backend automatically
2. Install required Python dependencies
3. Launch the Electron desktop app
4. Open the application window

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

```bash
# Start development with hot reload
pnpm run desktop

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

## Project Structure

```
localai/
├── src/
│   ├── features/       # Feature modules (feature-first architecture)
│   │   ├── generators/     # Image generation
│   │   ├── model-search/   # Model browsing
│   │   ├── histories/      # Generation history
│   │   └── settings/       # App settings
│   ├── app/           # Next.js app router pages
│   ├── types/         # TypeScript type definitions
│   ├── sockets/       # Socket.io real-time communication
│   └── services/      # API services
├── electron/          # Electron main process & preload scripts
├── scripts/           # Build & backend management scripts
│   └── backend/       # Python backend setup scripts
├── .github/           # GitHub Actions CI/CD workflows
└── types/             # Global TypeScript types
```

### Architecture

LocalAI follows a **feature-first architecture**:

- Each feature is self-contained in `src/features/`
- Features contain `presentations/` (React components) and `states/` (state management)
- Shared utilities live in `src/cores/`
- Electron IPC bridges frontend and backend via `window.electronAPI`
- Real-time updates via Socket.io for download progress and generation status

## Testing

LocalAI uses **Vitest** and **React Testing Library** for comprehensive testing.

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

### Release Process

This project uses **semantic-release** for automated versioning and releases. See [RELEASE.md](RELEASE.md) for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Desktop powered by [Electron](https://www.electronjs.org/)
- Models from [HuggingFace](https://huggingface.co/)
- UI components from [HeroUI](https://www.heroui.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/andyngdz/localai/issues) page
2. Read the [RELEASE.md](RELEASE.md) for release information
3. Open a new issue with detailed information

---

⭐ **Star this repository** if you find it helpful!
