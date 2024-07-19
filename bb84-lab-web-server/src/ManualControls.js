import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography, Paper } from '@mui/material/';

import './App.css';

import AliceManualControls from './AliceManualControls.js';
import BobManualControls from './BobManualControls.js';
import EveManualControls from './EveManualControls.js';

function ManualControls() {

  return (
    <div>
      <div 
        className="controls"
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-evenly' }}
        >
        <div>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
            <AliceManualControls />
          </Paper>
        </div>
        <div>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
            <BobManualControls />
          </Paper>
        </div>
        <div>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
            <EveManualControls />
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default ManualControls;
