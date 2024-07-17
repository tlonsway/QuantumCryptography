const servurl = 'http://bb84-pi.local:8080/';

export async function sendSerial(arduino, message) {
  const url = servurl + 'sendSerial';
  const data = {};
  data.arduino = arduino;
  data.message = message;
  const res = await fetch(url, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
}

export async function isConnected(arduino) {
  const url = servurl + 'isConnected';
  const data = {};
  data.arduino = arduino;
  const res = await fetch(url, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function sendAndReceiveSerial(arduino, message) {
  const url = servurl + 'sendAndReceiveSerial';
  const data = {};
  data.arduino = arduino;
  data.message = message;
  const res = await fetch(url, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  return res.text();
}
