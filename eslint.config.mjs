import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
      'no-console': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/no-unescaped-entities': 'off',
      // New React Compiler-oriented rules in eslint-plugin-react-hooks 7.x
      // (pulled in by this upgrade) — disabled for consistency with the
      // hooks-strictness rules already off above.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/incompatible-library': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'next-env.d.ts',
    'node_modules/**',
    '*.config.js',
    '*.config.mjs',
    '*.config.ts',
    // next lint never scanned tests/ (outside its default app/components/lib
    // dirs) — keep that scope now that `eslint .` would otherwise lint
    // everything, including test mocks not meant to follow app conventions.
    'tests/**',
  ]),
]);

export default eslintConfig;
