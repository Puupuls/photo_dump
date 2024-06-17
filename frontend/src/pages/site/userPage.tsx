import {useEffect, useState} from "react";
import {UserType} from "../../models/userType";
import {api} from "../../controllers/API";
import {
    Box,
    Button, FormControl, Input, InputLabel, MenuItem,
    Paper, Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField,
    Typography
} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";
import {UserRole} from "../../models/userRoleEnum";

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
            name: user.name,
            email: user.email,
            role: user.role,
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

    const onDisable = () => {
        api.delete(`/users/${userId}`).then((response) => {
            navigate(`/users`);
        })
    }

    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
        <Paper sx={{p:2, mb:10, width: 360}}>
            <Typography variant={'h4'} sx={{mb: 3}}>User {!!user.disabled_at && "(Disabled)"}</Typography>
            <TextField required label="Name" value={user?.name??""} fullWidth sx={{mb:2}} onChange={(e)=>setUser({...user, name: e.target.value})}/>
            <TextField required label="Email" value={user?.email??""} fullWidth sx={{mb:2}} type={'email'} onChange={(e)=>setUser({...user, email: e.target.value})}/>

            <FormControl fullWidth sx={{mb:2}}>
                <InputLabel id="demo-simple-select-label">Role</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={user.role?.toString().toUpperCase()??""}
                    label="Age"
                    onChange={(e)=>setUser({...user, role: UserRole[e.target.value as keyof typeof UserRole]})}
                >
                        {Object.keys(UserRole).map((key) => (
                            <MenuItem key={key} value={key}>{key}</MenuItem>
                        ))}
                </Select>
            </FormControl>

            <TextField required={userId==='new'} label={"Password" + (userId!=='new'? ' (set to update)': '')} fullWidth sx={{mb:2}} type={'password'} value={password} onChange={(e)=>setPassword(e.target.value)}/>

            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                <Button variant={"contained"} color={'warning'} onClick={()=>navigate(`/users`)}>Cancel</Button>
                {userId !== 'new' && <Button variant={"contained"} color={'error'} onClick={onDisable}>{user.disabled_at? "Re-enable":"Disable"}</Button>}
                <Button variant={"contained"} color={'primary'} onClick={onSave}>Save</Button>
            </Box>
        </Paper>
    </Box>
}