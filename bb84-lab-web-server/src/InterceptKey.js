import * as React from 'react';
import { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';

import './App.css';
import { sendAndReceiveSerial, sendSerial } from './api.js';

function InterceptKey() {
  const [interceptedKey, setInterceptedKey] = useState("");
  const [interceptedBasis, setInterceptedBasis] = useState("");

  function getInterceptedKey() {
    const keyprom = sendAndReceiveSerial("eve","GET_RECEIVE_KEY");
    keyprom.then((e) => {
      console.log("setting intercepted key to: ");
      console.log(e);
      const keypart = e.split("|")[0];
      const basispart = e.split("|")[1];
      setInterceptedKey(keypart);
      setInterceptedBasis(basispart);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography
        variant="h6"
        noWrap
        sx={{
          mr: 2,
          display: { xs: 'none', md: 'flex' },
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        Key Interception (Eve)
      </Typography>
      <Divider sx={{ margin: '20px' }} />
      <Button variant="outlined" onClick={() => getInterceptedKey()}>
        Retrieve Intercepted Key and Basis
      </Button>
      <TextField 
        value={interceptedKey} 
        label="Intercepted Key" 
        variant="outlined" 
        sx={{ marginTop: '7px' }}
      />
      <TextField
        value={interceptedBasis}
        label="Intercepted Basis"
        variant="outlined"
        sx={{ marginTop: '7px' }}
      />
    </div>
  );
}

export default InterceptKey;
