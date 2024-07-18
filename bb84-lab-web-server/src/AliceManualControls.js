import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography, Button, Slider, Divider, TextField } from '@mui/material/';

import { sendAndReceiveSerial, sendSerial } from './api.js';

function AliceManualControls() {
  const [aliceAngle, setAliceAngle] = useState(0);

  const [transmitBit, setTransmitBit] = useState(0);
  const [transmitBasis, setTransmitBasis] = useState(0);

  const [sentBits, setSentBits] = useState('');

  useEffect(() => {
    updateArduinoAngle('alice', setAliceAngle, 0);
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

  //bit and basis must be either 0 or 1
  function setTransmit(arduino_name, bit, basis) {
    const msg = "SET_WAVEPLATE_TRANSMIT|" + bit + "|" + basis;
    sendSerial(arduino_name, msg);
  }

  function sendPulse(arduino_name) {
    const msg = "PULSE|1";
    sendSerial(arduino_name,msg);
  }
  
  function getSentBits(arduino_name) {
    const keyprom = sendAndReceiveSerial(arduino_name, "GET_SENT_KEY");
    keyprom.then((e) => {
      console.log("setting sent bits to: ");
      console.log(e);
      setSentBits(e);
    });
  }

  function resetSentBits(arduino_name) {
    const msg = "RESET_TRANSMIT";
    sendSerial(arduino_name,msg);
  }
  
  return (
    <div>
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
          Alice
        </Typography>
      </div>
      <Divider sx={{ margin: '10px' }} />
      <div>
        <Button 
          variant="outlined"
          onClick={() => sendSerial("alice","LASER_ON")}
        >
          Laser On
        </Button>
        <Button 
          variant="outlined"
          onClick={() => sendSerial("alice","LASER_ON")}
        >
          Laser Off
        </Button>
      </div>
      <Divider sx={{ margin: '20px' }} />
      <div>
        <Slider valueLabelDisplay="on" onChange={sliderOnChange("alice", setAliceAngle, 0)} value={aliceAngle} shiftStep={4} step={4} marks min={90} max={300} />
        <Button variant="outlined" onClick={() => sendSerial("alice","SAVE_ANGLE|0")}>
          Save angle as home
        </Button>

      </div>
      <Divider sx={{ margin: '10px' }} />
      <div>
        <TextField
          value={transmitBit}
          onChange={(e) => setTransmitBit(e.target.value)}
          size="small"
          label="Bit"
          variant="outlined"
          sx={{
            width: '100px'
          }}
        />
        <TextField
          value={transmitBasis}
          onChange={(e) => setTransmitBasis(e.target.value)}
          size="small"
          label="Basis"
          variant="outlined"
          sx={{
            width: '100px'
          }}
        />
        <Button variant="outlined" onClick={() => setTransmit("alice",transmitBit,transmitBasis)}>
          Set waveplate angle to bit/basis
        </Button>
        <Button variant="outlined" onClick={() => sendPulse("alice")}>
          Pulse Laser
        </Button>
      </div>
      <Divider sx={{ margin: '10px' }} />
      <div>
        <Button variant="outlined" onClick={() => getSentBits("alice")}>
          Retrieve Sent Bits
        </Button>
        <Button variant="outlined" onClick={() => resetSentBits("alice")}>
          Reset Sent Bits
        </Button>
        <TextField
          value={sentBits}
          label="Sent Bits"
          variant="outlined"
          sx={{
            width: '100%'
          }}
        />
      </div>
    </div>
  );
}

export default AliceManualControls;
