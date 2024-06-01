import {Box} from "@mui/material";
import React, {useState} from "react";
import {Upload} from "../../controllers/Upload";


export const PhotosPage = () => {
    const [isDragging, setIsDragging] = useState(false);

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
        Photos Page

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