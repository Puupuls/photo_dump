import React, { useState } from 'react';
import { Button, TextField, Grid, Paper, Typography, Link } from '@mui/material';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle login logic here
  };

  return (
    <Grid container style={{ minHeight: '100vh', justifyContent: 'center', alignContent: 'center' }}>
      <Grid item>
        <Paper style={{ padding: '50px' }}>
          <form onSubmit={handleLogin}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="h5">Login</Typography>
              </Grid>
              <Grid item>
                <TextField
                  type="text"
                  placeholder="Username"
                  fullWidth
                  name="username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item>
                <TextField
                  type="password"
                  placeholder="Password"
                  fullWidth
                  name="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LoginPage;