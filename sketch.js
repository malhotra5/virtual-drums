let video;
let bodyPose;
let pose;
let skeleton;
let isModelReady = false;

async function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    
    // Initialize BodyPose
    try {
        bodyPose = await ml5.bodyPose(video, { modelType: 'MoveNet' });
        modelLoaded();
    } catch (error) {
        console.error('Error loading model:', error);
    }
    
    console.log('ml5 version:', ml5.version);
}

function gotPoses(results) {
    if (results.length > 0) {
        pose = results[0];
        skeleton = results[0].skeleton;
    }
}

function modelLoaded() {
    console.log('BodyPose Model Loaded!');
    isModelReady = true;
}

function draw() {
    // Flip the video horizontally to create a mirror effect
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
    
    // Keep detecting poses in each frame if model is ready
    if (isModelReady && bodyPose) {
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