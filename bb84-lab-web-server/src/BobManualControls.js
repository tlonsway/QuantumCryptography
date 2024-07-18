import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography, Button, Slider, Divider, TextField, Switch, Box } from '@mui/material/';

import { sendAndReceiveSerial, sendSerial } from './api.js';

function BobManualControls() {
  const [bobAngle, setBobAngle] = useState(0);

  const [receivedBits, setReceivedBits] = useState('');
  
  const [receiveBasis, setReceiveBasis] = useState(0);

  const [listeningChecked, setListeningChecked] = useState(false);

  useEffect(() => {
    updateArduinoAngle('bob', setBobAngle, 0);
  }, []);
  
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

  function handleListenSwitch(arduino_name) {
    let listenbool = 0;
    if (listeningChecked === false) {
      listenbool = 1;
    }
    const msg = "SET_LISTEN|"+listenbool;
    sendSerial(arduino_name, msg);
    setListeningChecked(!listeningChecked);
  }

  //bit and basis must be either 0 or 1
  function setReceive(arduino_name, basis) {
    const msg = "SET_WAVEPLATE_RECV|" + basis;
    sendSerial(arduino_name, msg);
  }
  
  function getReceivedBits(arduino_name) {
    const keyprom = sendAndReceiveSerial(arduino_name, "GET_RECEIVE_KEY");
    keyprom.then((e) => {
      console.log("setting recv bits to: ");
      console.log(e);
      setReceivedBits(e);
    });
  }

  function resetReceivedBits(arduino_name) {
    const msg = "RESET_RECEIVE";
    sendSerial(arduino_name,msg);
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }} >
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
        <Box sx={{ border: 1, borderRadius: 2, display: 'flex', alignItems: 'center' }} >
          <Typography sx={{ padding: '5px', marginLeft: '5px' }} > 
            Listening
          </Typography>
          <Switch
            checked={listeningChecked}
            onChange={() => handleListenSwitch("bob")}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Box>
      </div>
      <Divider sx={{ margin: '20px' }} />
      <div>
        <Slider valueLabelDisplay="on" onChange={sliderOnChange("bob", setBobAngle, 0)} value={bobAngle} shiftStep={4} step={4} marks min={90} max={300} />
        <Button variant="outlined" onClick={() => sendSerial("bob","SAVE_ANGLE|0")}>
          Save angle as home
        </Button>

      </div>
      <Divider sx={{ margin: '10px' }} />
      <div>
        <TextField
          value={receiveBasis}
          onChange={(e) => setReceiveBasis(e.target.value)}
          size="small"
          label="Basis"
          variant="outlined"
          sx={{
            width: '100px'
          }}
        />
        <Button variant="outlined" onClick={() => setReceive("bob",receiveBasis)}>
          Set waveplate angle to this basis
        </Button>
      </div>
      <Divider sx={{ margin: '10px' }} />
      <div>
        <Button variant="outlined" onClick={() => getReceivedBits("bob")}>
          Retrieve Received Bits
        </Button>
        <Button variant="outlined" onClick={() => resetReceivedBits("bob")}>
          Reset Received Bits
        </Button>
        <TextField
          value={receivedBits}
          label="Received Bits"
          variant="outlined"
          sx={{
            width: '100%'
          }}
        />
      </div>
    </div>
  );
}

export default BobManualControls;
