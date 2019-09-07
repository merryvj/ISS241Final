const fs = require('fs');
const ndjson = require('ndjson');
var bodyParser = require('body-parser');


let eyes = [];
fs.createReadStream('eye.ndjson')
    .pipe(ndjson.parse())
    .on('data', function (obj) {
        eyes.push(obj);
    });


let noses = [];
fs.createReadStream('nose.ndjson')
    .pipe(ndjson.parse())
    .on('data', function (obj) {
        noses.push(obj);
    });



    const express = require('express');
    const app = express();
    var port = process.env.PORT || 8000;


    server.listen(port, function() {
    console.log("App is running on port " + port);
});
    app.get('/eyes',(request, response) => {
      const index = Math.floor(Math.random() * eyes.length); //generate a random number to pick a random drawing
      response.send(eyes[index]);
    });


    app.get('/noses',(request, response) => {
      const index = Math.floor(Math.random() * noses.length); //generate a random number to pick a random drawing
      response.send(noses[index]);
    });


    app.use(express.static('public')); //serve html files in public folder


//IMAGE GALLERY SERVER
app.use(bodyParser.urlencoded({extended: false, limit:'100MB' }));
app.use(bodyParser.json({limit:'100MB'}));

var data = fs.readFileSync('images.json');
//parse it
var imageDB = JSON.parse(data);

app.get('/myPath', executeWhenPathIsFollowed);

function executeWhenPathIsFollowed(request, response){
    response.send("a command executed!! And we got this back");
}

//read the json file
var data = fs.readFileSync('images.json');

//a path to return all of the data
app.get('/all', sendAll);

function sendAll(request,response){
    response.send(imageDB);
}

app.post('/saveData', saveDrawingData);

let drawings = [];
function saveDrawingData(request,response){

    console.log(request.body);
    //store the reply
    var reply;

    var img = request.body.img;
    var name = request.body.name;

    console.log(img, name);

        var newData = {
            name: name,
            img: img
        }


        //push the new data to the array
        imageDB["drawings"].push(newData);
        //stringify
        var jsonNewData = JSON.stringify(imageDB, null,2);
        //write to db
        fs.writeFile('images.json', jsonNewData, finished);
        function finished(err){
            if(err){
                console.log(err);
                reply = err;
            } else {
                reply = {
                    msg: "thanks for your image",
                    data: newData
                }
            }
            console.log(reply);
            response.send(reply);
        }

}
