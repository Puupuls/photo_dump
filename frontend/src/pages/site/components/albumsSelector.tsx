import React, {useEffect} from "react";
import "yet-another-react-lightbox/styles.css";
import {useQuery} from "react-query";
import {AlbumType} from "../../../models/albumType";
import {Box, IconButton, Modal, Paper, Typography} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {baseURL} from "../../../controllers/API";

export const AlbumsSelector = (
    {
        onSelect,
        onClose,
        isOpen
    }:{
        onSelect: (album: AlbumType|null) => void
        onClose: () => void
        isOpen: boolean
    }
) => {
    const {data: albums, isLoading, refetch} = useQuery<AlbumType[]>('albums');

    useEffect(() => {
        if(isOpen){
            refetch()
        }
    }, [isOpen]);

    return <Modal
        open={isOpen}
        onClose={onClose}
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Paper sx={{width: 340, minHeight: 90, maxHeight: 500}}>
            <Box p={2} display={'flex'} flex={1} alignItems={'center'}>
                <Typography variant={"body1"}>Add to</Typography>
                <IconButton onClick={onClose} sx={{marginLeft: 'auto'}}>
                    <CloseIcon/>
                </IconButton>
            </Box>
            <Box sx={(theme)=>({
                cursor: 'pointer',
                p:2,
                display:'flex',
                alignItems: 'center',
                '&:hover':{
                    backgroundColor:theme.palette.background.default,
                    '>.MuiBox-root': {
                        backgroundColor: theme.palette.primary.main
                    }
                }
            })} onClick={()=>onSelect(null)}>
                <Box sx={theme=>({
                    backgroundColor: theme.palette.primary.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    mr: 2
                })}>
                    <AddOutlinedIcon/>
                </Box>
                New album
            </Box>
            {isLoading ? 'Loading...' : albums?.map(album => <Box sx={(theme)=>({
                cursor: 'pointer',
                p:2,
                display:'flex',
                alignItems: 'center',
                '&:hover':{
                    backgroundColor:theme.palette.background.default,
                }
            })} key={album.uuid} onClick={()=>onSelect(album)}>
                <img src={baseURL + album.thumbnail_src} style={{width: 40, height: 40, borderRadius: 16, marginRight: 16}}/>
                {album.name}
            </Box>)}
        </Paper>
    </Modal>
}