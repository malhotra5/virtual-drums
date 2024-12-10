let video;
let bodyPose;
let pose;
let skeleton;

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO, videoReady);
    video.hide();
    console.log('ml5 version:', ml5.version);
}

function videoReady() {
    console.log('Video is ready');
    // Initialize BodyPose only after video is ready
    bodyPose = ml5.bodyPose(video, modelLoaded);
}

function gotPoses(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    if (results && results.length > 0) {
        pose = results[0];
        skeleton = results[0].skeleton;
    }
}

function modelLoaded() {
    console.log('BodyPose Model Loaded!');
    // Start detecting poses once the model is loaded
    if (bodyPose) {
        bodyPose.detect(video, gotPoses);
    }
}

function draw() {
    // Flip the video horizontally to create a mirror effect
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
    
    // Keep detecting poses in each frame
    if (bodyPose) {
        bodyPose.detect(video, gotPoses);
    }
    
    // Draw keypoints and skeleton if pose is detected
    if (pose) {
        // Draw keypoints
        for (let keypoint of pose.keypoints) {
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(width - keypoint.x, keypoint.y, 10, 10);
            }
        }
        
        // Draw skeleton
        if (skeleton) {
            for (let bone of skeleton) {
                let start = bone[0];
                let end = bone[1];
                stroke(255, 0, 0);
                strokeWeight(2);
                line(width - start.x, start.y, width - end.x, end.y);
            }
        }
    }
    
    // Add text overlay
    fill(255);
    noStroke();
    textSize(20);
    textAlign(LEFT, TOP);
    text('Move in front of the camera', 10, 10);
}