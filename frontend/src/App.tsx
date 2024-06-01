import React, {useEffect, useMemo, useState} from 'react';
import {CssBaseline, CssVarsProvider} from "@mui/material";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from "./pages/auth/login";
import {createTheme, defaultUiConfig, useUiConfig} from "./theme";
import MainPage from "./pages/site/site";
import {Session} from "./controllers/Sessions";
import UiConfig from "./models/uiConfig";

function App() {

  useEffect(() => {
    const token = Session.instance.getToken()
    if (!token && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  const {uiConfig, setUiConfig} = useUiConfig();
  useEffect(() => {
    window.document.title = uiConfig.appName;
  }, [uiConfig.appName]);
  const theme = useMemo(() => createTheme(uiConfig), [uiConfig])
  return (
    <CssVarsProvider
        theme={theme}
        defaultMode={'system'}
        disableTransitionOnChange={false}
        modeStorageKey={'theme'}
        attribute={'class'}
    >
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
              path="/*"
              element={<MainPage />} />
        </Routes>
      </Router>
    </CssVarsProvider>
  );
}

export default App;