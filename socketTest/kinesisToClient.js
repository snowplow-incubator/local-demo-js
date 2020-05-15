/* eslint-disable no-return-await */
/* eslint-disable no-console */

const Kinesis = require("aws-sdk/clients/kinesis");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const streamName = "enriched";
const streamClient = new Kinesis({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
});

const { transform } = require("snowplow-analytics-sdk");

server.listen(1080, function () {
  console.log("listening on http://localhost:1080");
});

// function handler(req, res) {
//   if (req.url === "/") {
//     return fs.createReadStream(__dirname + "/index.html").pipe(res);
//   }
//   if (req.url === "/publish" && req.method === "POST") {
//     res.writeHead(200, {
//       Location: "/",
//     });
//     return res.end("");
//   }
// }

app.use("/", express.static("static"));

io.on("connect", () => {
  console.log("got a connection");
});

/*
setInterval(
  () => io.sockets.emit("snowplowEvent", { id: new Date().getTime() }),
  1000
);
*/


function getData(shIterator) {
  getRecordsParams = { ShardIterator: shIterator };

  streamClient.getRecords(getRecordsParams, function (err, recordsResult) {
    if (err) {
      console.log(err, err.stack);
    } // an error occurred
    else {
      recordsResult.Records.forEach((item) => {
        enrichedEvent = Buffer.from(item.Data, "base64").toString("utf-8");
        jsonEnrichedEvent = transform(enrichedEvent);
        console.log(jsonEnrichedEvent);
        io.sockets.emit("snowplowEvent", jsonEnrichedEvent);
      });

      if (recordsResult.NextShardIterator)
        getData(recordsResult.NextShardIterator);
    }
  });
}

var getShardIterParams = {
  ShardId: "shardId-000000000000", // required
  ShardIteratorType: "TRIM_HORIZON", // required
  StreamName: "enriched", // required
};

var shardIter = streamClient.getShardIterator(getShardIterParams, function (
  err,
  shIter
) {
  if (err) {
    console.log(err, err.stack);
  } // an error occurred
  else {
    getData(shIter.ShardIterator);
  }
});
