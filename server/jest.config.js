module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["./jest.setup.ts"], // Optional
    testMatch: ["**/tests/**/*.test.ts"],
    moduleFileExtensions: ["ts", "js"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts"],
    coveragePathIgnorePatterns: [
        "aws",
        "node_modules",
        "src/bin",
        "src/_db/helpers.ts",
        "src/_db/client.ts",
        "src/_utils",
        "src/_types",
        "src/_config"
    ],
    coverageDirectory: "coverage",
    verbose: true
};
