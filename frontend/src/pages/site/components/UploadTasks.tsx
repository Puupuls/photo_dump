// UploadTasks.tsx
import {Box, LinearProgress, Paper, Tooltip, Typography} from '@mui/material';
import {useState} from "react";
import {useUploadStatus} from "../../../controllers/Upload";
import {UploadTask} from "./uploadTask";


export const UploadTasks = () => {
    const {uploadTasks} = useUploadStatus();
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const areAllDone = uploadTasks.filter((task) => task.status === 'uploading').length === 0;

    if(uploadTasks.length === 0){
        return null;
    }

    let totalProgress = uploadTasks.reduce((acc, task) => acc + task.progress, 0)/uploadTasks.length;
    let totalError = uploadTasks.reduce((acc, task) => acc + (task.error ? task.progress : 0), 0)/uploadTasks.length;

    return (
        <Paper
            sx={(theme)=>({
                position: 'fixed',
                bottom: 20,
                right: 20,
                width: '250px',
                paddingTop: 2,
                paddingLeft: 2,
                paddingRight: 2,
                maxHeight: collapsed ? '40px' : '350px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            })}
        >
            <Typography variant={"body1"}>Upload progress</Typography>
            <LinearProgress
                variant="determinate"
                color={'success'}
                value={totalProgress}
                sx={(theme)=>({
                    mb:2,
                    ".MuiLinearProgress-bar": {
                        backgroundImage: `linear-gradient(90deg, ${theme.palette.error.main} ${totalError}%, ${theme.palette.success.main} ${totalError+0.1}%, ${theme.palette.success.main} 100%)`,
                    }
                })}
            />
            {uploadTasks.map((task, index) => (
                <UploadTask key={task.file.name} task={task}/>
            ))}
        </Paper>
    );
};