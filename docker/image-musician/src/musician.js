
const dgram = require('dgram');

const s = dgram.createSocket('udp4');
const uuid = require('uuid');
const protocol = require('./musician-protocol');


const INSTRUMENTS = new Map([
  ['piano', 'ti-ta-ti'],
  ['trumpet', 'pouet'],
  ['flute', 'trulu'],
  ['violin', 'gzi-gzi'],
  ['drum', 'boum-boum'],
]);


function Musician(instrument) {
  const donneeDuMusicien = {
    uuid: uuid.v4(),
    sound: INSTRUMENTS.get(instrument),
  };

  Musician.prototype.sendSound = function () {
    const payload = JSON.stringify(donneeDuMusicien);
    donneeDuMusicien.activeSince = Date.now();

    const message = Buffer.from(payload);
    s.send(message, 0, message.length, protocol.PROTOCOL_PORT,
      protocol.PROTOCOL_MULTICAST_ADDRESS, () => {
        console.log('Sending payload : ' + payload + ' via port : ' + s.address().port);
      });
  };

  setInterval(this.sendSound.bind(this), 1000);
}

const instrument = process.argv[2];
new Musician(instrument);

