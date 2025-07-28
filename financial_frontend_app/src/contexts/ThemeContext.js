import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const darkMediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || (darkMediaQuery && darkMediaQuery.matches ? "dark" : "light")
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(t => (t === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
