import {experimental_extendTheme as extendTheme} from '@mui/material/styles';
import UiConfig from "./models/uiConfig";
import * as colors from "@mui/material/colors";
import React from "react";

export const defaultUiConfig: UiConfig = {
    primaryColor: colors.teal[500],
    secondaryColor: colors.amber[500],
    appName: 'PhotoDump',
}

export const useUiConfig = () => {
    const [uiConfig, setUiConfig] = React.useState<UiConfig>(defaultUiConfig);
    return {uiConfig, setUiConfig}
}

export const createTheme = (uiConfig: UiConfig) => {
    return extendTheme({
        cssVarPrefix: '',
        colorSchemes: {
            light: {
                palette: {
                    primary: {
                        main: uiConfig.primaryColor
                    },
                    secondary: {
                        main: uiConfig.secondaryColor
                    }
                }
            },
            dark: {
                palette: {
                    primary: {
                        main: uiConfig.primaryColor
                    },
                    secondary: {
                        main: uiConfig.secondaryColor
                    }
                }
            }
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: ({theme}) => ({
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                    }),
                },
                defaultProps: {
                    elevation: 1,
                }
            },
            MuiToolbar: {
                styleOverrides: {
                    root: ({theme}) => ({
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                    }),
                },
            },
        }
    })
}