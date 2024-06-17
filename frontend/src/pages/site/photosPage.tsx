import {Box, Paper, Portal, Toolbar, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Upload, useIsAllUploadsComplete} from "../../controllers/Upload";
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
import {Session, useUser} from "../../controllers/Sessions";
import {UserRole, UserRoleUtil} from "../../models/userRoleEnum";


let initialized = false;
export const PhotosPage = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLightboxOpen, setAdvancedExampleOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isInfoOpen, setInfoOpen] = useState(false);
    const [files, setFiles] = useState<FileType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
    const areUploadsComplete = useIsAllUploadsComplete();
    const user = useUser();

    useEffect(() => {
        if(areUploadsComplete || !initialized) {
            api.get('/users/').then((response) => {
                setUsers(response.data);
            })
            api.get('/files/').then((response) => {
                setFiles(response.data);
            })
            initialized = true;
        }
    }, [areUploadsComplete]);

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


    return <Box
        sx={{padding: 2, flex: 1}}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
    >
        <JustifiedGrid
            gap={5}
            columnRange={[1, 10]}
            defaultDirection={"end"}
            align={"justify"}
            autoResize={true}
            resizeDebounce={10}
            displayedRow={-1}
            sizeRange={[150,1000]}
        >
            {files.map((f, index) => (
                <File
                    file={f}
                    key={f.uuid}
                    onClick={() => {
                        setLightboxIndex(index);
                        setAdvancedExampleOpen(true);
                    }}
                    isSelected={selectedIndexes.includes(index)}
                    onSelect={() => {
                        if (selectedIndexes.includes(index)) {
                            setSelectedIndexes(selectedIndexes.filter(it => it !== index));
                        } else {
                            setSelectedIndexes([...selectedIndexes, index]);
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
                files.map((file) => ({
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
                        <InfoOutlinedIcon onClick={() => setInfoOpen(!isInfoOpen)}/>
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
                    <Typography variant={"body2"}>{users.find(it=> it.id===files[lightboxIndex].uploader_id)?.name}</Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', mt:1, ml: 1, mr: 1}}>
                    <Typography variant={"body1"} fontWeight={700}>Created by</Typography>:&nbsp;
                    <Typography variant={"body2"}>{users.find(it=> it.id===files[lightboxIndex].creator_id)?.name}</Typography>
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