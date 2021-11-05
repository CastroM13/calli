const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express();
const fs = require('fs');
var YoutubeMp3Downloader = require("youtube-mp3-downloader");

const config = {
  "ffmpegPath": "./ffmpeg/bin/ffmpeg.exe",        // FFmpeg binary location
  "outputPath": "./output",    // Output file location (default: the home directory)
  "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
  "queueParallelism": 2,                  // Download parallelism (default: 1)
  "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
  "allowWebm": false                      // Enable download from WebM sources (default: false)
}

var YD = new YoutubeMp3Downloader(config);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  var list = [];
  app._router.stack.map(e => {
    (e.route && e.route.path) && list.push(e.route.path)
  })
  res.send(list);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get("/download", (req, res, next) => {
  try {
    if (req.query.v) {
      fs.readdir('./output/', (err, files) => {
        if (files.includes(req.query.v + ".mp3")) {
          console.log("File found, sending...")
          res.sendFile(`./output/${req.query.v}.mp3`, { root: __dirname });
        } else {
          console.log("File not found, downloading...")
          YD.download(req.query.v, req.query.v + '.mp3');
        
          YD.on("error", function (error) {
            console.log('File download failed!');
            console.log(error);
          });
        
          YD.on("finished", function (err, data) {
            console.log('File downloaded succesfully and saved!');
            res.sendFile(data.file, { root: __dirname });
          });
        }
      });
    } else {
      res.send({error: "É necessário prover um ID! (/download?v=ZEcqHA7dbwM)"})
    }
  } catch(e) {
    res.send(e)
  }
});
