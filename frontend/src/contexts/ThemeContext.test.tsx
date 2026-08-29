import { describe, it, expect } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeContext", () => {
  it("applies dark theme by default on <html>", () => {
    render(<ThemeProvider><span>x</span></ThemeProvider>);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("toggle switches dark <-> light and updates <html> class", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("dark");

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists the theme to localStorage under knowrag.theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme("light"));
    expect(localStorage.getItem("knowrag.theme")).toBe("light");
    act(() => result.current.setTheme("dark"));
    expect(localStorage.getItem("knowrag.theme")).toBe("dark");
  });

  it("restores the stored theme on mount", () => {
    localStorage.setItem("knowrag.theme", "light");
    renderHook(() => useTheme(), { wrapper });
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});
