let strokeIndex = 0;
let index = 0;

var strokeWeight = 10;
var strokeColor = 0;
var mouthColor = 'red';

var positions;
var ctracker;

let eyes;
let noses;

var drawMouth = false;
var mouth = [];
//all the server stuff
function drawData(){
    //all will load the whole db json file.
    loadJSON('all',gotData);
}

function gotData(data){
    //what does the data look like.  (an array of drawings)
    //console.log(data);
    console.log(data.drawings);
    var imageGallery = select('#imageGallery');
    for(var i=0; i<data.drawings.length; i++){
        var image = data.drawings[i].img;
        var text = data.drawings[i].name;
        /*
        var liEntry = createElement('div');
        liEntry.html(text);
        liEntry.parent(imageGallery);
      //  var imgEntry = createImg(image);
        imgEntry.parent(liEntry);
        */
    }
}

function submitData(){

    //run save frames again to save the new canvas with current pic, but with a different setting
    saveFrames('out', 'png', 1, 2, gotPostFrame);


    function gotPostFrame(data){
        console.log("image generated from canvas, sending");
        //use http post to post this to the server with our path
        var rawImage = data[0].imageData;
        //console.log(rawImage);
        //split this string to send to twitter
        var imgString = rawImage.split(',');
        //the base 64 string with no header will be at the second position of this array
        var imgDB = imgString[1];
        //get the text
        var nameText = nameInput.value();//should probably check this at some point to make sure no one inputs sth funky
        //format it as an object
        //let's make a key, too
        var sendData = {
            name: nameText,
            img: rawImage
        }

        //and post it to the path we set up in the server
        httpPost('/saveData', sendData, dataPosted, dataError);

    }

    function dataPosted(data){
        //this logs the reply we get back from the server.  So, only if tweet posted, run the command to draw these on the page
        console.log(data);//this should be our object with the new addition, back from the server
        drawData(); //draw the data again with the new addition

    }
    function dataError(err){
        console.log(err);
    }
}

function saveImage(){
  save('myAvatar.png');
  submitData();
}

function stopDraw(){
  noLoop();
}

function reloadImg(){
  location.reload();
}

function goteyes(data) {
  eyes = data.drawing;
}

function gotnose(data){
  noses = data.drawing;
}

function newnose(){
  loadJSON('/noses', gotnose);
}
function neweyes() {
  loadJSON('/eyes', goteyes);
}

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
}


function setup() {
  drawData();


  neweyes();
  newnose();

  nameInput = select('#nameInput');



  //setup camera capture
  var videoInput = createCapture(VIDEO);
  videoInput.hide();
  videoInput.size(400,400);


  //setup canvas
  var cnv = createCanvas(400, 400);
  cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  cnv.parent("#canvasDiv");

  //setup clmtracker
  ctracker = new clm.tracker();
  ctracker.init();

  ctracker.start(videoInput.elt);

  fill(255);
}

//used to find the width and height of features
function posDist(pos1, pos2){
  return Math.abs(pos2 - pos1);

}

function draw(){
  clear();

  strokeColor = document.getElementById("strokeColor").value;
  strokeWeight(2);
  var bgColor = document.getElementById("bgColor").value;
  background(bgColor);

  lipColor = document.getElementById("lipColor").value;



  positions = ctracker.getCurrentPosition();

  if (positions.length > 0) {

        const eye1 = {
          xpos: positions[27][0],
          ypos: positions[27][1],
          width: posDist(positions[23][0], positions[25][0]),
          height: posDist(positions[24][1], positions[26][1])
        };

        const eye2 = {
          xpos: positions[32][0],
          ypos: positions[32][1],
          width: posDist(positions[30][0], positions[28][0]),
          height: posDist(positions[33][1], positions[31][1])
        };


        const nose = {
          xpos: positions[62][0],
          ypos: positions[62][1],
          width: posDist(positions[35][0], positions[39][0]),
          height: posDist(positions[33][1], positions[37][1])
        };


        /*

        const mouth = {
          xpos: positions[57][0],
          ypos: positions[57][1],
          width: posDist(positions[44][0], positions[50][0]),
          height: posDist(positions[47][1], positions[53][1])
        };
        */

        /*
        const nose = [34,35,36,42,37,43,38,39,40];
        */

        const eyebrow1 = [19, 20, 21, 22];
        const eyebrow2 = [18, 17, 16, 15];


        const faceOutline = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];


        drawMouth = document.getElementById("lips").checked;
        if (drawMouth == false){
          mouth = [44, 61, 60, 59, 50, 58, 57, 56, 44]; //draw with no lips
        } else{
           mouth = [44,45,46,47,48,49,50,51,52,53,54,55,44, 56,57,58, 50, 59, 60,61, 44]; //mouth with lips
        }



        drawEye(eye1, 1);
        drawEye(eye2, 1);
        drawFeature(eyebrow1, false);
        drawFeature(eyebrow2, false);
        drawFeature(mouth, true);
        drawFeature(faceOutline, false);
        drawNose(nose);
}


function drawFeature(feature, toFill){ //tracing eyebrows, face, and mouth
  smooth();
  noFill();
  if (toFill == true) fill(lipColor) ;
  stroke(strokeColor);
  strokeWeight(strokeWeight);
  beginShape();

  for(let i of feature){
    let x = positions[i][0];
    let y = positions[i][1];
    vertex(x, y);
  }

  endShape();
}

function drawNose(nose){
  for (let path of noses){
    smooth();
    noFill();
    stroke(strokeColor);
    strokeWeight(strokeWeight);
    beginShape();

    for (let i = 0; i < path[0].length; i++){
      let x = path[0][i] * 0.1 + nose.xpos;
      let y = path[1][i] * 0.1 + nose.ypos;
      vertex(x, y);
    }

    endShape();

  }
}


function drawEye(eye, flip){ //flip will be -1 for one eye

  for (let path of eyes){
    smooth();
    noFill();
    stroke(strokeColor);
    strokeWeight(strokeWeight);
    beginShape();

    for (let i = 0; i < path[0].length; i++){
      let x = path[0][i] * 0.15 + eye.xpos * flip;
      let y = path[1][i] * 0.15 + eye.ypos;
      vertex(x, y);
    }

    endShape();

}





}
}
