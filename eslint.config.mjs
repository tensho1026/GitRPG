import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // 未使用のコード検出（赤色エラー表示）
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // 到達不可能なコード検出（赤色エラー表示）
      "no-unreachable": "error",

      // 使用されていない式検出（赤色エラー表示）
      "no-unused-expressions": "error",

      // 空のブロック検出（赤色エラー表示）
      "no-empty": "error",

      // デバッグ用のconsole.logを警告（黄色）
      "no-console": "warn",
    },
  },
  {
    ignores: [
      "src/generated/**/*",
      "node_modules/**/*",
      ".next/**/*",
      "build/**/*",
      "dist/**/*",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "public/**/*",
    ],
  },
];

export default eslintConfig;
