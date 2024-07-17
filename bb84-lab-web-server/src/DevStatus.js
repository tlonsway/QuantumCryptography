import * as React from 'react';
import { useEffect, useState } from 'react';

import './App.css';
import { isConnected } from './api.js';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

const onlineColor = 'LightGreen';
const offlineColor = 'OrangeRed';

function DevStatus() {
  const [aliceStatus, setAliceStatus] = useState(offlineColor);
  const [bobStatus, setBobStatus] = useState(offlineColor);
  const [eveStatus, setEveStatus] = useState(offlineColor);
  useEffect(() => {
    const aprom = isConnected('alice');
    const bprom = isConnected('bob');
    const eprom = isConnected('eve');
    aprom.then((e) => {
      if (e.status === "true") {
        setAliceStatus(onlineColor);
      } else {
        setAliceStatus(offlineColor);
      }
    });
    bprom.then((e) => {
      if (e.status === "true") {
        setBobStatus(onlineColor);
      } else {
        setBobStatus(offlineColor);
      }
    });
    eprom.then((e) => {
      if (e.status === "true") {
        setEveStatus(onlineColor);
      } else {
        setEveStatus(offlineColor);
      }
    });
  }, []);
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
        Arduino Status
      </Typography>
      <Chip label='Alice' sx={{ backgroundColor: aliceStatus }} />
      <Chip label='Bob' sx={{ backgroundColor: bobStatus }} />
      <Chip label='Eve' sx={{ backgroundColor: eveStatus }} />
    </div>
  );
}

export default DevStatus;
