import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography, Paper, TextField, Box } from '@mui/material/';

import GenerateKey from './GenerateKey.js';
import ReceiveKey from './ReceiveKey.js';
import InterceptKey from './InterceptKey.js'

import './App.css';

function AutoControls() {
  const [message, setMessage] = useState("");

  return (
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-evenly' }}>
        <div>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
            <GenerateKey />
          </Paper>
        </div>
        <div>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
            <ReceiveKey />
          </Paper>
        </div>
        <div>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
            <InterceptKey />
          </Paper>
        </div>
    </div>
  );
}

export default AutoControls;
