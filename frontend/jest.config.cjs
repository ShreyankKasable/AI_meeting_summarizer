module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
    // Resolve absolute imports from `src` (e.g. "common/components/Button"),
    // mirroring the Vite alias convention.
    moduleDirectories: ["node_modules", "src"],
    testMatch: ["<rootDir>/src/**/*.test.{js,jsx}"],
    moduleNameMapper: {
        // apiUrls reads Vite's import.meta.env, which Jest can't run — use a stub.
        "^common/utils/apiUrls$": "<rootDir>/src/__test__/__mocks__/apiUrls.js",
    },
    transform: {
        "^.+\\.(js|jsx)$": [
            "babel-jest",
            {
                presets: [
                    ["@babel/preset-env", { targets: { node: "current" } }],
                    ["@babel/preset-react", { runtime: "automatic" }],
                ],
                plugins: ["@babel/plugin-syntax-import-meta", "babel-plugin-transform-import-meta"],
            },
        ],
    },
    clearMocks: true,
    collectCoverageFrom: [
        "src/**/*.{js,jsx}",
        "!src/main.jsx",
        "!src/**/*.test.{js,jsx}",
        "!src/__test__/**",
    ],
};
