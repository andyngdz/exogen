const config = {
  '*.{js,jsx,ts,tsx}': [() => 'tsc --noEmit', 'pnpm run lint'],
  '*.{js,jsx,ts,tsx,json,md}': 'pnpm run format'
}

export default config
