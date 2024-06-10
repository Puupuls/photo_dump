// UploadTasks.tsx
import {Box, LinearProgress, Tooltip, Typography} from '@mui/material';
import {UploadTask as UploadTaskType} from "../../../models/uploadTask";
import {useMemo} from "react";


export const UploadTask = ({task}:{task:UploadTaskType}) => {
    const src = useMemo(() => URL.createObjectURL(task.file), [task.file])
    return <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img style={{width: '40px', height: '40px', overflow: 'hidden', borderRadius: 5, marginRight: 10, objectFit: "cover"}} src={src} alt=""/>
            <Tooltip title={task.file.name}>
                <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} flex={1} overflow={'hidden'}>
                    <Typography variant="caption" sx={{textWrap: 'nowrap', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{task.file.name}</Typography>
                    <LinearProgress
                        variant="determinate"
                        color={task.error? 'error' : (task.progress === 100 ? 'success' : 'primary')}
                        value={task.progress}
                    />
                    {
                        task.error && <Typography variant={'caption'} color={'error'}>{typeof(task.error) === 'string'? task.error : "Something went wrong"}</Typography>
                    }
                </Box>
            </Tooltip>
        </Box>
};