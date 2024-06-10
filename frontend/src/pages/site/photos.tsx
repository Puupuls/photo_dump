import {Box, Paper, Portal, Toolbar, Typography} from "@mui/material";
import React, {ReactNode, useEffect, useState} from "react";
import {Upload, useIsAllUploadsComplete} from "../../controllers/Upload";
import {api, baseURL} from "../../controllers/API";
import {JustifiedGrid} from "@egjs/react-grid";
import {File} from "../../models/file";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import Download from "yet-another-react-lightbox/plugins/download";


let initialized = false;
export const PhotosPage = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLightboxOpen, setAdvancedExampleOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isInfoOpen, setInfoOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const areUploadsComplete = useIsAllUploadsComplete();

    useEffect(() => {
        if(areUploadsComplete || !initialized) {
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
        setIsDragging(!isLightboxOpen);
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
            {files.map((file, index) => (
                <Box
                    key={file.uuid}
                    sx={{width: file.width, height: file.height, overflow: 'hidden', borderRadius: 2, position: 'relative', cursor: 'pointer'}}
                    onClick={() => {
                        setAdvancedExampleOpen(true);
                        setLightboxIndex(index);
                    }}
                >
                    {file.file_type === 'video'? <video
                            key={file.uuid}
                            data-grid-lazy="true"
                            muted={true}
                            src={baseURL + file.src}
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                        /> :
                        <img
                            data-grid-lazy="true"
                            loading="lazy"
                            src={baseURL + file.src}
                            alt={file.filename_original}
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />}
                </Box>
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
                width: 300,
                zIndex: 10000,
            }}>
                <Toolbar>
                    <CloseOutlinedIcon onClick={() => setInfoOpen(false)} sx={{cursor: 'pointer', mr: 2}}/>
                    <Typography variant={"h6"}>Info</Typography>
                </Toolbar>
            </Paper>
            <style>{`
                .yarl__root {
                    right: 300px;
                }
            `}</style>
        </Portal>}
    </Box>
}