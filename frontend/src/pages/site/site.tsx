import React from 'react';
import {
    AppBar,
    Avatar,
    Box,
    Grid,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    SwipeableDrawer,
    Toolbar,
    Typography,
    useColorScheme,
    useMediaQuery
} from '@mui/material';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import PhotoAlbumOutlinedIcon from '@mui/icons-material/PhotoAlbumOutlined';
import {NavLink, Route, Routes, useNavigate} from "react-router-dom";
import {useUiConfig} from "../../theme";
import {PhotosPage} from './photos';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import {Brightness2Outlined, LogoutOutlined, WbSunnyOutlined} from "@mui/icons-material";
import {Session} from "../../controllers/Sessions";


function MainPage() {
    const navigate = useNavigate();
    const { mode, setMode } = useColorScheme();
    const {uiConfig, setUiConfig} = useUiConfig();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const mobile = useMediaQuery('@media (max-width: 600px)');
    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

    return (
        <Grid container direction={'column'} style={{ height: '100vh' }}>
            <AppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{justifyContent: 'space-between', width: '100%'}}>
                    <Typography variant="h6">
                        {uiConfig.appName}
                    </Typography>
                    <Box>
                        <IconButton
                            onClick={(e)=>setMenuAnchor(e.currentTarget)}
                            size="small"
                            aria-controls={menuAnchor ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuAnchor ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 32, height: 32 }}>
                                <AccountCircleOutlinedIcon/>
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={menuAnchor}
                            id="account-menu"
                            open={!!menuAnchor}
                            onClose={()=>setMenuAnchor(null)}
                            onClick={()=>setMenuAnchor(null)}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={()=>setMode(mode=='dark'? 'light' : 'dark')}>
                                <ListItemIcon>
                                {mode=='dark'?  <WbSunnyOutlined fontSize={"small"}/> : <Brightness2Outlined fontSize={"small"}/>}
                                </ListItemIcon>
                                {mode=='dark'? 'Light Mode' : 'Dark Mode'}
                            </MenuItem>
                            <MenuItem onClick={()=>{Session.instance.logout(); window.location.reload()}}>
                                <ListItemIcon>
                                    <LogoutOutlined fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Grid container>
                <Grid xs={false} sm={4}>
                    <SwipeableDrawer
                        variant="persistent"
                        anchor="left"
                        open={drawerOpen || !mobile}
                        onOpen={()=>{}}
                        onClose={()=>{}}
                    >
                        <Toolbar /> {/* This offsets the height of the AppBar */}
                        <List
                            sx={{ minWidth: 175 }}>
                            <ListItemButton
                                to={'/'}
                                component={NavLink}
                                sx={(theme)=>({
                                    '&.active': {
                                        backgroundColor: theme.palette.action.selected,
                                        color: theme.palette.primary.main,
                                        '& .MuiListItemIcon-root': {
                                            color: theme.palette.secondary.main
                                        }
                                    },
                                })}>
                                <ListItemIcon>
                                    <InsertPhotoOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText primary="Photos" />
                            </ListItemButton>
                            <ListItemButton
                                to={'/albums'}
                                component={NavLink}
                                sx={(theme)=>({
                                    '&.active': {
                                        backgroundColor: theme.palette.action.selected,
                                        color: theme.palette.primary.main,
                                        '& .MuiListItemIcon-root': {
                                            color: theme.palette.secondary.main
                                        }
                                    }
                                })}>
                                <ListItemIcon>
                                    <PhotoAlbumOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText primary="Albums" />
                            </ListItemButton>
                        </List>
                    </SwipeableDrawer>
                </Grid>
                <Grid xs={12} sm={8} style={{ overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<PhotosPage/>} />
                    </Routes>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default MainPage;