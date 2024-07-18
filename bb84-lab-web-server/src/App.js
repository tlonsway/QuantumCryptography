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
  const [aliceAngle, setAliceAngle] = useState(0);
  const [bobAngle, setBobAngle] = useState(0);
  const [eveAngle0, setEveAngle0] = useState(0);
  const [eveAngle1, setEveAngle1] = useState(0);

  const [page, setPage] = useState(PAGES.MANUAL);

  useEffect(() => {
    updateArduinoAngle('alice', setAliceAngle, 0);
    updateArduinoAngle('bob', setBobAngle, 0);
    updateArduinoAngle('eve', setEveAngle0, 0);
    updateArduinoAngle('eve', setEveAngle1, 1);
  }, []);
  //setInterval(() => updateArduinoAngle('alice', setAliceAngle), 60000);
  function updateArduinoAngle(arduino_name, ard_angle_statefunc,devnum) {
    const got_angle = sendAndReceiveSerial(arduino_name, "GET_POS"+"|"+devnum);
    got_angle.then((e) => {
      ard_angle_statefunc(e);
    });
  }
  function sliderOnChange(arduino_name, ard_angle_statefunc, devnum) {
    return (e) => {
      sendSerial(arduino_name, "SET_POS|"+e.target.value+"|"+devnum);
      ard_angle_statefunc(e.target.value);
    };
  }

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

  /*return (
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
            <Button variant="outlined" sx={{ color: 'white', marginRight: 2, borderColor: 'white', borderWidth: 3 }} >
              Manual Mode
            </Button>
            <Button variant="outlined" sx={{ color: 'white', marginRight: 2, borderColor: 'white', borderWidth: 3 }} >
              Auto Mode
            </Button>
          </Toolbar>
        </Container> 
      </AppBar>
      <Box sx={{ m: 8 }} />
      <div className="main-panel">
        <div className='control-partition'>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
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
              Alice
            </Typography>
            <Slider valueLabelDisplay="on" onChange={sliderOnChange("alice", setAliceAngle, 0)} value={aliceAngle} shiftStep={4} step={4} marks min={0} max={360} />
            <Button variant="outlined" onClick={() => sendSerial("alice","SAVE_ANGLE|0")}>
              Save angle
            </Button>
            <Button variant="outlined" onClick={() => sendSerial("alice","PULSE|32")}>
              Send 32 Random Pulses
            </Button>
            <Button variant="outlined" onClick={() => sendSerial("alice","LASER_ON")}>
              Laser On
            </Button>
            <Button variant="outlined" onClick={() => sendSerial("alice","LASER_OFF")}>
              Laser Off
            </Button>
          </Paper>
          <Paper elevation={3} sx={{ m: 2, p: 3, mx: 'auto', width: 400 }}>
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
              Bob
            </Typography>
            <Slider valueLabelDisplay="on" onChange={sliderOnChange("bob", setBobAngle, 0)} value={bobAngle} shiftStep={10} step={10} marks min={0} max={360} />
            <Button variant="outlined" onClick={() => sendSerial("bob","SAVE_ANGLE|0")}>
              Save angle
            </Button>
          </Paper>
          <Paper elevation={3} sx={{ m: 2, p: 3, mx: 'auto', width: 400 }}>
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
              Eve
            </Typography>
            <Slider valueLabelDisplay="on" onChange={sliderOnChange("eve", setEveAngle0, 0)} value={eveAngle0} shiftStep={10} step={10} marks min={0} max={360} />
            <Button variant="outlined" onClick={() => sendSerial("eve","SAVE_ANGLE|0")}>
              Save angle Incoming (dev 0)
            </Button>
            <Slider valueLabelDisplay="on" onChange={sliderOnChange("eve", setEveAngle1, 1)} value={eveAngle1} shiftStep={10} step={10} marks min={0} max={360} />
            <Button variant="outlined" onClick={() => sendSerial("eve","SAVE_ANGLE|1")}>
              Save angle Outgoing (dev 1)
            </Button>
            <Button variant="outlined" onClick={() => sendSerial("eve","PULSE|32")}>
              Send 32 Random Pulses
            </Button>
            <Button variant="outlined" onClick={() => sendSerial("eve","LASER_ON")}>
              Laser On
            </Button>
            <Button variant="outlined" onClick={() => sendSerial("eve","LASER_OFF")}>
              Laser Off
            </Button>
            <Button variant="outlined" onClick={() => sendSerial("eve","SET_ADDRESS|1")}>
              Change Address
            </Button>
          </Paper>
        </div>
        <div className='control-partition'>
          <Paper elevation={3} sx={{ p: 3, mx: 'auto', width: 400 }}>
            <DevStatus />
          </Paper>
          <Paper elevation={3} sx={{ m: 2, p: 3, mx: 'auto', width: 400 }}>
            <Key />
          </Paper>

        </div>
      </div>
    </div>
  );*/
}

export default App;
