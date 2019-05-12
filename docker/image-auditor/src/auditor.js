const dgram = require('dgram');

const s = dgram.createSocket('udp4');
const net = require('net');
const protocol = require('./auditor-protocol');

const SOUNDS = new Map([
  ['ti-ta-ti', 'piano'],
  ['pouet', 'trumpet'],
  ['trulu', 'flute'],
  ['gzi-gzi', 'violin'],
  ['boum-boum', 'drum'],
]);
const musicians = [];

s.bind(protocol.PORT, () => {
  console.log('Joining multicast group');
  s.addMembership(protocol.MULTICAST_IP);
});

s.on('message', (msg, source) => {
  console.log(`Data has arrived : ${  msg  }. Source port : ${  source.port}`);
  const parsedMsg = JSON.parse(msg);

  const { uuid } = parsedMsg;
  const instrument = SOUNDS.get(parsedMsg.sound);
  const { activeSince } = parsedMsg;

  for (let i = 0; i < musicians.length; i++) {
    if (musicians[i].uuid == uuid) {
      musicians[i].instrument = instrument;
      musicians[i].activeSince = activeSince;
      return;
    }
  }

  musicians.push({
    uuid,
    instrument,
    activeSince,
  });
});

const server = net.createServer((socket) => {
  const active = [];
  for (let i = 0; i < musicians.length; i++) {
    if (Date.now() - musicians[i].activeSince <= protocol.DELAY) {
      active.push({
        uuid: musicians[i].uuid,
        instrument: musicians[i].instrument,
        activeSince: new Date(musicians[i].activeSince),
      });
    }
  }
  const payload = JSON.stringify(active);

  socket.write(payload);
  socket.pipe(socket);
  socket.end();
});
server.listen(2205);
