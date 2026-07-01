import "@testing-library/jest-dom";

// jsdom doesn't implement object URLs — stub them.
if (typeof URL.createObjectURL === "undefined") {
    URL.createObjectURL = jest.fn(() => "blob:mock-url");
}
if (typeof URL.revokeObjectURL === "undefined") {
    URL.revokeObjectURL = jest.fn();
}

beforeEach(() => {
    localStorage.clear();
});
