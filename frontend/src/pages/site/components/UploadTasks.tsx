// UploadTasks.tsx
import {Box, LinearProgress, Paper, Tooltip, Typography} from '@mui/material';
import {UploadTask} from "../../../models/uploadTask";
import {useState} from "react";
import {useUploadStatus} from "../../../controllers/Upload";


export const UploadTasks = () => {
    const {uploadTasks} = useUploadStatus();
    const [collapsed, setCollapsed] = useState<boolean>(false);

    if(uploadTasks.length === 0){
        return null;
    }

    let totalProgress = uploadTasks.reduce((acc, task) => acc + task.progress, 0)/uploadTasks.length;
    let totalError = uploadTasks.reduce((acc, task) => acc + (task.error ? task.progress : 0), 0)/uploadTasks.length;
    let totalSuccess = totalProgress - totalError;

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
                variant="buffer"
                color={'success'}
                value={totalProgress}
                sx={(theme)=>({
                    mb:2,
                    ".MuiLinearProgress-bar": {
                        backgroundImage: `linear-gradient(90deg, ${theme.palette.error.main} ${totalError}%, ${theme.palette.success.main} ${totalError+0.1}%, ${theme.palette.success.main} ${totalSuccess}%)`,
                    }
                })}
            />
            {uploadTasks.map((task, index) => (
                <Box key={index} sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img style={{width: '40px', height: '40px', overflow: 'hidden', borderRadius: 5, marginRight: 10}} src={URL.createObjectURL(task.file)} alt=""/>
                    <Tooltip title={task.file.name}>
                        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} flex={1} overflow={'hidden'}>
                            <Typography variant="caption" sx={{textWrap: 'nowrap', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{task.file.name}</Typography>
                            <LinearProgress
                                variant="determinate"
                                color={task.error? 'error' : (task.progress === 100 ? 'success' : 'primary')}
                                value={task.progress}
                            />
                            {
                                task.error && <Typography variant={'caption'} color={'error'}>{task.error}</Typography>
                            }
                        </Box>
                    </Tooltip>
                </Box>
            ))}
        </Paper>
    );
};