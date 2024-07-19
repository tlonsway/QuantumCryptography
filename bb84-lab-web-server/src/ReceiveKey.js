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

function ReceiveKey() {
  const [receivedKey, setReceivedKey] = useState("");
  const [receivedBasis, setReceivedBasis] = useState("");

  function getReceivedKey() {
    const keyprom = sendAndReceiveSerial("bob","GET_RECEIVE_KEY");
    keyprom.then((e) => {
      console.log("setting received key to: ");
      console.log(e);
      const keypart = e.split("|")[0];
      const basispart = e.split("|")[1];
      setReceivedKey(keypart);
      setReceivedBasis(basispart);
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
        Key Reception (Bob)
      </Typography>
      <Divider sx={{ margin: '20px' }} />
      <Button variant="outlined" onClick={() => getReceivedKey()}>
        Retrieve Received Key and Basis
      </Button>
      <TextField 
        value={receivedKey} 
        label="Received Key" 
        variant="outlined" 
        sx={{ marginTop: '7px' }}
      />
      <TextField
        value={receivedBasis}
        label="Received Basis"
        variant="outlined"
        sx={{ marginTop: '7px' }}
      />
    </div>
  );
}

export default ReceiveKey;
