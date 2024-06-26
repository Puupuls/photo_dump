import {UserType} from "../../models/userType";
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useQuery} from "react-query";

export const UsersPage = () => {
    const {data: users} = useQuery<UserType[]>('users');
    const navigate = useNavigate();

    return <Box sx={{p:2}}>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead sx={(theme)=>({
                    backgroundColor: theme.palette.primary.dark,
                })}>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Last login at</TableCell>
                        <TableCell>Invited at</TableCell>
                        <TableCell>Disabled?</TableCell>
                        <TableCell>
                            <Button variant={"contained"} size={'small'} color={'secondary'} onClick={()=>navigate(`/user/new`)}>Invite</Button>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users?.map((user) => (
                        <TableRow
                            key={user.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.last_login? new Date(user.last_login + "+00:00").toLocaleString() : "Never"}</TableCell>
                            <TableCell>{new Date(user.created_at + "+00:00").toLocaleString()}</TableCell>
                            <TableCell>{user.disabled_at? "Yes" : "No"}</TableCell>
                            <TableCell>
                                <Button variant={"outlined"} size={'small'} color={'secondary'} onClick={()=>navigate(`/user/${user.id}`)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
}