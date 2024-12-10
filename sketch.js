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

function getHandPositions(pose) {
  if (!pose) return null;

  const leftHandPoints = [16, 18, 20, 22]; // Left wrist and hand points
  const rightHandPoints = [15, 17, 19, 21]; // Right wrist and hand points
  
  let leftTotal = { x: 0, y: 0, count: 0 };
  let rightTotal = { x: 0, y: 0, count: 0 };
  
  // Process all points
  for (let i = 0; i < pose.keypoints.length; i++) {
    const point = pose.keypoints[i];
    
    // Only use points with good confidence
    if (point.confidence > 0.2) {
      // Check if it's a left hand point
      if (leftHandPoints.includes(i)) {
        leftTotal.x += point.x;
        leftTotal.y += point.y;
        leftTotal.count++;
      }
      // Check if it's a right hand point
      if (rightHandPoints.includes(i)) {
        rightTotal.x += point.x;
        rightTotal.y += point.y;
        rightTotal.count++;
      }
    }
  }
  
  // Calculate averages
  return {
    left: leftTotal.count > 0 ? {
      x: leftTotal.x / leftTotal.count,
      y: leftTotal.y / leftTotal.count,
      confidence: leftTotal.count / leftHandPoints.length // Relative confidence based on number of points detected
    } : null,
    right: rightTotal.count > 0 ? {
      x: rightTotal.x / rightTotal.count,
      y: rightTotal.y / rightTotal.count,
      confidence: rightTotal.count / rightHandPoints.length // Relative confidence based on number of points detected
    } : null
  };
}

function draw() {
  // Draw the video
  image(video, 0, 0, width, height);

  // Process each pose
  for (let pose of poses) {
    const hands = getHandPositions(pose);
    
    if (hands) {
      // Draw left hand average position
      if (hands.left) {
        stroke(255, 0, 0);  // Red for left hand
        fill(255, 0, 0);
        circle(hands.left.x, hands.left.y, 20);
        // Show confidence
        textSize(12);
        text(Math.round(hands.left.confidence * 100) + '%', hands.left.x + 15, hands.left.y);
      }
      
      // Draw right hand average position
      if (hands.right) {
        stroke(0, 255, 0);  // Green for right hand
        fill(0, 255, 0);
        circle(hands.right.x, hands.right.y, 20);
        // Show confidence
        textSize(12);
        text(Math.round(hands.right.confidence * 100) + '%', hands.right.x + 15, hands.right.y);
      }
    }
  }
}
