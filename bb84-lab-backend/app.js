const express = require('express');
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

var cors = require('cors')

const app = express();
const port = 8080;

app.use(cors());

const ards = {"alice" :  null, "bob" : null, "eve" : null}; //[alice, bob, eve]
const conn = {"alice" : false, "bob" : false, "eve" : false};

//valid devnames: "alice" "bob" "eve"
function get_dev(devname) {
  function devlog(msg) {
    console.log(`[${devname}]: ${msg}`);
  }
  devlog("attemping to connect");
  const dev = new SerialPort({
    path: '/dev/'+devname,
    baudRate: 9600 },
    function (err) {
      if (err) {
        devlog("failed to connect");
        conn[devname] = false;
      } else {
        devlog("connected");
        conn[devname] = true;
      }
    }
  );
  dev.on('open', function() {
    dev.drain(() => devlog("draining"));
  });
  dev.on('close', function() {
    devlog(`connection closed`);
    conn[devname] = false;
  });
  dev.on('error', function(err) {
    devlog(err);
    if (err.errno === -5) {
      dev.close();
    }
    conn[devname] = false;
  });
  ards[devname] = dev;
  return dev;
}

function isAlive(dev,devname) {
  dev.write("ping\n", function(err) {
    if (err) {
      console.log(`err while attempting isAlive to ${devname}: ` + err);
      return false;
    }
    console.log(`${devname} is alive`);
    return true;
  });
}


get_dev("alice");
get_dev("bob");
get_dev("eve");

function whichArduino(serString) {
  return ards[serString]
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('this is the backend server for the bb84 lab, the frontend is hosted on port 80');
});

app.post('/isConnected', (req, res) => {
  const ard = req.body.arduino;
  const serial = whichArduino(ard);
  if (!conn[ard]) {
    res.send({ status : 'false' });
    return;
  }
  serial.write('ping\n', function(err) {
    if (err) {
      res.send({ status : 'false' });
      conn[ard] = false;
      console.log("about to try to re-connect to ard: " + ard);
      get_dev(ard);
    } else {
      res.send({ status : 'true' });
    }
  });
});

app.post('/sendSerial', (req, res) => {
  const ard = req.body.arduino;
  if (!conn[ard]) {
    res.send('');
    return;
  }
  const message = req.body.message + "\n";
  const serial = whichArduino(ard);
  serial.write(message, function(err) {
    if (err) {
      res.send(`error: failed to send serial message ${message} to arduino ${ard}`);
    } else {
      res.send(`successfully sent serial message ${message} to arduino ${ard}`);
    }
  });
});

app.post('/sendAndReceiveSerial', (req, res) => {
  const ard = req.body.arduino;
  if (!conn[ard]) {
    res.send('');
    return;
  }
  const message = req.body.message + "\n";
  const serial = whichArduino(ard);
  serial.write(message, function(err) {
    if (err) {
      res.send(`error: failed to send serial message ${message} to arduino ${ard}`);
      return;
    }
  });
  const parser = serial.pipe(new ReadlineParser({ delimiter: '\r\n' }))
  parser.on('data', function(data) {
    res.send(data);
    parser.destroy();
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
