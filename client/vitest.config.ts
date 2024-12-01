import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: "jsdom",
            exclude: [...configDefaults.exclude, "e2e/**"],
            root: fileURLToPath(new URL("./", import.meta.url)),
            coverage: {
                provider: "istanbul",
                reporter: ["text", "html", "json", "json-summary"],
                reportsDirectory: "./coverage",
                exclude: [
                    "node_modules/",
                    "e2e/",
                    "dist/",
                    "playwright-report/",
                    "**/*.spec.ts",
                    "**/*.config.ts",
                    "**/*.d.ts"
                ]
            }
        }
    })
);
