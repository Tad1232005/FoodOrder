import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext =
  createContext();

export function ThemeProvider({
  children,
}) {

  const getInitialTheme = () => {

    // tránh lỗi SSR
    if (typeof window === "undefined")
      return "light";

    const savedTheme =
      localStorage.getItem(
        "admin.theme"
      );

    if (
      savedTheme === "dark" ||
      savedTheme === "light"
    ) {
      return savedTheme;
    }

    const prefersDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    return prefersDark
      ? "dark"
      : "light";
  };

  const [theme, setTheme] =
    useState(getInitialTheme);

  const toggleTheme = () => {

    setTheme((prev) =>
      prev === "light"
        ? "dark"
        : "light"
    );
  };

  // lưu localStorage
  useEffect(() => {

    localStorage.setItem(
      "admin.theme",
      theme
    );

  }, [theme]);

  // set html attr
  useEffect(() => {

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    // bootstrap compatible
    document.documentElement.setAttribute(
      "data-bs-theme",
      theme
    );

    // body class
    document.body.className =
      theme;

  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {

  const context =
    useContext(ThemeContext);

  if (!context) {

    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  }

  return context;
}