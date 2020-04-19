var gameStarted = false;
var lastUpdate = 0;

var mouseX = 0, mouseY = 0;
var keyMap = new Map();

var actionButtonHeld = false;

var soundController;

var picMap = new Map();

var gameWindow;

var windowWidthHeightRatio;

var camera = {x: 0, y: 0, zoom: 1};

var superstars = [];
var particles = [];
var drawables = [];

var frameMs;

window.onerror = function(msg, url, lineNo, columnNo, error)
{
  alert(msg);
  alert(lineNo);
  alert(error);

  return false;
}

window.onclick = function()
{
  alert("clicked!");

  click();
}

function main()
{
  soundController = new SoundController();

  loadPics();

  //window.addEventListener("keydown", keyDown);
  //window.addEventListener("keyup", keyUp);
  //window.addEventListener("click", click);

  document.body.innerHTML = "<div id = \"mainDiv\"><font size = \"10\">Click to play</font></div>";
}

function click()
{
  if (!gameStarted)
  {
    resetWindowWidthHeightRatio();

    setupCanvas();

    gameStarted = true;
    lastUpdate = getTime();

    goToGame();

    update();
  }
}

function update()
{
  frameMs = checkFrameRate();
  resetWindowWidthHeightRatio();

  clearCanvas();

  updateGameCanvas();

  requestAnimationFrame(update);
}

function goToGame()
{
  setDiv("");

  superstars = [];
  particles = [];
  drawables = [];

  //playMusic("Song");

  addVisitor();
}

function updateGameCanvas()
{
  checkInGameKeyStates();

  for (var i = 0; i < superstars.length; i++)
  {
    superstars[i].update(frameMs);
  }

  testCamera();

  drawGameObjects();

  var t = trackPos();
  if (t < 1) {drawBlackFade(1 - t);}
  if (t > 275) {drawBlackFade((t - 275) * 0.2);}
}

function resetCamera()
{
  camera.x = 0;
  camera.y = 0;
  camera.zoom = 1;
}

function testCamera()
{
  //camera.x = Math.cos(lastUpdate / 1000) * 1.2;
  //camera.y = Math.sin(lastUpdate / 1000) * 0.15;
  //camera.zoom = 1 + Math.cos(lastUpdate / 1000) * 0.1;

  //superstars[0].x = (Math.cos(lastUpdate / 1000) / 2 + 0.5) * windowWidthHeightRatio;
}

function drawGameObjects()
{
  garbageCollectArray(superstars);
  garbageCollectArray(particles);
  garbageCollectArray(drawables);

  drawables.sort(function(a, b)
  {
    return a.getZ() - b.getZ();
  });

  drawBackground();

  for (var i = 0; i < drawables.length; i++)
  {
    var d = drawables[i];

    d.draw();
  }

  for (var i = 0; i < particles.length; i++)
  {
    particles[i].update();
  }
}

function drawBackground()
{
  ctx.save();

  var img = getImage("Background");

  if (img != null)
  {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  ctx.restore();
}

function drawBlackFade(x)
{
  ctx.fillStyle = "rgba(0, 0, 0, " + x + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function addVisitor()
{
  var v = new Buttercup("Buttercup", 0.1625, 0.25);

  superstars.push(v);
  drawables.push(v);
}

function addParticle(imageId, x, y, size, xSpeed, ySpeed, fadeStartTime, fadeEndTime)
{
  var p = new Particle(imageId, x, y, size, xSpeed, ySpeed, fadeStartTime, fadeEndTime);

  particles.push(p);
}

function applyCamera()
{
  ctx.translate(-windowSize(camera.x), -windowSize(camera.y));

  ctx.scale(camera.zoom, camera.zoom);
}

function checkInGameKeyStates()
{
  // check input
}

function playMusic(trackName)
{
  if (soundController.enabled) {soundController.setMusic(trackName);}
}

function switchOffMusic()
{
  if (soundController.music != null) {soundController.music.stop();}

  soundController.music = null;
}

function playSound(soundName)
{
  if (soundController.enabled) {soundController.addSound(soundName);}
}

function trackPos()
{
  if (soundController.music == null) {return 10;}

  return soundController.music.audio.currentTime;
}

function setDiv(html)
{
  document.getElementById("mainDiv").innerHTML = html;
}

function checkFrameRate()
{
  var t = getTime(), ms = t - lastUpdate;

  document.title = "frames: " + ms;

  lastUpdate = t;

  return ms;
}

function resetWindowWidthHeightRatio()
{
  windowWidthHeightRatio = window.innerWidth / window.innerHeight;
}

function mouseMove(e)
{
  mouseX = e.clientX;
  mouseY = e.clientY;
}

function keyDown(e)
{
  keyMap.set(e.keyCode, true);
}

function keyUp(e)
{
  keyMap.set(e.keyCode, false);
}

function keyPressed(keyCode)
{
  return keyMap.has(keyCode) && keyMap.get(keyCode) == true;
}



var canvas, ctx;

function setupCanvas()
{
  canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  document.body.appendChild(canvas);

  ctx = canvas.getContext("2d");
}

function clearCanvas()
{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}



function windowSize(fraction)
{
  return Math.round(window.innerHeight * fraction);
}

function sin(r, multi, pls)
{
  return ((1 - Math.cos(r * Math.PI)) / 2 * (typeof multi == "undefined" ? 1 : multi) + (typeof pls == "undefined" ? 0 : pls)) * Math.PI;
}

function rotateAbout(startX, startY, pivotX, pivotY, rot, squash)
{
  var c = Math.cos(rot);
  var s = Math.sin(rot);

  var x = startX - pivotX;
  var y = startY - pivotY;

  var newX = x * c - y * s;
  var newY = x * s + y * c;

  x = newX + pivotX;
  y = newY / squash + pivotY;

  return {x: x, y: y};
}

function getTime()
{
  var d = new Date();

  return d.getTime();
}

function garbageCollectArray(arr)
{
  for (var i = arr.length - 1; i >= 0; i--)
  {
    if (arr[i].toDelete())
    {
      arr.splice(i, 1);
    }
  }
}

function getSrc(path)
{
  return "https://cdn.jsdelivr.net/gh/Fazness87/MightyBase@master/src/" + path;
}



function Animation()
{
  this.clips = [];

  this.current = 0;
}

Animation.prototype.add = function(length, val)
{
  this.clips.push({time: length, val: val});

  this.current += val;
};

Animation.prototype.goto = function(length, val)
{
  this.clips.push({time: length, val: val - this.current});

  this.current = val;
};

Animation.prototype.animate = function()
{
  var t = trackPos();
  var q = 0;
  var result = 0;
  var q2;

  for (var i = 0; i < this.clips.length; i++)
  {
    var c = this.clips[i];
    var q2 = q + c.time;

    if (t > q2)
    {
      q += c.time;
      result += c.val;
    }
    else if (t > q)
    {
      return result + (((t - q) / (q2 - q)) * c.val);
    }
  }

  return result;
};



function BodyPart(hostObj, id, width, height, parentJoint, parentJointAngle, parentJointDist, jointAngle, jointDist)
{
  this.x;
  this.y;

  this.hostObj = hostObj;
  this.imageHost = this.hostObj.id;
  this.id = id;
  this.width = width;
  this.height = height;
  this.rotation = 0;

  this.parentJoint = parentJoint;
  this.parentJointAngle = parentJointAngle;
  this.parentJointDist = parentJointDist;
  this.jointAngle = jointAngle;
  this.jointDist = jointDist;

  this.calculatedJoint;

  this.childJoints = [];

  if (typeof this.parentJoint.childJoints != "undefined") {this.parentJoint.childJoints.push(this);}

  this.aniFrame = 0;

  this.widthAni = null;
  this.rotationAni = new Animation();
}

BodyPart.prototype.update = function(ms)
{
  this.aniFrame += ms;

  if (this.widthAni != null) {this.width = this.widthAni.animate();}
  if (this.rotationAni != null) {this.rotation = this.rotationAni.animate();}

  this.recalcPosition();

  for (var i = 0; i < this.childJoints.length; i++)
  {
    this.childJoints[i].update(ms);
  }
};

BodyPart.prototype.draw = function()
{
  ctx.lineWidth = windowSize(0.006);
  ctx.beginPath();

  var img = getImage(this.imageHost + "/" + this.id);

  if (img != null)
  {
    ctx.save();

    applyCamera();

    ctx.beginPath();

    if (this.hostObj.hFlip)
    {
      ctx.translate(-windowSize(this.getX()), windowSize(this.getY()));
      ctx.scale(-1, 1);
    }
    else
    {
      ctx.translate(windowSize(this.getX()), windowSize(this.getY()));
    }

    ctx.rotate(this.getRotation());

    ctx.globalAlpha = 1 - this.hostObj.transparency;

    ctx.ellipse(0, 0, windowSize(this.width), windowSize(this.height), 0, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(img, -windowSize(this.width), -windowSize(this.height), windowSize(this.width * 2), windowSize(this.height * 2));
    //ctx.stroke();

    ctx.restore();
  }
};

BodyPart.prototype.recalcPosition = function()
{
  var rot = this.parentJointAngle + this.parentJoint.getRotation();
  var x = Math.cos(this.parentJointAngle) * this.parentJoint.width;
  var y = Math.sin(this.parentJointAngle) * this.parentJoint.height;

  var dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * this.parentJointDist;

  var pj = rotateAbout(dist, 0, 0, 0, rot, 1);

  pj.x += this.parentJoint.getX();
  pj.y += this.parentJoint.getY();

  rot = this.jointAngle + this.getRotation();
  x = Math.cos(this.jointAngle) * this.width;
  y = Math.sin(this.jointAngle) * this.height;

  dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * this.jointDist;

  j = rotateAbout(dist, 0, 0, 0, rot, 1);

  this.x = pj.x - j.x;
  this.y = pj.y - j.y;

  this.calculatedJoint = pj;
};

BodyPart.prototype.getX = function()
{
  return this.x;
};

BodyPart.prototype.getY = function()
{
  return this.y;
};

BodyPart.prototype.getRotation = function()
{
  return this.rotation + this.parentJoint.getRotation();
};



function Buttercup(id, width, height)
{
  this.id = id;

  this.x = 0.8;
  this.y = 0.5;
  this.z = 0;
  this.width = width;
  this.height = height;
  this.rotation = 0;
  this.hFlip = false;
  this.drawOrder = "";
  this.transparency = 0;

  this.bodyParts = new Map();

  this.body = this.addBodyPart("Body", width * 0.6, height * 0.7, "", 0, 0, 0, 0);
  this.head = this.addBodyPart("Head", width * 1.5, height, "Body", -Math.PI / 2, 0.7, Math.PI / 2, 0.35);

  this.leftUpperArm = this.addBodyPart("Left Upper Arm", height * 0.3, width * 1.3, "Body", Math.PI * 1.33, 0.7, 0, 0.7);
  this.rightUpperArm = this.addBodyPart("Right Upper Arm", height * 0.42, width * 1.3, "Body", Math.PI * 1.71, 0.78, Math.PI, 0.7);
  this.leftLowerArm = this.addBodyPart("Left Lower Arm", height * 0.4, width * 1.1, "Left Upper Arm", Math.PI, 0.8, 0, 0.8);
  this.rightLowerArm = this.addBodyPart("Right Lower Arm", height * 0.38, width, "Right Upper Arm", 0, 0.8, Math.PI, 0.8);
  this.rightHand = this.addBodyPart("Right Hand", height * 0.16, width * 0.7, "Right Lower Arm", 0, 0.8, Math.PI, 0.8);

  this.leftUpperLeg = this.addBodyPart("Left Upper Leg", width * 0.47, height * 0.2, "Body", Math.PI * 0.6, 0.65, -Math.PI / 2, 0.7);
  this.rightUpperLeg = this.addBodyPart("Right Upper Leg", width * 0.47, height * 0.25, "Body", Math.PI * 0.4, 0.65, -Math.PI / 2, 0.7);
  this.leftLowerLeg = this.addBodyPart("Left Lower Leg", width * 0.42, height * 0.22, "Left Upper Leg", Math.PI * 0.52, 0.8, -Math.PI / 2, 0.85);
  this.rightLowerLeg = this.addBodyPart("Right Lower Leg", width * 0.42, height * 0.22, "Right Upper Leg", Math.PI * 0.52, 0.8, -Math.PI / 2, 0.85);

  this.guitar = this.addBodyPart("Guitar", width * 2, height * 1.25, "Body", Math.PI * 0.85, 1.4, -Math.PI, 0.9);

  this.setupAnimation();

  //soundController.music.audio.currentTime = 0;
}

Buttercup.prototype.setupAnimation = function()
{
  var headBang = (function(iterations, delay, magnitude)
  {
    for (var i = 0; i < iterations; i++)
    {
      this.head.rotationAni.add(delay * 0.3, magnitude * 0.15);
      this.head.rotationAni.add(delay * 0.7, -magnitude * 0.15);
    }
  }).bind(this);

  var legs = (function(iterations, delay, magnitude)
  {
    for (var i = 0; i < iterations; i++)
    {
      this.leftUpperLeg.rotationAni.add(delay * 0.5, magnitude * -0.095);
      this.leftUpperLeg.rotationAni.add(delay * 0.5, -magnitude * -0.095);
      this.rightUpperLeg.rotationAni.add(delay * 0.5, magnitude * -0.095);
      this.rightUpperLeg.rotationAni.add(delay * 0.5, -magnitude * -0.095);
      this.leftLowerLeg.rotationAni.add(delay * 0.5, magnitude * 0.12);
      this.leftLowerLeg.rotationAni.add(delay * 0.5, -magnitude * 0.12);
      this.rightLowerLeg.rotationAni.add(delay * 0.5, magnitude * 0.088);
      this.rightLowerLeg.rotationAni.add(delay * 0.5, -magnitude * 0.088);
    }
  }).bind(this);

  var strum = (function(iterations, delay, magnitude)
  {
    for (var i = 0; i < iterations; i++)
    {
      this.leftUpperArm.rotationAni.add(delay * 0.5, magnitude * 0.095);
      this.leftUpperArm.rotationAni.add(delay * 0.5, -magnitude * 0.095);
      this.leftLowerArm.rotationAni.add(delay * 0.5, magnitude * 0.475);
      this.leftLowerArm.rotationAni.add(delay * 0.5, -magnitude * 0.475);
    }
  }).bind(this);

  var chord = (function(fret, str, delay)
  {
    var t = fret / 18;
    var uArm = 0.94 + t * 0.69;
    var lArmRot = -0.94 - t * 0.47;
    var lArmWidth = this.width * (0.63 - t * 0.47);
    var handRot = -1.255 - t * 0.94;
    var handWidth = this.width * (0.22 - str * 0.02 + Math.sin(t * Math.PI) * 0.03);

    this.rightUpperArm.rotationAni.goto(delay, uArm);
    this.rightLowerArm.rotationAni.goto(delay, lArmRot);
    this.rightLowerArm.widthAni.goto(delay, lArmWidth);
    this.rightHand.rotationAni.goto(delay, handRot);
    this.rightHand.widthAni.goto(delay, handWidth);
  }).bind(this);

  var chordTest = (function(delay)
  {
    for (var i = 1; i < 18; i++)
    {
      chord(i, 1, 0.5);
      chord(i, 1, 0.3);
    }

    for (var i = 1; i < 18; i++)
    {
      chord(i, 5, 0.5);
      chord(i, 5, 0.3);
    }
  }).bind(this);

  var intro = (function(loop)
  {
    var t = 0.215;

    strum(loop * 16, t, 0.4);

    for (var i = 0; i < loop; i++)
    {
      chord(2, 1, t);
      chord(2, 1, t);
      chord(4, 2, t);
      chord(2, 1, t);
      chord(5, 2, t);
      chord(2, 1, t);
      chord(4, 2, t);
      chord(2, 1, t);
      chord(2, 2, t);
      chord(5, 1, t);
      chord(4, 1, t);
      chord(5, 1, t);
      chord(2, 2, t);
      chord(5, 1, t);
      chord(4, 1, t);
      chord(4, 0, t);
    }
  }).bind(this);

  var preVerse = (function()
  {
    var t = 0.215;

    strum(9, t, 0.4);
    chord(2, 1, t);
    chord(2, 1, t);
    chord(4, 2, t);
    chord(2, 1, t);
    chord(5, 2, t);
    chord(2, 1, t);
    chord(4, 2, t);
    chord(2, 1, t);
    strum(2, t * 4, 0.7);
    chord(6, 2, t);
    chord(6, 2, t * 3.6);
    chord(8, 2, t * 0.4);
    chord(8, 2, t * 3.6);
    chord(12, 1, t * 0.4);
    chord(0, 1, t);
  }).bind(this);

  var verse = (function()
  {
    var t = 0.87;

    for (var i = 0; i < 9; i++)
    {
      for (var j = 0; j < 2; j++)
      {
        strum(2, t * 0.25, 0.3);
        strum(1, t * 0.5, 0.7);
      }

      strum(1, t * 0.25, 0.3);
      strum(1, t * 0.5, 0.7);
      strum(1, t * 0.25, 0.3);
      strum(1, t, 0.8);

      chord(6, 3, t * 0.2);
      chord(6, 3, t * 0.8);
      chord(5, 4, t * 0.2);
      chord(5, 4, t * 0.8);
      chord(3, 4, t * 0.2);
      chord(3, 4, t * 0.8);
      chord(2, 2, t * 0.1);

      if (i == 1)
      {
        chord(2, 2, t * 0.2);
        chord(3, 4, t * 0.05);
        chord(2, 4, t * 0.05);
        chord(1, 4, t * 0.05);
        chord(3, 3, t * 0.05);
        chord(2, 3, t * 0.05);
        chord(1, 3, t * 0.05);
        chord(3, 2, t * 0.05);
        chord(2, 2, t * 0.05);
        chord(1, 2, t * 0.05);
        chord(1, 2, t * 0.25);
      }
      else
      {
        chord(2, 2, t * 0.9);
      }
    }
  }).bind(this);

  var interlude = (function()
  {
    var t = 0.87;

    for (var i = 0; i < 2; i++)
    {
      strum(2, t * 0.25, 0.3);
      strum(1, t * 0.5, 0.7);
    }

    strum(1, t * 0.25, 0.3);
    strum(1, t * 0.5, 0.7);
    strum(1, t * 0.25, 0.3);
    strum(1, t * 0.4, 0.5);
    strum(1, t * 0.6, 0.7);

    chord(5, 5, t * 0.2);
    chord(5, 5, t * 0.8);
    chord(3, 3, t * 0.2);
    chord(3, 3, t * 0.8);
    chord(7, 3, t * 0.2);
    chord(7, 3, t * 0.8);
    chord(2, 2, t * 0.1);
    chord(2, 2, t * 0.5);
    chord(12, 1, t * 0.1);
    chord(1, 1, t * 0.3);

    t *= 0.6;

    for (var i = 0; i < 2; i++)
    {
      strum(6, t * 0.3, 0.3);
      strum(2, t * 0.7, 0.5);
      strum(1, t * 1.2, 0.3);
      strum(2, t * 1.4, 0.6);
    }

    for (var i = 0; i < 2; i++)
    {
      chord(3, 1, t * 0.3);
      chord(3, 1, t * 0.7);
      chord(4, 2, t * 0.3);
      chord(4, 2, t * 0.7);
      chord(3, 1, t * 0.3);
      chord(3, 1, t * 0.7);
      chord(6, 2, t * 0.3);
      chord(6, 2, t * 0.7);
      chord(7, 3, t * 0.3);
      chord(7, 3, t * 0.5);
      chord(7, 4 - i * 3, t * 0.2);
      chord(7, 4 - i * 3, t * 1.6);
    }
  }).bind(this);

  var chorus = (function()
  {
    var t = 0.32;

    var goingOffTheRails = (function()
    {
      for (var i = 0; i < 2; i++)
      {
        strum(2, t * 0.3, 0.2);
        strum(2, t * 0.5, 0.4);
        strum(1, t * 1.2, 1.5);
      }

      strum(6, t * 0.6, 0.3);

      chord(7, 1, t * 0.2);
      chord(7, 1, t * 0.8);
      chord(5, 2, t * 0.2);
      chord(5, 2, t * 1.8);
      chord(4, 2, t * 0.2);
      chord(4, 2, t * 0.8);
      chord(2, 2, t * 0.2);
      chord(2, 2, t * 1.8);
      chord(4, 1, t * 0.2);
      chord(4, 1, t * 0.8);
      chord(2, 1, t * 0.2);
      chord(2, 1, t * 2.8);
      chord(4, 1, t * 0.2);
      chord(4, 1, t * 0.6);
    }).bind(this);

    goingOffTheRails();

    t *= 0.58;

    strum(20, t * 1.1, 0.2);
    chord(4, 3, t);
    chord(4, 1, t);
    chord(2, 2, t);
    chord(2, 1, t);
    chord(5, 2, t);
    chord(2, 2, t);
    chord(5, 3, t);
    chord(2, 2, t);
    chord(5, 3, t);
    chord(4, 3, t);
    chord(2, 3, t);
    chord(4, 4, t);
    chord(4, 3, t);
    chord(2, 3, t);
    chord(4, 4, t);
    chord(2, 4, t);
    chord(4, 4, t);
    chord(2, 4, t);
    chord(2, 0, t);

    t /= 0.58;

    goingOffTheRails();
  }).bind(this);

  var preSolo = (function()
  {
    var t = 0.85;

    var double = (function(fret, str, slide)
    {
      strum(2, t * 0.25, 0.4);
      strum(1, t * 0.5, 0);

      chord(fret, str, t * 0.2);
      chord(fret, str, t * (0.8 - slide * 0.4));

      if (slide == 1)
      {
        strum(1, t, 0);
        chord(1, str, t * 1.4);
      }
    }).bind(this);

    strum(2, t * 0.25, 0.4);
    strum(1, t * 0.5, 0);
    strum(1, t, 0);
    chord(3, 1, t * 0.4);
    chord(1, 1, t);

    //double(3, 1, 1);
    double(1, 2, 0);
    double(1, 1, 0);
    double(3, 1, 1);
    double(6, 2, 0);
    double(8, 2, 0);
    double(10, 2, 1);
    double(1, 2, 0);
    double(1, 1, 0);
    double(3, 1, 1);

    strum(1, t * 0.7, 0.8);
    strum(1, t * 0.3, 0);
    strum(1, t * 0.7, 0.8);
    strum(1, t * 0.3, 0);
    chord(6, 2, t * 0.3);
    chord(6, 2, t * 0.7);
    chord(7, 3, t * 0.3);
    chord(7, 3, t * 0.7);
  }).bind(this);

  var solo = (function()
  {
    var t = 0.2;

    var pull = (function(f1, f2, f3, f4, loop)
    {
      for (var i = 0; i < loop; i++)
      {
        chord(f1, 6, t);
        chord(f2, 6, t);
        chord(f3, 6, t);
        chord(f4, 6, t);
        chord(f4, 6, t * 4);
      }
    }).bind(this);

    strum(32, t, 0.2);
    strum(4, t, 0);
    strum(4, t, 0.2);
    strum(4, t, 0);
    strum(4, t, 0.2);
    strum(4, t, 0);
    strum(13, t, 0.2);
    strum(4, t, 0);
    strum(28, t, 0.2);
    strum(1, t, 0);
    strum(1, t, 0.2);
    strum(5, t, 0);
    strum(14, t, 0.2);
    strum(1, t, 0);
    strum(1, t, 0.2);
    strum(3, t, 0);
    strum(8, t, 0.2);
    strum(1, t, 0);
    strum(1, t, 0.2);
    strum(1, t, 0);
    strum(1, t, 0.2);
    strum(1, t * 4, 0);

    chord(14, 5, t * 1.9);

    for (var i = 14; i <= 15; i++)
    {
      for (var j = 0; j < 4; j++)
      {
        chord(i, 5, t * 0.5);
        chord(i, 5, t * 0.5);
        chord(10, 5, t * 0.5);
        chord(7, 5, t * 0.5);
      }
    }

    t *= 0.75;

    chord(12, 5, t);
    chord(12, 5, t);
    chord(10, 5, t);
    chord(12, 5, t);
    chord(10, 5, t);
    chord(12, 5, t);
    chord(10, 5, t);
    chord(12, 5, t);
    chord(9, 5, t);
    chord(11, 5, t);
    chord(9, 5, t);
    chord(11, 5, t);
    chord(10, 5, t);
    chord(12, 5, t);
    chord(10, 5, t);
    chord(12, 5, t);
    chord(9, 4, t);
    chord(9, 5, t);
    chord(10, 5, t);
    chord(9, 4, t);
    chord(9, 4, t * 5);

    t *= 1.18;

    chord(17, 6, t);
    chord(16, 6, t);
    chord(14, 6, t);
    chord(17, 5, t);
    chord(17, 5, t * 4);
    chord(17, 5, t);
    chord(17, 6, t);
    chord(16, 6, t);
    chord(17, 6, t);
    chord(17, 6, t);
    chord(19, 6, t);
    chord(19, 6, t * 4);
    chord(16, 6, t);
    chord(17, 6, t);
    chord(16, 6, t);
    chord(19, 5, t);
    chord(16, 6, t);
    chord(19, 5, t);
    chord(17, 5, t);
    chord(16, 5, t);
    chord(18, 4, t);
    chord(16, 4, t);
    chord(14, 4, t);
    chord(16, 4, t);
    chord(16, 4, t);
    chord(17, 5, t);
    chord(16, 4, t);
    chord(16, 4, t);
    chord(14, 4, t);
    chord(14, 4, t * 4);

    t *= 0.14;

    pull(17, 14, 17, 14, 8);
    pull(19, 14, 17, 14, 1);
    pull(21, 17, 21, 17, 8);
    pull(21, 16, 19, 16, 1);
    pull(19, 16, 19, 16, 8);

    t *= 7;

    chord(17, 5, t);
    chord(17, 6, t * 2);
    chord(17, 5, t);
    chord(17, 5, t * 6);

    t *= 1.05;

    chord(14, 4, t);
    chord(13, 4, t);
    chord(11, 4, t);
    chord(11, 4, t);
    chord(14, 3, t);
    chord(11, 3, t);
    chord(14, 2, t);
    chord(11, 4, t);
    chord(14, 3, t);
    chord(11, 3, t);
    chord(14, 2, t);
    chord(11, 4, t);
    chord(14, 3, t);
    chord(11, 3, t);
    chord(14, 2, t);
    chord(11, 4, t);
    chord(13, 4, t);
    chord(13, 4, t);
    chord(16, 4, t);

    chord(12, 1, t);
    chord(14, 1, t);
    chord(12, 2, t);
    chord(14, 2, t);
    chord(16, 2, t);
    chord(14, 3, t);
    chord(16, 3, t);
    chord(14, 4, t);
    chord(16, 4, t);
    chord(18, 4, t);
    chord(17, 5, t);
    chord(19, 5, t);
    chord(19, 6, t);
    chord(19, 6, t * 5.2);
  }).bind(this);

  this.rightLowerArm.widthAni = new Animation();
  this.rightHand.widthAni = new Animation();

  this.leftUpperLeg.rotationAni.add(1, 0.45);
  this.leftLowerLeg.rotationAni.add(1, -0.54);
  this.rightUpperLeg.rotationAni.add(1, -0.37);
  this.rightLowerLeg.rotationAni.add(1, 0.33);

  this.leftUpperArm.rotationAni.add(1, -0.75);
  this.leftLowerArm.rotationAni.add(1, -1.95);

  this.guitar.rotationAni.add(1, -0.15);

  headBang(1, 5.5, 0);
  headBang(1, 0.76, 1.5);
  headBang(1, 1, 0);

  for (var i = 0; i < 7; i++)
  {
    headBang(3, 0.84, 1.5);
    headBang(1, 1, 0);
  }

  headBang(2, 0.84, 1.5);
  headBang(500, 0.8, 0.5);
  legs(500, 1, 1);

  strum(1, 10, 3);
  chord(12, 3, 0);
  chord(0, 0, 5);
  chord(10, 0, 2);
  chord(7, 3, 4);
  strum(1, 6.5, 0);
  chord(7, 3, 5);
  strum(1, 0.4, 0.5);
  strum(17, 0.12, 0.4);
  chord(15, 5, 1);
  chord(15, 5, 1);
  chord(1, 5, 0.8);
  chord(15, 4, 0.3);
  chord(1, 4, 0.8);

  intro(3);
  preVerse();
  verse();
  interlude();
  chorus();
  intro(1);
  preVerse();
  verse();
  interlude();
  chorus();
  intro(1);
  preVerse();
  preSolo();
  solo();
  intro(3);
  preVerse();
  verse();
  interlude();
  chorus();
  intro(1);
  preVerse();

  this.leftUpperArm.rotationAni.add(3.3, 0.1);
  this.leftLowerArm.rotationAni.add(3.3, 1);
  chord(3, 0, 1);
}

Buttercup.prototype.update = function(ms)
{
  this.body.update(ms);
};

Buttercup.prototype.draw = function()
{
  this.rightUpperArm.draw();
  this.rightLowerArm.draw();

  this.rightLowerLeg.draw();
  this.rightUpperLeg.draw();

  this.leftLowerLeg.draw();
  this.leftUpperLeg.draw();

  this.body.draw();

  this.leftUpperArm.draw();

  this.head.draw();

  this.guitar.draw();

  this.leftLowerArm.draw();
  this.rightHand.draw();
};

Buttercup.prototype.setAniIfNot = function(ani)
{
  if (this.ani != ani) {this.setAni(ani);}
};

Buttercup.prototype.setAni = function(ani)
{
  this.ani.tidyUp();

  this.ani = ani;
  this.ani.reset();
};

Buttercup.prototype.addBodyPart = function(id, width, height, parentJoint, parentJointAngle, parentJointDist, jointAngle, jointDist)
{
  var par = parentJoint == "" ? this : this.getBodyPart(parentJoint);

  var bp = new BodyPart(this, id, width, height, par, parentJointAngle, parentJointDist, jointAngle, jointDist);

  this.bodyParts.set(id, bp);

  return bp;
};

Buttercup.prototype.getBodyPart = function(id)
{
  return this.bodyParts.get(id);
};

Buttercup.prototype.doHFlip = function()
{
  this.x = -this.x;
  this.hFlip = !this.hFlip;
};

Buttercup.prototype.getX = function()
{
  return this.x;
};

Buttercup.prototype.getY = function()
{
  return this.y + this.z;
};

Buttercup.prototype.getZ = function()
{
  return this.z;
};

Buttercup.prototype.getRotation = function()
{
  return this.rotation;
};

Buttercup.prototype.toDelete = function()
{
  return false;
};



function Particle(imageId, x, y, size, xSpeed, ySpeed, fadeStartTime, fadeEndTime)
{
  this.imageId = "Particle/" + imageId;
  this.x = x;
  this.y = y;
  this.size = size;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.fadeStartTime = getTime() + fadeStartTime;
  this.fadeEndTime = getTime() + fadeEndTime;
}

Particle.prototype.update = function()
{
  this.x += this.xSpeed;
  this.y += this.ySpeed;

  this.draw();
};

Particle.prototype.draw = function()
{
  var img = getImage(this.imageId);

  if (img != null)
  {
    ctx.save();

    applyCamera();

    ctx.globalAlpha = this.getFade();

    ctx.drawImage(img, windowSize(this.x), windowSize(this.y), windowSize(this.size), windowSize(this.size));

    ctx.restore();
  }
};

Particle.prototype.getFade = function()
{
  var t = getTime() - this.fadeStartTime;

  return 1 - Math.min(Math.max(t / (this.fadeEndTime - this.fadeStartTime), 0), 1);
};

Particle.prototype.toDelete = function()
{
  return this.getFade() == 0;
};



function Pic(id)
{
  this.loaded = false;
  this.image = new Image();
  this.image.src = getSrc("images2/" + id + ".png");

  this.image.onload = this.loadEvent.bind(this);
}

Pic.prototype.getImage = function()
{
  if (this.loaded) {return this.image;}

  return null;
};

Pic.prototype.loadEvent = function()
{
  this.loaded = true;
};

function loadPics()
{
  f = function(file)
  {
    picMap.set(file, new Pic(file));
  };

  f("Background");

  h = function(name)
  {
    f(name + "/" + "Head");
    f(name + "/" + "Body");
    f(name + "/" + "Left Upper Arm");
    f(name + "/" + "Left Lower Arm");
    f(name + "/" + "Right Upper Arm");
    f(name + "/" + "Right Lower Arm");
    f(name + "/" + "Right Hand");
    f(name + "/" + "Left Upper Leg");
    f(name + "/" + "Left Lower Leg");
    f(name + "/" + "Right Upper Leg");
    f(name + "/" + "Right Lower Leg");
    f(name + "/" + "Guitar");
  };

  h("Buttercup");
}

function getImage(id)
{
  return picMap.get(id).getImage();
}



function ScreenLabel(text, x, y, colour, timeout)
{
  this.text = text;
  this.x = x;
  this.y = y;
  this.colour = colour;
  this.timeout = getTime() + timeout;
}

ScreenLabel.prototype.draw = function()
{
  ctx.save();

  applyCamera();

  ctx.font = windowSize(0.06) + "px Verdana";
  ctx.fillStyle = this.colour;
  ctx.fillText(this.text, windowSize(this.x), windowSize(this.y));

  ctx.restore();
};

ScreenLabel.prototype.toDelete = function()
{
  return getTime() > this.timeout;
};



function SoundController()
{
  this.sounds = [];
  this.music = null;
  this.soundMasterVolume = 1;
  this.musicMasterVolume = 0.3;
  this.fadeVolume = 1;
  this.enabled = true;

  this.setupTracks();
}

SoundController.prototype.setupTracks = function()
{
  this.tracks = new Map();

  this.addMusic("Song", false);
};

SoundController.prototype.update = function()
{
  garbageCollectArray(this.sounds);
};

SoundController.prototype.addSound = function(soundFile, loop)
{
  var s = new Sound(this, soundFile, false, loop);
  this.sounds.push(s);

  s.play();

  return s;
};

SoundController.prototype.addMusic = function(trackName, loop)
{
  var s = new Sound(this, "music/" + trackName, true, loop);
  this.tracks.set(trackName, s);

  return s;
};

SoundController.prototype.setMusic = function(trackName)
{
  var track = this.tracks.get(trackName);

  if (this.music != null) {this.music.stop();}

  this.music = track;
  this.music.play();
};

SoundController.prototype.setFadeVolume = function(v)
{
  this.fadeVolume = v;

  this.resetVolume();
};

SoundController.prototype.resetVolume = function()
{
  for (var i = 0; i < this.sounds.length; i++)
  {
    this.sounds[i].resetVolume();
  }

  if (this.music != null) {this.music.resetVolume();}
};

SoundController.prototype.pauseAll = function()
{
  for (var i = 0; i < this.sounds.length; i++)
  {
    this.sounds[i].stop();
  }

  if (this.music != null) {this.music.stop();}
};

SoundController.prototype.unpauseAll = function()
{
  for (var i = 0; i < this.sounds.length; i++)
  {
    this.sounds[i].unpause();
  }

  if (this.music != null) {this.music.unpause();}
};

SoundController.prototype.clearAll = function()
{
  this.pauseAll();

  this.sounds = [];
  this.music = null;
};

SoundController.prototype.musicHasEnded = function()
{
  if (this.music == null) {return true;}

  return this.music.audio.ended;
};



function Sound(soundController, soundFile, asMusic, loop)
{
  this.soundController = soundController;
  this.soundFile = soundFile;
  this.asMusic = asMusic;
  this.audio = new Audio(getSrc("sounds2/" + this.soundFile + ".mp3"));
  this.setLoop(loop);
  this.setVolume(1);
  this.toTrash = false;
}

Sound.prototype.play = function()
{
  this.audio.currentTime = 0;
  this.audio.play();
};

Sound.prototype.stop = function()
{
  this.audio.pause();
};

Sound.prototype.unpause = function()
{
  if (this.audio.paused) {this.audio.play();}
};

Sound.prototype.endLoop = function()
{
  this.setLoop(false);
};

Sound.prototype.setLoop = function(b)
{
  this.loop = b;
  this.audio.loop = this.loop;
};

Sound.prototype.setVolume = function(v)
{
  this.volume = v;
  this.resetVolume();
};

Sound.prototype.resetVolume = function()
{
  this.audio.volume = this.volume * this.getMasterVolume();
};

Sound.prototype.getMasterVolume = function()
{
  if (this.asMusic)
  {
    return this.soundController.musicMasterVolume * this.soundController.fadeVolume;
  }
  else
  {
    return this.soundController.soundMasterVolume * this.soundController.fadeVolume;
  }
};

Sound.prototype.trash = function()
{
  this.toTrash = true;
};

Sound.prototype.toDelete = function()
{
  if (this.toTrash || !this.loop && this.audio.ended)
  {
    this.stop();
    return true;
  }

  return false;
};
