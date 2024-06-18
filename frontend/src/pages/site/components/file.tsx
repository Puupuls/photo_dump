// UploadTasks.tsx
import {Box, IconButton, LinearProgress, Tooltip, Typography} from '@mui/material';
import React, {useMemo} from "react";
import {FileType as FileType} from "../../../models/fileType";
import {baseURL} from "../../../controllers/API";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

export const File = ({
                         file,
                         onClick,
                         isSelected,
                         onSelect,
                         isSelecting
                     }:{
    file:FileType,
    onClick?:()=>void,
    isSelected?:boolean,
    onSelect?:()=>void,
    isSelecting?:boolean
}) => {
    // const src = useMemo(() => URL.createObjectURL(file.file), [task.file])
    return <Box
        key={file.uuid}
        sx={(theme)=>({
            width: file.meta_dict.width as string,
            height: file.meta_dict.height as string,
            overflow: 'hidden',
            borderRadius: 2,
            position: 'relative',
            cursor: 'pointer',
            border: isSelected ? `5px solid ${theme.palette.primary.main}` : '2px solid transparent',
            padding: isSelected ? '5px' : 0,
            '&:hover': {
                border: isSelected ? `5px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.primary.main}`,
                '& .selectButton': {
                    display: 'block'
                }
            },
            '& .selectButton': {
                display: isSelected ? 'block' : 'none'
            }
        })}
        onClick={isSelecting? onSelect : onClick}
    >
        <IconButton
            className={'selectButton'}
            sx={{
                position: 'absolute',
                top: 2,
                left: 2,
                p: 0,
                zIndex: 100,
                height: '24px',
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.75)',
                }
            }}
            onClick={(e)=>{
                e.stopPropagation();
                onSelect?.();
            }}
        >
            <Tooltip title={isSelected ? 'Deselect' : 'Select'}>
                <CheckCircleOutlinedIcon sx={{opacity: isSelected? 1: 0.5}}/>
            </Tooltip>
        </IconButton>
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