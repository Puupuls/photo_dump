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
    Tooltip,
    Typography,
    useColorScheme,
    useMediaQuery
} from '@mui/material';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import PhotoAlbumOutlinedIcon from '@mui/icons-material/PhotoAlbumOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import {Link, NavLink, Route, Routes, useNavigate, useParams} from "react-router-dom";
import {useUiConfig} from "../../theme";
import {PhotosPage} from './photosPage';
import {
    AccountCircleOutlined,
    Brightness2Outlined,
    CloudUploadOutlined,
    LogoutOutlined,
    WbSunnyOutlined
} from "@mui/icons-material";
import {Session} from "../../controllers/Sessions";
import {Upload} from "../../controllers/Upload";
import {UploadTasks} from "./components/uploadTasks";
import {UsersPage} from "./usersPage";
import {UserPage} from "./userPage";
import {UserRole, UserRoleUtil} from "../../models/userRoleEnum";
import {useQuery} from "react-query";
import {UserType} from "../../models/userType";
import { AlbumsPage } from './albumsPage';
import {AlbumPage} from "./albumPage";


function MainPage() {
    const navigate = useNavigate();
    const { mode, setMode } = useColorScheme();
    const {uiConfig, setUiConfig} = useUiConfig();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const mobile = useMediaQuery('@media (max-width: 600px)');
    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
    const {data: user} = useQuery<UserType>(['users/me'])

    const location = window.location.pathname;
    let albumUUID: string|undefined = undefined;
    if (location.includes('/albums/')) {
        let parts = location.split('/');
        if(parts.length > 1) {
            albumUUID = parts[parts.length - 1];
        }
    }

    return (
        <Grid container direction={'column'} style={{ height: '100vh' }} flex={1}>
            <AppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{justifyContent: 'space-between', width: '100%'}}>
                    <Typography variant="h6">
                        <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>
                            {uiConfig.appName}
                        </Link>
                    </Typography>
                    <Box id={'extraNavbarButtons'} flex={1} display={'flex'} flexDirection={'row-reverse'}>
                        <Tooltip title="Account">
                            <IconButton
                                onClick={(e)=>setMenuAnchor(e.currentTarget)}
                                size="small"
                                aria-controls={menuAnchor ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={menuAnchor ? 'true' : undefined}
                            >
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    <AccountCircleOutlined/>
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Upload" sx={{mr:2}}>
                            <IconButton
                                onClick={(e)=>Upload.instance.selectAndUpload(albumUUID)}
                                size="small"
                                aria-controls={menuAnchor ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={menuAnchor ? 'true' : undefined}
                            >
                                <CloudUploadOutlined/>
                            </IconButton>
                        </Tooltip>
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
                            {user && UserRoleUtil.to_int(user.role) >= UserRoleUtil.to_int(UserRole.ADMIN) && (
                                <MenuItem onClick={()=>navigate('/users')}>
                                    <ListItemIcon>
                                        <GroupOutlinedIcon fontSize={"small"}/>
                                    </ListItemIcon>
                                    Users
                                </MenuItem>
                            )}
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
            <Grid container flex={1} sx={{width: '100%'}}>
                <SwipeableDrawer
                    variant="persistent"
                    anchor="left"
                    open={drawerOpen || !mobile}
                    onOpen={()=>{}}
                    onClose={()=>{}}
                >
                    <Toolbar /> {/* This offsets the height of the AppBar */}
                    <List
                        sx={{ width: 175 }}>
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
                <Box style={{ overflowY: 'auto', marginLeft: mobile ? 0 : 175, display:'flex', flex: 1, flexDirection: 'column' }}>
                    <Toolbar /> {/* This offsets the height of the AppBar */}
                    <Routes>
                        <Route path="/" element={<PhotosPage/>} />
                        <Route path="/albums" element={<AlbumsPage/>} />
                        <Route path="/albums/:albumUUID" element={<AlbumPage/>} />
                        <Route path="/users" element={<UsersPage/>} />
                        <Route path="/user/:userId" element={<UserPage/>} />

                        <Route path="*" element={<Box>404</Box>} />
                    </Routes>
                    <UploadTasks/>
                </Box>
            </Grid>
        </Grid>
    );
}

export default MainPage;