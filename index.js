const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express();
var YoutubeMp3Downloader = require("youtube-mp3-downloader");

const config = {
  "ffmpegPath": "/usr/bin/ffmpeg",        // FFmpeg binary location
  "outputPath": "/output",    // Output file location (default: the home directory)
  "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
  "queueParallelism": 2,                  // Download parallelism (default: 1)
  "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
  "allowWebm": false                      // Enable download from WebM sources (default: false)
}

var YD = new YoutubeMp3Downloader(config );

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

app.get("/download", (req, res, next) => {
  YD.download(req.query.v, req.query.v);

  YD.on("error", function(error) {
      console.log(error);
  });

  YD.on("progress", function(e) {
      console.log(e.progress.percentage.toString().split(".")[0] + "%");
  });

  YD.on("finished", function(err, data) {
    console.log(data);
    res.sendFile(data.file);
  });
});
  