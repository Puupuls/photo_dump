import {Box} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Upload, useIsAllUploadsComplete} from "../../controllers/Upload";
import {api, baseURL} from "../../controllers/API";
import { JustifiedGrid } from "@egjs/react-grid";
import {Photo} from "../../models/photos";
let initialized = false;
export const PhotosPage = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const areUploadsComplete = useIsAllUploadsComplete();

    useEffect(() => {
        if(areUploadsComplete || !initialized) {
            api.get('/photos/').then((response) => {
                console.log(response.data);
                setPhotos(response.data);
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
            defaultDirection={"end"}
            align={"justify"}
            autoResize={true}
            isConstantSize={true}
        >
            {photos.map((photo, index) => (
                <Box key={index} sx={{width: photo.width, height: photo.height, overflow: 'hidden', borderRadius: 2, position: 'relative'}}>
                    <img
                        key={photo.uuid}
                        data-grid-lazy="true"
                        loading="lazy"
                        src={baseURL + '/photos/file/' + photo.uuid}
                        alt={photo.filename_original}
                        title={photo.date_taken}
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
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