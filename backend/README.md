# Exogen Backend

A FastAPI-based backend server for local AI image generation, supporting Stable Diffusion models (SD 1.5, SDXL, SD3), LoRA adapters, AI upscaling, and real-time generation updates via WebSocket.

## Features

### Image Generation
- **Text-to-Image**: Generate images with customizable parameters (steps, CFG scale, dimensions, seed)
- **Image-to-Image**: Transform existing images with strength and resize controls
- **High-Resolution Fix**: Two-pass generation with upscale and refinement
- **18 Samplers**: Euler A, DPM++ 2M Karras, UniPC, LCM, and more
- **LoRA Support**: Apply 1-5 LoRAs per generation with individual weights and CLIP skip

### Upscaling
- **AI Upscalers** (Real-ESRGAN): x2plus, x4plus, x4plus_anime
- **Traditional Upscalers**: Lanczos, Bicubic, Bilinear, Nearest

### Model Management
- **Download Models**: From Hugging Face Hub with progress tracking
- **Smart Filtering**: Only downloads required model components
- **Load/Unload**: With cancellation support and state tracking
- **Recommendations**: Hardware-based model suggestions
- **LoRA Management**: Upload, list, and manage LoRA files

### Safety & Quality
- **NSFW Detection**: Works with SD 1.5, SDXL, and SD3 models
- **Configurable**: Toggle safety checker via API

### Hardware & Performance
- **Multi-Platform**: CUDA (NVIDIA), MPS (Apple Silicon), CPU fallback
- **Multi-GPU**: Device selection for systems with multiple GPUs
- **Memory Management**: Configurable GPU/RAM scale factors with OOM prevention
- **Real-time Monitoring**: GPU/CPU usage and memory tracking

### Additional Features
- **Style System**: 85+ style categories with prompt templates
- **Generation History**: Track and retrieve past generations
- **Real-time Updates**: WebSocket events for progress, phases, and previews
- **Configuration API**: Manage upscalers, safety settings, memory, and device selection
- **SQLite Database**: Persistent storage with Alembic migrations

## Requirements

- Python 3.11+
- CUDA-compatible GPU recommended (NVIDIA) or Apple Silicon (MPS)
- 8GB+ RAM (16GB+ recommended for larger models)
- 50GB+ disk space for models (some models can exceed 50GB)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/andyngdz/exogen_backend.git
   cd exogen_backend
   ```

2. **Install uv** (Python package manager)

   ```bash
   # Linux/macOS
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Windows
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

   More installation methods: [uv documentation](https://docs.astral.sh/uv/getting-started/installation/)

3. **Install dependencies**

   ```bash
   uv sync
   ```

## Running the Server

> **Note:** Database migrations run automatically on startup. No manual database initialization is required.

**Development mode** (with auto-reload):

```bash
uv run uvicorn main:app --reload
```

**Production mode**:

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## Development

### Running tests

```bash
uv run pytest                    # All tests
uv run pytest tests/path/to/test.py  # Single file
uv run pytest -q --cov=app       # With coverage
```

### Code quality

```bash
uv run ruff format               # Format code
uv run ruff check --fix          # Lint and auto-fix
uv run ty check                  # Type checking
```

Pre-commit hooks run these automatically on commit.

### Database migrations

Migrations run automatically on startup. These commands are for development only:

```bash
uv run alembic revision --autogenerate -m "description"  # Create new migration
uv run alembic downgrade -1                              # Rollback last migration
```

## Configuration

Configuration is managed through `config.py` and the `/config` API endpoint:

| Setting | Description |
|---------|-------------|
| `CACHE_FOLDER` | Model cache directory (default: `./.cache`) |
| `GENERATED_IMAGES_FOLDER` | Output directory for generated images |
| `STATIC_FOLDER` | Static files directory |

Runtime settings (via `/config` API):
- **Safety Check**: Toggle NSFW detection
- **GPU Scale Factor**: Memory allocation for GPU (0.1-1.0)
- **RAM Scale Factor**: Memory allocation for RAM (0.1-1.0)
- **Device Index**: GPU selection for multi-GPU systems

## Contributing

1. Follow the coding style in `ruff.toml` (tabs, single quotes, 120 char lines)
2. Use conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
3. Write tests for new features
4. Ensure tests pass and code is linted before submitting PRs

See `docs/` for detailed development guidelines.

## Feedback & Issues

We welcome contributions and feedback! If you encounter any issues or have suggestions:

- **Report bugs**: [Open an issue](https://github.com/andyngdz/exogen_backend/issues)
- **Feature requests**: [Start a discussion](https://github.com/andyngdz/exogen_backend/discussions)
- **Contribute**: Fork the repo and submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [Hugging Face Diffusers](https://huggingface.co/docs/diffusers) - Diffusion models
- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) - AI upscaling
- [python-socketio](https://python-socketio.readthedocs.io/) - Real-time communication
