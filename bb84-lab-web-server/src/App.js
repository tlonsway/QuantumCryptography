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

import './App.css';

import DevStatus from './DevStatus.js';
import Key from './Key.js';
import ManualControls from './ManualControls.js';

import { sendAndReceiveSerial, sendSerial } from './api.js';

import { PAGES } from './enums.js';

function App() {

  const [page, setPage] = useState(PAGES.MANUAL);

  function renderPage(page) {
    switch(page) {
      case(PAGES.MANUAL):
        return (
          <ManualControls />
        );
      case(PAGES.AUTO):
        return (
          <p>Auto</p>
        );
      default:
        return (
          <p>error</p>
        );
    }
  }

  return (
    <div>
      <AppBar position="static">
        <Container>
          <Toolbar>
            <Typography
              variant="h4"
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
              BB84 Lab Control Panel
            </Typography>
            <Button variant="outlined" sx={{ color: 'white', marginRight: 2, borderColor: 'white', borderWidth: 3 }} onClick={() => {setPage(PAGES.MANUAL)}}>
              Manual Mode
            </Button>
            <Button variant="outlined" sx={{ color: 'white', marginRight: 2, borderColor: 'white', borderWidth: 3 }} onClick={() => {setPage(PAGES.AUTO)}} >
              Auto Mode
            </Button>
          </Toolbar>
        </Container> 
      </AppBar>
      {renderPage(page)}
    </div>
  );

}

export default App;
