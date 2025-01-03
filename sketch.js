let video;
let bodyPose;
let poses = [];
let connections;

// Sound variables
let hihatSound;
let snareSound;
let cymbalSound;  // For left sideways
let tomSound;     // For right sideways

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
  
  // Load the drum sounds
  hihatSound = loadSound('sounds/hihat.wav');
  snareSound = loadSound('sounds/snare.wav');
  cymbalSound = loadSound('sounds/cymbal.wav');
  tomSound = loadSound('sounds/tom.wav');
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

function detectSideways(handHistory, isRight) {
  if (handHistory.length < historyLength) return false;
  
  // Calculate horizontal velocity (positive is rightward)
  let currentX = handHistory[handHistory.length - 1].x;
  let prevX = handHistory[handHistory.length - 2].x;
  let velocity = currentX - prevX;
  
  // Debug velocity
  console.log(`${isRight ? 'Right' : 'Left'} hand sideways velocity:`, velocity);
  
  // Adjust threshold for sideways movement (might need to be more sensitive)
  const sidewaysThreshold = 10;  // Slightly more sensitive than vertical hits
  
  // For right hand, check if moving right. For left hand, check if moving left
  if (isRight) {
    return velocity > sidewaysThreshold;  // Right hand moving right
  } else {
    return velocity < -sidewaysThreshold;  // Left hand moving left
  }
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
        // Check for vertical hit
        if (leftCooldown === 0) {
          if (detectHit(leftHandHistory)) {
            console.log('Left hand hit!');
            leftCooldown = hitCooldown;
            hihatSound.play(); // Play hi-hat for left hand
          } else if (detectSideways(leftHandHistory, false)) {
            console.log('Left hand sideways!');
            leftCooldown = hitCooldown;
            cymbalSound.play(); // Play cymbal for left sideways
          }
        }

        // Draw left hand
        let color = leftCooldown > 0 ? [255, 165, 0] : [255, 0, 0]; // Orange during cooldown, else red
        stroke(...color);
        fill(...color);
        circle(hands.left.x, hands.left.y, 20);
        
        // Draw velocity indicators
        if (leftHandHistory.length >= 2) {
          let vVelocity = hands.left.y - leftHandHistory[leftHandHistory.length - 2].y;
          let hVelocity = hands.left.x - leftHandHistory[leftHandHistory.length - 2].x;
          textSize(12);
          text('vert: ' + Math.round(vVelocity), hands.left.x + 25, hands.left.y);
          text('horz: ' + Math.round(hVelocity), hands.left.x + 25, hands.left.y + 15);
        }
      }
      
      // Process right hand
      if (hands.right) {
        // Update history and check for hits
        updateHandHistory(hands.right, rightHandHistory);
        // Check for vertical hit or sideways movement
        if (rightCooldown === 0) {
          if (detectHit(rightHandHistory)) {
            console.log('Right hand hit!');
            rightCooldown = hitCooldown;
            snareSound.play(); // Play snare for right hand
          } else if (detectSideways(rightHandHistory, true)) {
            console.log('Right hand sideways!');
            rightCooldown = hitCooldown;
            tomSound.play(); // Play tom for right sideways
          }
        }

        // Draw right hand
        let color = rightCooldown > 0 ? [255, 165, 0] : [0, 255, 0]; // Orange during cooldown, else green
        stroke(...color);
        fill(...color);
        circle(hands.right.x, hands.right.y, 20);
        
        // Draw velocity indicators
        if (rightHandHistory.length >= 2) {
          let vVelocity = hands.right.y - rightHandHistory[rightHandHistory.length - 2].y;
          let hVelocity = hands.right.x - rightHandHistory[rightHandHistory.length - 2].x;
          textSize(12);
          text('vert: ' + Math.round(vVelocity), hands.right.x + 25, hands.right.y);
          text('horz: ' + Math.round(hVelocity), hands.right.x + 25, hands.right.y + 15);
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
