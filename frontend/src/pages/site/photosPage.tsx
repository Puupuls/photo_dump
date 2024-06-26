import {Box, IconButton, Paper, Portal, Toolbar, Tooltip, Typography} from "@mui/material";
import React, {useState} from "react";
import {Upload} from "../../controllers/Upload";
import {api, baseURL} from "../../controllers/API";
import {JustifiedGrid} from "@egjs/react-grid";
import {FileType} from "../../models/fileType";
import {File} from "./components/file";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import Download from "yet-another-react-lightbox/plugins/download";
import {UserType} from "../../models/userType";
import {UserRole, UserRoleUtil} from "../../models/userRoleEnum";
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import TrashOutlinedIcon from '@mui/icons-material/DeleteOutline';
import {useQuery} from "react-query";


let initialized = false;
export const PhotosPage = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLightboxOpen, setAdvancedExampleOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isInfoOpen, setInfoOpen] = useState(false);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
    const {data: user} = useQuery<UserType>(['users/me'])
    const {data: users} = useQuery<UserType[]>(['users'])
    const {data: files} = useQuery<FileType[]>(['files'])

    if(files === undefined){
        return <Box>Loading...</Box>
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        let files = [];
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            files.push(e.dataTransfer.files[i]);
        }
        if (files.length === 0) {
            return;
        }
        Upload.instance.uploadFiles(files);
        setIsDragging(false);
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if(UserRoleUtil.to_int(user?.role??UserRole.VIEWER)>=UserRoleUtil.to_int(UserRole.EDITOR)) {
            setIsDragging(!isLightboxOpen);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const deleteSingleFile = (index: number) => {
        api.delete(`/files/${files[index].uuid}/`).then(() => {
            setSelectedIndexes(selectedIndexes.filter(it => it !== index));
        });
    }

    const deleteSelectedFiles = () => {
        api.delete(`/files/`, {data: selectedIndexes.map(it => files[it].uuid)}).then(() => {
            setSelectedIndexes([]);
        });
    }

    const downloadSelectedFiles = () => {
        api.post(
            `/files/download/`,
            {
                files: selectedIndexes.map(it => files[it].uuid)
            },
            {responseType: 'blob'},
        ).then((response) => {
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'files';
            a.click();
        })
        setSelectedIndexes([]);
    }

    return <Box
        sx={{paddingX: 2, flex: 1}}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
    >
        {selectedIndexes.length > 0 && <Toolbar
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'fixed',
                top: 0,
                right: 0,
                zIndex: 1201,
                minWidth: '360px'
            }}
        >
            <Typography variant={"h6"}>{selectedIndexes.length} selected</Typography>
            <Box sx={{flex: 1}}/>
            <IconButton onClick={() => downloadSelectedFiles()}>
                <Tooltip title={"Download selected"}>
                    <DownloadOutlinedIcon/>
                </Tooltip>
            </IconButton>
            {UserRoleUtil.to_int(user?.role??UserRole.VIEWER)>=UserRoleUtil.to_int(UserRole.EDITOR) && <>
                <IconButton onClick={() => setSelectedIndexes([])}>
                    <Tooltip title={"Add selected to album"}>
                        <AddOutlinedIcon/>
                    </Tooltip>
                </IconButton>
                <IconButton onClick={() => deleteSelectedFiles()}>
                    <Tooltip title={"Delete selected"}>
                        <DeleteOutlinedIcon/>
                    </Tooltip>
                </IconButton>
                <IconButton onClick={() => setSelectedIndexes([])}>
                    <Tooltip title={"Clear selection"}>
                        <ClearOutlinedIcon/>
                    </Tooltip>
                </IconButton>
            </>}
        </Toolbar>}
        <JustifiedGrid
            style={{
                marginTop: 12,
                minHeight: '70vh',
            }}
            gap={5}
            columnRange={[1, 10]}
            defaultDirection={"end"}
            align={"justify"}
            autoResize={true}
            resizeDebounce={10}
            displayedRow={-1}
            sizeRange={[150,1000]}
        >
            {files?.map((f, index) => (
                <File
                    file={f}
                    key={f.uuid}
                    onClick={() => {
                        setLightboxIndex(index);
                        setAdvancedExampleOpen(true);
                    }}
                    isSelected={selectedIndexes.includes(index)}
                    onSelect={(e) => {
                        if (selectedIndexes.includes(index)) {
                            setSelectedIndexes(selectedIndexes.filter(it => it !== index));
                            //@ts-ignore
                            if(e.shiftKey && lastSelectedIndex !== -1) {
                                setSelectedIndexes(
                                    selectedIndexes.filter(it => it < index || it > lastSelectedIndex)
                                );
                            }
                        } else {
                            //@ts-ignore
                            if (e.shiftKey && lastSelectedIndex !== -1) {
                                setSelectedIndexes([...selectedIndexes, ...Array.from({length: Math.abs(index - lastSelectedIndex)}, (_, i) => Math.min(index, lastSelectedIndex) + i)]);
                            }
                            setSelectedIndexes((val) => [...val, index]);
                        }
                        setLastSelectedIndex(index);
                    }}
                    isSelecting={selectedIndexes.length > 0}
                />
            ))}
        </JustifiedGrid>
        <Lightbox
            open={isLightboxOpen}
            close={() => setAdvancedExampleOpen(false)}
            slides={
                files?.map((file) => ({
                    ...file,
                    src: baseURL + file.src,
                    download: baseURL + file.src + '?download=1',
                }))
            }
            index={lightboxIndex}
            on={{ view: ({ index: currentIndex }) => setLightboxIndex(currentIndex) }}
            plugins={[
                // Captions,
                Fullscreen,
                Slideshow,
                // Thumbnails,
                Download,
                Video,
                Zoom
            ]}
            carousel={{
                finite: true,
                preload: 2,
                imageFit: 'contain'
            }}
            toolbar={{
                buttons: [
                    "download",
                    <button type="button" aria-label="Info" className={"yarl__button"}>
                        <Tooltip title={"Delete"}>
                            <TrashOutlinedIcon onClick={() => deleteSingleFile(lightboxIndex)}/>
                        </Tooltip>
                    </button>,
                    <button type="button" aria-label="Info" className={"yarl__button"}>
                        <Tooltip title={"Info"}>
                            <InfoOutlinedIcon onClick={() => setInfoOpen(!isInfoOpen)}/>
                        </Tooltip>
                    </button>,
                    "slideshow",
                    "fullscreen",
                    "close"
                ],
            }}
        />
        {isDragging && <Box
            sx={(theme)=>({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: `rgba(${theme.palette.background.default}/0.25)`,
                backdropFilter: 'blur(5px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 100,
                pointerEvents: 'none',
            })}
        >
            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.background.paper,
                    padding: 4,
                    borderRadius: 2,
                })}
            >
                Drop files here
            </Box>
        </Box>}
        {isInfoOpen && isLightboxOpen && <Portal
            container={document.body}
        >
            <Paper sx={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 360,
                zIndex: 10000,
                overflowY: 'auto',
                overflowX: 'hidden',
            }}>
                <Toolbar>
                    <CloseOutlinedIcon onClick={() => setInfoOpen(false)} sx={{cursor: 'pointer', mr: 2}}/>
                    <Typography variant={"h6"}>Info</Typography>
                </Toolbar>
                <Box sx={{display: 'flex', alignItems: 'center', mt:1, ml: 1, mr: 1}}>
                    <Typography variant={"body1"} fontWeight={700}>Uploaded by</Typography>:&nbsp;
                    <Typography variant={"body2"}>{users?.find(it=> it.id===files[lightboxIndex].uploader_id)?.name}</Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', mt:1, ml: 1, mr: 1}}>
                    <Typography variant={"body1"} fontWeight={700}>Created by</Typography>:&nbsp;
                    <Typography variant={"body2"}>{users?.find(it=> it.id===files[lightboxIndex].creator_id)?.name}</Typography>
                </Box>
                <br/>
                {files[lightboxIndex].meta_dict && Object.keys(files[lightboxIndex].meta_dict).map((key) => (
                    <Box key={key} sx={{display: 'flex', alignItems: 'center', mt:1, ml: 1, mr: 1}}>
                        <Typography variant={"body1"} fontWeight={700}>{key}</Typography>:&nbsp;
                        <Typography variant={"body2"}>{files[lightboxIndex].meta_dict[key]}</Typography>
                    </Box>
                ))}
            </Paper>
            <style>{`
                .yarl__root {
                    right: 300px;
                }
            `}</style>
        </Portal>}
    </Box>
}