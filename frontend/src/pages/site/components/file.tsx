// UploadTasks.tsx
import {Box, LinearProgress, Tooltip, Typography} from '@mui/material';
import React, {useMemo} from "react";
import {File as FileType} from "../../../models/file";
import {baseURL} from "../../../controllers/API";

export const File = ({
     file,
     onClick
 }:{
    file:FileType,
    onClick?:()=>void
}) => {
    // const src = useMemo(() => URL.createObjectURL(file.file), [task.file])
    return <Box
        key={file.uuid}
        sx={{
            width: file.meta_dict.width as string,
            height: file.meta_dict.height as string,
            overflow: 'hidden',
            borderRadius: 2,
            position: 'relative',
            cursor: 'pointer'
    }}
        onClick={onClick}
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
};