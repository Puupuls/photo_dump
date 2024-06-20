// UploadTasks.tsx
import {Box, LinearProgress, Paper, Tooltip, Typography} from '@mui/material';
import {useState} from "react";
import {useUploadStatus} from "../../../controllers/Upload";
import {UploadTask} from "./uploadTask";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


export const UploadTasks = () => {
    const {uploadTasks} = useUploadStatus();
    const [collapsed, setCollapsed] = useState<boolean>(false);

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
                paddingLeft: 2,
                paddingRight: 2,
                maxHeight: collapsed ? '55px' : '360px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                transition: 'all 0.5s',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            })}
        >
            <Box sx={{position:'static', top: 0, left: 0, right: 0, pt: 1}}>
                <Box display={'flex'} justifyContent={'space-between'}>
                    <Typography variant={"body1"}> {totalProgress >= 100? "Uploads done" : "Upload progress"}</Typography>
                    <Tooltip title={collapsed?'Show upload tasks':'Hide upload tasks'}>
                        <Typography
                            onClick={()=>setCollapsed(!collapsed)}
                            sx={{cursor: 'pointer'}}
                        >
                            {
                                collapsed?
                                    <KeyboardArrowUpIcon/> :
                                    <KeyboardArrowDownIcon/>
                            }
                        </Typography>
                    </Tooltip>
                </Box>
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
            </Box>
            <Box sx={{
                overflowY: 'auto',
                maxHeight: '300px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            }}>
                {uploadTasks.map((task, index) => (
                    <UploadTask key={task.file.name} task={task}/>
                ))}
            </Box>
        </Paper>
    );
};