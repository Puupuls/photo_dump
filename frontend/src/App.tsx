import React, {useEffect, useState} from 'react';
import {CssBaseline, ThemeProvider} from "@mui/material";
import {createThemes} from "./theme";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from "./pages/auth/login";

function App() {
  const [darkMode, setDarkMode] = useState(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [primaryColor, setPrimaryColor] = useState('#19d276')
  const {darkTheme, lightTheme} = createThemes(primaryColor);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const changeHandler = () => setDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', changeHandler);
    return () => mediaQuery.removeEventListener('change', changeHandler);
  }, []);

  const theme = darkMode ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;