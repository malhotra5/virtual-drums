let video;
let poseNet;
let pose;
let skeleton;

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    
    // Initialize poseNet
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);
    
    console.log('ml5 version:', ml5.version);
}

function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}

function modelLoaded() {
    console.log('PoseNet Model Loaded!');
}

function draw() {
    // Flip the video horizontally to create a mirror effect
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
    
    // Draw keypoints and skeleton if pose is detected
    if (pose) {
        // Draw keypoints
        for (let keypoint of pose.keypoints) {
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(width - keypoint.position.x, keypoint.position.y, 10, 10);
            }
        }
        
        // Draw skeleton
        for (let bone of skeleton) {
            let start = bone[0].position;
            let end = bone[1].position;
            stroke(255, 0, 0);
            strokeWeight(2);
            line(width - start.x, start.y, width - end.x, end.y);
        }
    }
    
    // Add text overlay
    fill(255);
    noStroke();
    textSize(20);
    textAlign(LEFT, TOP);
    text('Move in front of the camera', 10, 10);
}