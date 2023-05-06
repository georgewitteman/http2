
const http2 = require('http2')
const fs = require('fs')

const server = http2.createSecureServer({
  // we can read the certificate and private key from
  // our project directory
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
})

server.on('stream', (stream) => {
  stream.respond({
    ":status": 200,
    'trailer': 'Server-Timing',
    "TE": "trailers",
  }, { waitForTrailers: true });
  stream.on('wantTrailers', () => {
    console.log("on: wantTrailers", stream.sentTrailers);
    stream.sendTrailers({ "Server-Timing": 'abc' });
    console.log("on: wantTrailers", stream.sentTrailers);
  });
  stream.end('Hello World');
});

server.listen(8443)
