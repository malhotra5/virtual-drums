function setup() {
    createCanvas(640, 480);
    console.log('ml5 version:', ml5.version);
}

function draw() {
    background(220);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('p5.js + ml5.js Template', width/2, height/2);
}