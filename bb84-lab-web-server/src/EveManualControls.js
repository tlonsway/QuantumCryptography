import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography, Button, Slider, Divider, TextField, Box, Switch, Tooltip } from '@mui/material/';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { sendAndReceiveSerial, sendSerial } from './api.js';

function EveManualControls() {
  const [eveAngle0, setEveAngle0] = useState(0);
  const [eveAngle1, setEveAngle1] = useState(0);

  const [transmitBit, setTransmitBit] = useState(0);
  const [transmitBasis, setTransmitBasis] = useState(0);
  const [receiveBasis, setReceiveBasis] = useState(0);

  const [sentBits, setSentBits] = useState('');
  const [receivedBits, setReceivedBits] = useState('');
  
  const [listeningChecked, setListeningChecked] = useState(false);
 
  const [addressValid, setAddressValid] = useState(false);

  useEffect(() => {
    if (addressValid) {
      updateArduinoAngle('eve', setEveAngle0, 0);
      updateArduinoAngle('eve', setEveAngle1, 1);
    }
  }, [addressValid]);
  
  function updateArduinoAngle(arduino_name, ard_angle_statefunc,devnum) {
    if (addressValid) {
      const got_angle = sendAndReceiveSerial(arduino_name, "GET_POS"+"|"+devnum);
      got_angle.then((e) => {
        ard_angle_statefunc(e);
      });
    }
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
  
  function setAddress(arduino_name, address) {
    const msg = "SET_ADDRESS|"+address;
    setAddressValid(true);
    sendSerial(arduino_name, msg);
  }
  
  function overrideAddress(arduino_name) {
    const msg = "OVERRIDE_ADDRESS";
    setAddressValid(true);
    sendSerial(arduino_name, msg);
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
          Eve
        </Typography>
        <div style={{ display: 'flex' }} >
          <Box sx={{ border: 1, borderRadius: 2, display: 'flex', alignItems: 'center' }} >
            <Typography sx={{ padding: '5px', marginLeft: '5px' }} > 
              Listening
            </Typography>
            <Switch
              checked={listeningChecked}
              onChange={() => handleListenSwitch("eve")}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Box>
        </div>
      </div>
      <Divider sx={{ margin: '10px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-around'  }} >
        <Button
          variant="outlined"
          onClick={() => setAddress("eve", "1")}
        >
          SET ADDRESS
        </Button>
        <Button
          variant="outlined"
          onClick={() => overrideAddress("eve")}
        >
          OVERRIDE ADDRESSING
        </Button>
        {addressValid ? 
            <Box sx={{ border: 1, borderRadius: 2, color: 'green', display: 'flex', alignItems: 'center' }}>
            <CheckIcon />
          </Box>
          :
          <Tooltip title="Eve must set or override address" enterDelay={50} leaveDelay={100}>
            <Box sx={{ border: 1, borderRadius: 2, color: 'red', display: 'flex', alignItems: 'center' }}>
              <CloseIcon />
            </Box>
          </Tooltip>
        }

      </div>
      {addressValid ? 
        <div>
          <Divider sx={{ margin: '10px' }} />
          <div>
            <Button 
              variant="outlined"
              onClick={() => sendSerial("eve","LASER_ON")}
            >
              Laser On
            </Button>
            <Button 
              variant="outlined"
              onClick={() => sendSerial("eve","LASER_ON")}
            >
              Laser Off
            </Button>
          </div>
          <Divider sx={{ margin: '20px' }} />
          <div>
            <Slider valueLabelDisplay="on" onChange={sliderOnChange("eve", setEveAngle0, 0)} value={eveAngle0} shiftStep={4} step={4} marks min={90} max={300} />
            <Button variant="outlined" onClick={() => sendSerial("eve","SAVE_ANGLE|0")}>
              Save angle as home (device 0)
            </Button>
            <Slider valueLabelDisplay="on" onChange={sliderOnChange("eve", setEveAngle1, 1)} value={eveAngle1} shiftStep={4} step={4} marks min={90} max={300} />
            <Button variant="outlined" onClick={() => sendSerial("eve","SAVE_ANGLE|1")}>
              Save angle as home (device 1)
            </Button>

          </div>
          <Divider sx={{ margin: '10px' }} />
          <div>
            <TextField
              value={transmitBit}
              onChange={(e) => setTransmitBit(e.target.value)}
              size="small"
              label="Transmit Bit"
              variant="outlined"
              sx={{
                width: '150px'
              }}
            />
            <TextField
              value={transmitBasis}
              onChange={(e) => setTransmitBasis(e.target.value)}
              size="small"
              label="Transmit Basis"
              variant="outlined"
              sx={{
                width: '150px'
              }}
            />
            <Button variant="outlined" onClick={() => setTransmit("eve",transmitBit,transmitBasis)}>
              Set waveplate angle to bit/basis
            </Button>
            <Button variant="outlined" onClick={() => sendPulse("eve")}>
              Pulse Laser
            </Button>
          </div>
          <Divider sx={{ margin: '10px' }} />
          <div>
            <Button variant="outlined" onClick={() => getSentBits("eve")}>
              Retrieve Sent Bits
            </Button>
            <Button variant="outlined" onClick={() => resetSentBits("eve")}>
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
          <Divider sx={{ margin: '10px' }} />
          <div>
            <TextField
              value={receiveBasis}
              onChange={(e) => setReceiveBasis(e.target.value)}
              size="small"
              label="Receive Basis"
              variant="outlined"
              sx={{
                width: '150px'
              }}
            />
            <Button variant="outlined" onClick={() => setReceive("eve",receiveBasis)}>
              Set waveplate angle to this basis
            </Button>
          </div>
          <Divider sx={{ margin: '10px' }} />
          <div>
            <Button variant="outlined" onClick={() => getReceivedBits("eve")}>
              Retrieve Received Bits
            </Button>
            <Button variant="outlined" onClick={() => resetReceivedBits("eve")}>
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
        :
        <Typography sx={{ textAlign: 'center' }}>
          Must set or override address
        </Typography>
      }
    </div>
  );
}

export default EveManualControls;
