import { createTheme } from '@mui/material/styles';

export const createThemes = (primary) => {
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: primary,
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: primary,
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  return  { lightTheme, darkTheme };
}
