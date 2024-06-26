import React, {useEffect, useMemo} from 'react';
import {CssBaseline, CssVarsProvider} from "@mui/material";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from "./pages/auth/login";
import {createTheme, useUiConfig} from "./theme";
import MainPage from "./pages/site/site";
import {Session} from "./controllers/Sessions";
import {QueryClientProvider} from "react-query";
import {queryClient} from "./controllers/API";

function App() {

  useEffect(() => {
    const token = Session.instance.getToken()
    if (!token && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  const {uiConfig} = useUiConfig();
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
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/*"
                element={<MainPage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </CssVarsProvider>
  );
}

export default App;