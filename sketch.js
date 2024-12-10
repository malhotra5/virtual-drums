let video;
let bodyPose;
let poses = [];
let connections;

// Motion tracking variables
let leftHandHistory = [];
let rightHandHistory = [];
const historyLength = 5;  // Number of frames to keep in history
const hitThreshold = 15;  // Minimum y-velocity for a hit
const hitCooldown = 10;   // Frames to wait before detecting another hit
let leftCooldown = 0;     // Cooldown counter for left hand
let rightCooldown = 0;    // Cooldown counter for right hand

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

  const leftHandPoints = [10, 8]; // Left wrist and hand points
  const rightHandPoints = [9, 7]; // Right wrist and hand points
  
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

function detectHit(handHistory) {
  if (handHistory.length < historyLength) return false;
  
  // Calculate vertical velocity (positive is downward)
  let currentY = handHistory[handHistory.length - 1].y;
  let prevY = handHistory[handHistory.length - 2].y;
  let velocity = currentY - prevY;
  
  // Check if moving downward fast enough
  return velocity > hitThreshold;
}

function updateHandHistory(hand, history) {
  if (hand) {
    history.push({ x: hand.x, y: hand.y, confidence: hand.confidence });
    if (history.length > historyLength) {
      history.shift(); // Remove oldest entry
    }
  } else {
    history.length = 0; // Clear history if hand not detected
  }
}

function draw() {
  // Draw the video
  image(video, 0, 0, width, height);

  // Update cooldown timers
  if (leftCooldown > 0) leftCooldown--;
  if (rightCooldown > 0) rightCooldown--;

  // Process each pose
  for (let pose of poses) {
    const hands = getHandPositions(pose);
    
    if (hands) {
      // Process left hand
      if (hands.left) {
        // Update history and check for hits
        updateHandHistory(hands.left, leftHandHistory);
        if (leftCooldown === 0 && detectHit(leftHandHistory)) {
          console.log('Left hand hit!');
          leftCooldown = hitCooldown;
        }

        // Draw left hand
        let color = leftCooldown > 0 ? color = [255, 165, 0] : [255, 0, 0]; // Orange during cooldown, else red
        stroke(...color);
        fill(...color);
        circle(hands.left.x, hands.left.y, 20);
        
        // Draw velocity indicator
        if (leftHandHistory.length >= 2) {
          let velocity = hands.left.y - leftHandHistory[leftHandHistory.length - 2].y;
          textSize(12);
          text('v: ' + Math.round(velocity), hands.left.x + 25, hands.left.y);
        }
      }
      
      // Process right hand
      if (hands.right) {
        // Update history and check for hits
        updateHandHistory(hands.right, rightHandHistory);
        if (rightCooldown === 0 && detectHit(rightHandHistory)) {
          console.log('Right hand hit!');
          rightCooldown = hitCooldown;
        }

        // Draw right hand
        let color = rightCooldown > 0 ? [255, 165, 0] : [0, 255, 0]; // Orange during cooldown, else green
        stroke(...color);
        fill(...color);
        circle(hands.right.x, hands.right.y, 20);
        
        // Draw velocity indicator
        if (rightHandHistory.length >= 2) {
          let velocity = hands.right.y - rightHandHistory[rightHandHistory.length - 2].y;
          textSize(12);
          text('v: ' + Math.round(velocity), hands.right.x + 25, hands.right.y);
        }
      }
    }
  }
  
  // Debug: draw motion trails
  stroke(255, 255, 255, 100);
  noFill();
  
  // Left hand trail
  beginShape();
  for (let p of leftHandHistory) {
    vertex(p.x, p.y);
  }
  endShape();
  
  // Right hand trail
  beginShape();
  for (let p of rightHandHistory) {
    vertex(p.x, p.y);
  }
  endShape();
}
