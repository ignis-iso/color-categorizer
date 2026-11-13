import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativo: funciona em qualquer subcaminho do GitHub Pages.
export default defineConfig({ base: "./", plugins: [react()] });
