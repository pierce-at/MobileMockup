import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

import { resetMockRepositoryState } from "@/lib/data/repository";

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "blob:mock";
}

if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = () => {};
}

beforeEach(() => {
  resetMockRepositoryState();
  window.localStorage.clear();
});
