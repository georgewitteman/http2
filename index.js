// const http2 = require("http2");

// const requestListener = function (req, res) {
//   console.log(req);
//   res.writeHead(200, {
//     "cache-control": "no-cache",
//     "content-language": "en-US",
//     "content-type": "text/html;charset=UTF-8",
//   });
//   if (req.path === "/foo") {
//     res.write("<!doctype html><head><title>two</title></head><body>Blah blah blah<br><br>\n","utf8", () => {
//       res.write("<br>write2<br>\n");
//       setTimeout(() => {
//         res.end("My first server two!!</body></html>\n");
//       }, 2500
//       )
//     });
//     return
//   }
//   res.write("<!doctype html><head><title>hi</title></head><body>Blah blah blah<br><br>\n","utf8", () => {
//     res.write("<br>write2<br><a href=\"foo\">link to foo</a>\n");
//     setTimeout(() => {
//       res.end("My first server!</body></html>\n");
//     }, 2500
//     )
//   });
// };

const http2 = require('http2')
const fs = require('fs')

const server = http2.createSecureServer({
  // we can read the certificate and private key from
  // our project directory
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
})

server.on("newListener", (eventName, listener) => console.log("on: eventName", eventName));
server.on("removeListener", (eventName, listener) => console.log("on: removeListener", eventName));

// log any error that occurs when running the server
server.on('error', (err) => {
  console.log('on: error');
  console.error(err)
})

server.on("drop", (data) => console.log("on: drop", data));
server.on('listening', () => console.log("on: listening"));
server.on('close', () => console.log("on: close"));
server.on('connection', (socket) => console.log('on: connection'/* , socket */));
server.on('request', (req, res) => console.log('on: request'/* , req, res */));
server.on('session', (session) => console.log('on: session' /* , session */));
server.on('sessionError', (err, session) => console.log('on: sessionError' /* , err, session */));
server.on('timeout', () => console.log('on: timeout'));
server.on('checkContinue', (req, res) => console.log('on: checkContinue'/* , req, res */));
server.on('unknownProtocol', (socket) => console.log('on: unknownProtocol'));

// server.setTimeout(500);

server.on('session', (session) => {
  ['close', 'connect', 'error', 'frameError', 'goaway', 'localSettings', 'ping', 'remoteSettings', 'stream', 'timeout'].forEach((eventName) => {
    session.on(eventName, () => console.log(`session (${session.socket?.localAddress} ${session.socket?.localPort} ${session.socket?.localFamily} - ${session.socket?.remoteAddress} ${session.socket?.remotePort} ${session.socket?.remoteFamily}) on: ${eventName}`));
  });
});

server.on('stream', (stream) => {
  ['aborted', 'close', 'error', 'frameError', 'ready', 'timeout', 'trailers', 'wantTrailers'].forEach((eventName) => {
    stream.on(eventName, () => console.log(`stream (${stream.id}) on: ${eventName}`));
  });
});

// the 'stream' callback is called when a new
// stream is created. Or in other words, every time a
// new request is received
server.on('stream', (stream, headers, flags, rawHeaders) => {
  console.log("on: stream", /* stream, headers, flags, rawHeaders */);
  // we can use the `respond` method to send
  // any headers. Here, we send the status pseudo header
  stream.respond({
    ':status': 200,
    'content-type': 'text/html',
  })
  if (headers[':path'] === '/foo') {
    stream.write("<!doctype html><head><title>two</title></head><body>Blah blah blah<br><br>\n","utf8", () => {
      stream.write("<br>write2<br><a href=\"/\">link to home</a>\n");
      setTimeout(() => {
        stream.end("My first server two!!</body></html>\n");
      }, 2500
      )
    });
    return
  }
  stream.write("<!doctype html><head><title>hi</title></head><body>Blah blah blah<br><br>\n","utf8", () => {
    stream.write("<br>write2<br><a href=\"/foo\">link to foo</a>\n");
    setTimeout(() => {
      stream.end("My first server!</body></html>\n");
    }, 2500
    )
  });

  // // response streams are also stream objects, so we can
  // // use `write` to send data, and `end` once we're done
  // stream.write('Hello World!')
  // stream.end()
})

// start the server on port 8000
server.listen(8443)
