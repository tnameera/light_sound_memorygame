/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// global constants
//const clueHoldTime = 1000; //how long to hold each clue's light/sound
const cluePauseTime = 2*333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence


function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function getPattern(){
	var b = [];
  var i;
	var b_len = 8;
  var max = 6;
	for(i=0;i<b_len;i++){
    	b.push(getRandomInt(max)+1)  
  	}
  	return(b) 
}

//Global Variables
var clueHoldTime;
//var pattern = [1, 2, 5, 4, 2, 1, 6, 4];
var pattern; 
var progress = 0; 
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;  //must be between 0.0 and 1.0
var guessCounter = 0; // to check whether the user is in clue sequence
var strikes;
var timer; 
var timeLeft; // seconds

function updateTimer() {
  timeLeft = timeLeft - 1;
  if(timeLeft >= 0)
    document.getElementById("timer").innerHTML = timeLeft;
  else {
    loseGame();
  }
}

function startGame(){
  //initialize game variables
  clueHoldTime = 1000;
  timeLeft = 180; // seconds
  strikes = 0;
  pattern  = getPattern();
  progress = 0;
  gamePlaying = true;
  timer = setInterval(updateTimer, 1000);
  
// swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame(){
  //initialize game variables
  progress = 0;
  gamePlaying = false;
  clearInterval(timer);
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}
// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 392,
  6: 250
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

//add in a function for playing a single clue:
function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

//another function playClueSequence:
function playClueSequence(){
  guessCounter = 0;
  context.resume()
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    updateTimer()
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    //delay += clueHoldTime 
    //so that clueHoldTime delay each time we subtract it
    clueHoldTime = (clueHoldTime - 15);
    delay = delay + clueHoldTime;
    delay = delay + cluePauseTime;
  }
}
//Our final task is to check whether the user is correctly repeating back the clue sequence and respond accordingly.
function loseGame(){
  stopGame();
  clearInterval(timer);
  alert("Game Over. You lost.");
}

//check if user have won the game
function winGame(){
  stopGame();
  clearInterval(timer);
  alert("Yay. You Won");
}

// function for checking each guess 
function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
// add game logic here
  if(pattern[guessCounter] == btn){
      //Guess was correct!
      if(guessCounter == progress){
        if(progress == pattern.length - 1){
          //GAME OVER: WIN!
          winGame();
        }else{
          //Pattern correct. Add next segment
          progress++;
          playClueSequence();
        }
      }else{
        //so far so good... check the next guess
        guessCounter++;
      }
    }else{
      strikes++;
      if (strikes > 2){
      //Guess was incorrect
      //GAME OVER: LOSE!
      loseGame();   
      }
    }
}    

