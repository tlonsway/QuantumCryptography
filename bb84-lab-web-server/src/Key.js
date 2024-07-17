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

function Key() {
  const [keyLength, setKeyLength] = useState(0); 
  const [sentKey, setSentKey] = useState("");

  function generateKey() {
    const commandstring = "GENERATE_KEY|" + keyLength;
    sendSerial("alice", commandstring);
  }

  function getSentKey() {
    const keyprom = sendAndReceiveSerial("alice","GET_SENT_KEY");
    keyprom.then((e) => {
      console.log("setting sent key to: ");
      console.log(e);
      setSentKey(e);
    });
  }

  return (
    <div>
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
        Key Generation
      </Typography>
      <TextField 
        value={keyLength} 
        onChange={(e) => setKeyLength(e.target.value)}
        size="small" 
        label="Key Length (bits)" 
        variant="outlined" 
      />
      <Button variant="outlined" onClick={() => generateKey()}>
        Start Key Generation
      </Button>
      <Button variant="outlined" onClick={() => getSentKey()}>
        Get Generated Key
      </Button>
      <TextField 
        value={sentKey} 
        label="Generated Key" 
        variant="outlined" 
      />
    </div>
  );
}

export default Key;
