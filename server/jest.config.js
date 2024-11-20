module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./jest.setup.ts"], // Optional
    testMatch: ["**/tests/**/*.test.ts"],
    moduleFileExtensions: ["ts", "js"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts"],
    coveragePathIgnorePatterns: [
        "aws",
        "node_modules",
        "src/bin",
        "src/_db/helpers.ts",
        "src/_db/client.ts"
    ],
    coverageDirectory: "coverage",
    verbose: true
};
