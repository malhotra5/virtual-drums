let video;
let bodyPose;
let poses = [];
let connections;

function preload() {
    // Load the bodyPose model
    bodyPose = ml5.bodyPose();
}

function setup() {
    createCanvas(640, 480);

    // Create the video and hide it
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // Start detecting poses in the webcam video
    bodyPose.detectStart(video, gotPoses);
    // Get the skeleton connection information
    connections = bodyPose.getSkeleton();
}

function gotPoses(results) {
    poses = results;
}

function draw() {
    // Draw the video
    image(video, 0, 0, width, height);

    // Draw all poses
    for (let pose of poses) {
        // Draw points
        stroke(255);
        fill(255);
        for (let point of pose.keypoints) {
            circle(point.x, point.y, 8);
        }

        // Draw skeleton
        stroke(255);
        strokeWeight(2);
        for (let connection of connections) {
            let start = pose.keypoints[connection.start];
            let end = pose.keypoints[connection.end];

            if (start.score > 0.5 && end.score > 0.5) {
                line(start.x, start.y, end.x, end.y);
            }
        }
    }
}