var express = require('express');
var path = require('path');
var fs = require('fs');

var router = express.Router();

var savedPath = "";
var stitchedGif = "";
var convertedStream = "";
var screenshotJpeg = "";

var cutYTurl = function(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
};

var mp4ToGif = function (mp4path, convertCallback) {
    var ffmpeg = require('fluent-ffmpeg');
    convertedStream = path.join(__dirname, "\\..\\public\\videos\\" + new Date().getTime() + ".gif");
    console.log('mp4Path',mp4path);
    ffmpeg("C:\\Users\\Seppe\\Documents\\Stage\\poc-animatedgifmaker\\Node-test\\public\\videos\\1455633435816.mp4")
        .format('gif')
        .output(convertedStream)
        .on('end', function(err){
            if(!err) {
                console.log('Conversion done');
                convertCallback();
            } else {
                console.log('Error end:', err); //log with error of success message
            }
        })
        .on('error', function(err){
            console.log('Error failed:', err); //Error message
        })
        .run();
};

var streamToMp4 = function(stream){
    var ffmpeg = require('fluent-ffmpeg');
    var mp4path = path.join(__dirname, "\\..\\public\\videos\\" + new Date().getTime() + ".mp4");
    ffmpeg(stream)
        .outputOptions([
            '-acodec copy',
            '-vcodec copy',
            '-bsf:a aac_adtstoasc'
        ])
        .output(mp4path)
        .on('end', function(){
            console.log('done processing');
            mp4ToGif(mp4path, function(){
                //TO DO
            });

        })
        .on('error', function(err){
            console.log('Error:',err);
        })
        .on('progress', function(progress) {
            console.log('Processing: ' + progress.percent + '% done');
        })
        .run();
};

/* GET home page. */
router.route('/')
    .get(function(req, res, next) {
        res.render('index', { title: 'Gif generator' });
    });

/* GET editor page. */
router.route('/editor')
    .get(function(req, res, next) {
        //streamToMp4("http://vod.stream.vrt.be/ketnet_geo/_definst_/mp4:ketnet/2014%2F11%2FBUMBA_IN_AUSTRALIE_R1A1_20141124_230003_Ketnet2011_GEO_D10.mp4/playlist.m3u8");
        res.render('editor', { title: 'Gif generator' });
    })
    .post(function(req, res, next){
        var fstream;
        var videopath = __dirname + '/../public/videos/' + new Date().getTime();
        req.pipe(req.busboy);
        req.busboy.on('field', function (fieldname, value) {
            console.log("Uploading: " + value);
            console.log(cutYTurl(value));
            //fstream = fs.createWriteStream(__dirname + '/../public/videos/' + new Date().getTime() +'_' + filename);
        });
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            videopath += '_' + filename;
            fstream = fs.createWriteStream(videopath);
            file.pipe(fstream);
        });
        req.busboy.on('finish', function () {
            console.log('finished');
            console.log(JSON.stringify(videopath));
            res.render('editor', { title: 'Gif generator', video: JSON.stringify(path.basename(videopath)) });
        });

        //YoutTube URL regex test
        //console.log('?v='+cutYTurl('https://youtu.be/N0qtu5NXhuQ?list=PL8mG-RkN2uTx_5Bo-CUuAzejtRthvTbEW&t=5'));
        //console.log('test:',('N0qtu5NXhuQ' === cutYTurl('https://youtu.be/N0qtu5NXhuQ?list=PL8mG-RkN2uTx_5Bo-CUuAzejtRthvTbEW&t=5')));
    });

/* GET & POST handler /gif. */
router.route('/gif')
    .post(function(req, res){
        toGIF(req.body.start, req.body.stop, req.body.path, function(){
            var returnJson =
            {
                "URL": "http://localhost:3000/videos/"+ path.basename(savedPath),
                "extension": path.extname(savedPath),
                "fileName": path.basename(savedPath)
            };
            res.json(returnJson);
        });
    })
    .get(function(req, res){
        var returnJson = [],
            EventEmitter = require('events').EventEmitter,
            filesEE = new EventEmitter();

        fs.readdir(path.join(__dirname, "\\..\\public\\videos\\"),function(err, files){
            if (err) throw console.log("Error:", err);
            for(var file in files) {
                if(path.extname(files[file]) == ".gif"){
                    returnJson.push(
                        {
                            URL: "http://localhost:3000/videos/" + files[file],
                            extension: ".gif",
                            fileName: files[file]
                        }
                    );
                }
            }
            filesEE.emit('files_ready'); // trigger files_ready event
        });

        filesEE.on('files_ready',function(){
            res.json(returnJson);
        });
    });

/* POST handler /stitch. */
router.route('/stitch')
    .post(function(req, res){
        stitch(req.body, function(){
            var returnJson =
            {
                "URL": "http://localhost:3000/videos/"+ path.basename(stitchedGif),
                "extension": path.extname(stitchedGif),
                "fileName": path.basename(stitchedGif)
            };
            res.json(returnJson);
        });
    });

/* POST handler /screenshot. */
router.route('/screenshot')
    .post(function(req, res){
        screenshot(req.body.start, req.body.path, function(){
            var returnJson =
            {
                "URL": "http://localhost:3000/videos/"+ path.basename(screenshotJpeg),
                "extension": path.extname(screenshotJpeg),
                "fileName": path.basename(screenshotJpeg)
            };
            res.json(returnJson);
        });
    })
    .get(function(req, res){
        var returnJson = [],
            EventEmitter = require('events').EventEmitter,
            filesEE = new EventEmitter();

        fs.readdir(path.join(__dirname, "\\..\\public\\videos\\"),function(err, files){
            if (err) throw console.log("Error:", err);
            for(var file in files) {
                if(path.extname(files[file]) == ".jpg"){
                    returnJson.push(
                        {
                            URL: "http://localhost:3000/videos/" + files[file],
                            extension: ".jpg",
                            fileName: files[file]
                        }
                    );
                }
            }
            filesEE.emit('files_ready'); // trigger files_ready event
        });

        filesEE.on('files_ready',function(){
            res.json(returnJson);
        });
    });


module.exports = router;

var toGIF = function(start, stop, video, callback){
    var ffmpeg = require('fluent-ffmpeg');
    console.log("Trim initiated!");

    var duration = stop - start; //Duration in seconds
    var startTime = start; //start time in seconds
    var filePath = path.join(__dirname, "\\..\\public\\videos\\" + video);//path to the video file
    savedPath = path.join(__dirname, "\\..\\public\\videos\\" + new Date().getTime() + ".gif"); //path where the gif will be saved
    console.log(filePath);
    //Trims the video
    ffmpeg(filePath)
        .setStartTime(startTime)
        .setDuration(duration)
        .format('gif')
        .output(savedPath)
        .on('end', function(err){
            if(!err) {
                console.log('Trimming done');
                callback();
            } else {
                console.log('Error end:', err); //log with error of success message
            }
        })
        .on('error', function(err){
            console.log('Error failed:', err); //Error message
        })
        .run();
};

var stitch = function(array, callback){
    console.log("Concatenate initiated!");
    var async = require("async");
    var ffmpeg = require('fluent-ffmpeg');
    var ffmpeg_buffer = ffmpeg();
    stitchedGif = path.join(__dirname, "\\..\\public\\videos\\Stitched_" + new Date().getTime() + ".gif");

    var fileHandler = function(file, fileCallback){
        if(file.fileExtension == ".jpg"){
            createVid(path.join(__dirname, "\\..\\public\\videos\\" + file.fileName), file.duration, function(videoPath){
                ffmpeg_buffer.input(videoPath);
                fileCallback();
            });
        }
        else if(file.fileExtension == ".gif"){
            ffmpeg_buffer.input(path.join(__dirname, "\\..\\public\\videos\\" + file.fileName));
            fileCallback();
        }
    };
    async.eachSeries(array, fileHandler, function(err){
        if(err){
            console.log('Error:', err);
        }
        else{
            ffmpeg_buffer.on('error', function(err) {
                    console.log('An error occurred: ' + err.message);
                })
                .on('end', function() {
                    console.log('Concatenate finished !');
                    callback();
                })
                .mergeToFile(stitchedGif, path.join(__dirname, "\\..\\public\\videos\\tempStitch"));
        }
    });
};

var screenshot = function(start, filePath, callback){
    console.log('Taking screenshot');
    var ffmpeg = require('fluent-ffmpeg');
    screenshotJpeg = path.join(__dirname, "\\..\\public\\videos\\screenshot_" + new Date().getTime() + ".jpg");

    ffmpeg(path.join(__dirname, "\\..\\public\\videos\\" + filePath))
        .on('end', function(){
            console.log('Screenshot saved');
            callback();
        })
        .on('error', function(err){
            console.log('An error occurred: ' + err.message);
        })
        .screenshots({
            timestamps: [start],
            filename: path.basename(screenshotJpeg),
            folder: path.dirname(screenshotJpeg)
        });
};

var createVid = function(imagePath, duration, videocallback){
    var ffmpeg = require('fluent-ffmpeg');
    var savedPath = path.join(__dirname, "\\..\\public\\videos\\imgVid\\" + new Date().getTime() + ".mp4");

    ffmpeg({ source: imagePath, nolog: true })
        .loop(duration)
        .withFps(25)
        .saveToFile(savedPath)
        .on('end', function(){
            videocallback(savedPath);
        });
};
