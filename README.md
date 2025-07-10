# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 🚀 Features

- ⚡️ **Vite** - Next generation frontend tooling
- ⚛️ **React 19** - A JavaScript library for building user interfaces
- 🎯 **TypeScript** - JavaScript with syntax for types
- 📏 **ESLint** - Pluggable JavaScript linter
- 💅 **Prettier** - Opinionated code formatter
- 🐶 **Husky** - Git hooks made easy
- 🚫 **lint-staged** - Run linters on git staged files
- 📝 **Commitlint** - Lint commit messages

## 🛠️ Development Tools

### Code Quality

This project is configured with several tools to maintain code quality:

- **ESLint**: Configured with React, TypeScript, and Prettier integration
- **Prettier**: Code formatting with consistent style
- **Husky**: Git hooks for automated quality checks
- **lint-staged**: Runs linters only on staged files for faster commits
- **Commitlint**: Ensures conventional commit messages

### Git Hooks

The following git hooks are configured:

- **pre-commit**: Runs ESLint and Prettier on staged files
- **commit-msg**: Validates commit message format

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted
```

### Commit Message Format

This project follows the [Conventional Commits](https://conventionalcommits.org/) specification:

```text
type(scope?): description

Examples:
feat: add new user dashboard
fix: resolve login validation issue
docs: update API documentation
style: fix code formatting
refactor: reorganize utility functions
test: add unit tests for auth service
chore: update dependencies
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
