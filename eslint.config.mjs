import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores:["dist/**",".next/**",".vinext/**","build/**","components/ui/**","examples/**","vendor/**"] },
  ...tseslint.configs.recommended,
  { files:["**/*.{ts,tsx}"], rules:{"@typescript-eslint/no-explicit-any":"off","@typescript-eslint/no-unused-expressions":"off"} },
);
