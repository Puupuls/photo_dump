import React, {useState} from 'react';
import { Button, TextField, Grid, Paper, Typography, Link, Alert } from '@mui/material';
import {Session} from "../../controllers/Sessions";
import { LoadingButton } from '@mui/lab';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await Session.instance.login(username, password);
      window.location.href = '/';
    } catch (error) {
      setError('Failed to log in. Please check your username and password.');
    }
    setIsLoading(false);
  };

  return (
      <Grid container style={{ minHeight: '100vh', justifyContent: 'center', alignContent: 'center' }}>
        <Grid>
          <Paper style={{ padding: '50px' }}>
            <form onSubmit={handleLogin}>
              <Grid container direction="column" gap={1}>
                <Typography variant="h5">Login</Typography>
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
                <LoadingButton loading={isLoading} variant="contained" color="primary" type="submit" fullWidth>
                  Submit
                </LoadingButton>
                {error && (
                    <Alert severity="error">{error}</Alert>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
  );
}

export default LoginPage;