/* eslint-disable no-return-await */
/* eslint-disable no-console */

const Kinesis = require('aws-sdk/clients/kinesis');

const streamName = "enriched"
const streamClient = new Kinesis({endpoint: 'http://localhost:4566', region: 'us-east-1'});

const { transform } = require('snowplow-analytics-sdk');

var http = require('http');
var fs = require('fs');

var server = http.createServer(handler);
var io = require('socket.io').listen(server);

function handler (req, res) {
  if (req.url === '/') {
    return fs.createReadStream(__dirname + '/index.html').pipe(res);
  }
  if (req.url === '/publish' && req.method === 'POST') {

    //this is what you are looking for:
    io.sockets.emit('super event', { message: 'Newtest' });
    //---------------------------------

    res.writeHead(200, {
      'Location': '/'
    });
    return res.end('');
  }
}

/*
io.sockets.on('connection', function (socket) {
  socket.on('publish', function (data) {
    //if you need to emit to everyone BUT the socket who emit this use:
    //socket.broadcast.emit('super event', data);

    //emit to everyone
    io.sockets.emit('super event', data);
  })
});

*/

server.listen(1080, function () {
  console.log('listening on http://localhost:1080');
});


function getData(shIterator) {
  getRecordsParams = {ShardIterator: shIterator};

  streamClient.getRecords(getRecordsParams, function(err, recordsResult) {
    if (err) { console.log(err, err.stack); } // an error occurred
    else  {
      recordsResult.Records.forEach((item) => {
        enrichedEvent = Buffer.from(item.Data, 'base64').toString('utf-8')
        jsonEnrichedEvent = transform(enrichedEvent);
        console.log(jsonEnrichedEvent);
        io.sockets.emit('super event', jsonEnrichedEvent);
        io.sockets.emit('super event', 'ANOTHER TEST');
      });

      if (recordsResult.NextShardIterator) getData(recordsResult.NextShardIterator);

    }
 
  });

}

var getShardIterParams = {
  ShardId: 'shardId-000000000000', // required
  ShardIteratorType: 'TRIM_HORIZON', // required
  StreamName: 'enriched' // required
};


var shardIter = streamClient.getShardIterator(getShardIterParams, function(err, shIter) {
  if (err) {console.log(err, err.stack); } // an error occurred
  else  { getData(shIter.ShardIterator) }

});
