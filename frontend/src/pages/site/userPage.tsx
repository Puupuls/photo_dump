import {useEffect, useState} from "react";
import {UserType} from "../../models/userType";
import {api} from "../../controllers/API";
import {
    Box,
    Button, FormControl, Input, InputLabel,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField,
    Typography
} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";

export const UserPage = () => {
    const navigate = useNavigate();
    let { userId } = useParams();
    const [user, setUser] = useState<UserType>({} as UserType);
    const [password, setPassword] = useState<string>('');

    useEffect(() => {
        if(userId !== 'new' && userId !== undefined){
            api.get(`/users/${userId}`).then((response) => {
                setUser(response.data);
            })
        }
    }, [userId]);

    const onSave = () => {
        let data = {
            username: user.username,
            email: user.email,
            password: password
        }
        if(userId === 'new'){
            api.post(`/users/`, data).then((response) => {
                navigate(`/users`);
            })
        } else {
            api.put(`/users/${userId}`, data).then((response) => {
                navigate(`/users`);
            })
        }
    }

    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
        <Paper sx={{p:2, mb:10, width: 360}}>
            <Typography variant={'h4'} sx={{mb: 3}}>User</Typography>
            <TextField required label="Username" value={user?.username??""} fullWidth sx={{mb:2}} onChange={(e)=>setUser({...user, username: e.target.value})}/>
            <TextField required label="Email" value={user?.email??""} fullWidth sx={{mb:2}} type={'email'} onChange={(e)=>setUser({...user, email: e.target.value})}/>
            <TextField required={userId==='new'} label={"Password" + (userId!=='new'? ' (set to update)': '')} fullWidth sx={{mb:2}} type={'password'} value={password} onChange={(e)=>setPassword(e.target.value)}/>

            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                <Button variant={"contained"} color={'warning'} onClick={()=>navigate(`/users`)}>Cancel</Button>
                <Button variant={"contained"} color={'primary'} onClick={onSave}>Save</Button>
            </Box>
        </Paper>
    </Box>
}