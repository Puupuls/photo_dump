import {Box} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Upload, useIsAllUploadsComplete} from "../../controllers/Upload";
import {api, baseURL} from "../../controllers/API";
import { JustifiedGrid } from "@egjs/react-grid";
import {File} from "../../models/file";
let initialized = false;
export const PhotosPage = () => {
    const [isDragging, setIsDragging] = useState(false);
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
        setIsDragging(true);
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
                <Box key={file.uuid} sx={{width: file.width, height: file.height, overflow: 'hidden', borderRadius: 2, position: 'relative'}}>
                    {file.file_type === 'video'? <video
                        key={file.uuid}
                        data-grid-lazy="true"
                        src={baseURL + '/files/file/' + file.uuid}
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                    /> :
                    <img
                        data-grid-lazy="true"
                        loading="lazy"
                        src={baseURL + '/files/file/' + file.uuid}
                        alt={file.filename_original}
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />}
                </Box>
            ))}
        </JustifiedGrid>
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
    </Box>
}