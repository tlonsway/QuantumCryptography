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

function GenerateKey() {
  const [keyLength, setKeyLength] = useState(0); 
  const [sentKey, setSentKey] = useState("");
  const [sentBasis, setSentBasis] = useState("");

  function generateKey() {
    const commandstring = "GENERATE_KEY|" + keyLength;
    sendSerial("alice", commandstring);
  }

  function getSentKey() {
    const keyprom = sendAndReceiveSerial("alice","GET_SENT_KEY");
    keyprom.then((e) => {
      console.log("setting sent key to: ");
      console.log(e);
      const keypart = e.split("|")[0];
      const basispart = e.split("|")[1];
      setSentKey(keypart);
      setSentBasis(basispart);
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
        Key Generation (Alice)
      </Typography>
      <Divider sx={{ margin: '20px' }} />
      <TextField 
        value={keyLength} 
        onChange={(e) => setKeyLength(e.target.value)}
        size="small" 
        label="Key Length (bits)" 
        variant="outlined" 
      />
      <Button 
        variant="outlined" 
        onClick={() => generateKey()}
        sx={{ marginTop: '7px' }}
      >
        Start Key Generation
      </Button>
      <Divider sx={{ margin: '20px' }} />
      <Button variant="outlined" onClick={() => getSentKey()}>
        Retrieve Generated Key and Basis
      </Button>
      <TextField 
        value={sentKey} 
        label="Generated Key" 
        variant="outlined" 
        sx={{ marginTop: '7px' }}
      />
      <TextField
        value={sentBasis}
        label="Generated Basis"
        variant="outlined"
        sx={{ marginTop: '7px' }}
      />
    </div>
  );
}

export default GenerateKey;
