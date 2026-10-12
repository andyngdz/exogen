const quote = (files) => files.map((file) => `"${file}"`).join(' ')

const config = {
  '*.{js,jsx,ts,tsx}': [() => 'tsc --noEmit', 'pnpm run lint'],
  '*.{js,jsx,ts,tsx,json,md}': 'pnpm run format',
  // The backend keeps its own Python toolchain; run it from backend/ so uv
  // picks up backend/pyproject.toml, ruff.toml and ty.toml.
  'backend/**/*.py': (files) => [
    `uv run --directory backend ruff format ${quote(files)}`,
    `uv run --directory backend ruff check --fix ${quote(files)}`,
    `uv run --directory backend ty check ${quote(files)}`
  ]
}

export default config
