console.log('Loading script...');

//////
//// HARD CODED GAME SETTINGS

// game over array size (non-inclusive)
let limit = 5;

// refresh every ms data
let refreshMS = 2000;

// frames per second
let FPS = 1000 / 60;

// timer won condition
let timer = 10000; //10 sec

// time to next stage
let nextStageTime = 8000;
//////

// STATE MANAGER

// idle -- default waiting for user to start
let game = 'over';

// start -- when start button is clicked, begin game loop
// gameStart should not do anything if there is an ongoing game
let gameStart = () => {
    if (game === 'over' || game === 'win'){
        game = 'start';
        reset();
        showSideBar();
        startAllLoops();
        userInputText.focus();
        console.log(game,"--- gameStart")
    }
}
// over -- end all operations and reset to default and set back to
let gameOver = () => {
    game = 'over';
    console.log(game,"--- gameOver")
}

// rest data and display to default values
let reset = () => {
    resetDisplay();
    resetData();
    resetInput();
    stage = 1;
}


// DATA HANDLING -- checks for changes in data


let stageText = [['1','1','1'],
                 ['2','2','2'],
                 ['black','3','3'],]

let color = ['green', 'blue', 'red']

class box {
    // arr can be changed to use any data set
    constructor(arr){
        var newBox = document.createElement('div');
        var insideText = document.createElement('p')
        var word = this.randomText(arr)
        insideText.innerText = word;
        newBox.appendChild(insideText);
        switch(stage){
            case 1:
                this.word = word;
                this.box = newBox;
                break;
            case 2:
                var randColor = this.randomColor();
                this.word = randColor;
                newBox.style.backgroundColor = randColor;
                this.box = newBox;
                break;
            case 3:
                this.word = word;
                this.box = newBox;
        }
}
    // create new boxes with random text
    randomText (arr) {
        var index  = Math.floor(Math.random() * arr.length)
        return arr[index];
    }

    randomColor () {
        var index  = Math.floor(Math.random() * color.length)
        return color[index];
    }
}


// add box to active every gameloop
let activeBox = [];


// add boxes according to stages
//
let updateBox = (arr) => {
    var newBox = new box(arr[stage-1]);
    activeBox.push(newBox)
    console.log(activeBox)
}

// NOTE: expensive to look up and delete in array
// consider hashmap with linked lists
// returns true if deleted false if not found indicating invalid input
let lastDelete = '';

let deleteBox = (arr, word) => {
    //check for first occurance and delete it
    let index = -1
    for (var i = 0; i < arr.length; i++) {
        console.log(arr[i].word, word,'--- deleteBox')
        if (arr[i].word === word){
            if (word === 'black') {
                handleGameEnd();
            }
            index = i;
            break
        }
    }
    //if only word exists
    if (index > -1) {
        arr = arr.splice(index, 1)
        lastDelete = word;
        addScore();
        console.log("Deleted ---",word,"--- deleteBox")
        return true
    } else {
        console.log(word + '.not found! --- deleteBox')
        return false
    }
}

let deleteBlackBox = () => {
    if (activeBox[0].word === 'black'){
        activeBox.shift();
    }
}


// after deletion increment score
let score = 0;

let addScore = () => {
    score++;
    handleStageTimer();
}


// reset data to default
let resetData = () => {
    activeBox = [];
    score = 0;
    lastDelete = '';
}




// USER HANDLING
// during game start
// record the user input only onchange and compare to the exist

let userInputText = document.querySelector('#user-input');

userInputText.addEventListener('keypress',(event)=>{handleSpaceDown(event)});
userInputText.addEventListener('input',(event)=>{handleInput(event)});


let currentInput;
let handleSpaceDown = (event) => {
    if (game === 'start' && (event.key === " " || event.key === "Enter")) {
        currentInput = event.target.value;
        event.target.value = '';
        deleteBox(activeBox, currentInput)
        // force the new display
        showActive()
        showSideBar()
    } else if (game !== 'start' && event.key === " ") {
        event.target.value = '';
    }
}

let handleInput = (event) => {
    if (event.target.value === " "){
        event.target.value = '';
    }
}

let resetInput = () => {
    userInputText.value = '';
}



// DISPLAY HANDLING -- updates to show things

// show all active box in display game div starting with the oldest
let display = document.querySelector('.display-game');
let showActive = () => {
    display.innerHTML = '';
    for (var i = activeBox.length - 1; i > -1 ; i--) {
        display.appendChild(activeBox[i].box);
    }
}

// show game state in the side bar
// show point system
let gameHeading = document.querySelector('.game-state>p');
let stageHeading = document.querySelector('.game-stage>p');
let scoreHeading = document.querySelector('.score>p');
let lastDelHeading = document.querySelector('.last-delete>p');

let showSideBar = () => {
    gameHeading.innerText = game;
    stageHeading.innerText = stage;
    scoreHeading.innerText = score;
    lastDelHeading.innerText = lastDelete;
}


// change the displays to the default
let resetDisplay = () => {
    display.innerText = 'DISPLAY'
    gameHeading.innerText = game;
}




///// ALL LOOPS /////
let startAllLoops = () => {
    startStageLoop();
//    startStageTimer();
    startGameLoop();
}

let endAllLoops = () => {
    endStageLoop();
    endGameLoop();
}


// Data loops + stage tracker
let stage = 1;
let stageLoop;
let stageTimer;


let startStageLoop = () => {
    stageLoop = setInterval(()=>{updateData();},refreshMS)
    console.log('--- startStageLoop')
}


let endStageLoop = () => {
    clearInterval(stageLoop);
    console.log('--- endStageLoop')
}

let updateData = () => {
    updateBox(stageText);
}

// progress stages till stage complete
// let startStageTimer = () => {
//     stageTimer = setTimeout(()=>{handleStageTimer();}, nextStageTime)
//     console.log('---startStageTimer')
// }

let handleStageTimer = () => {
    switch(score){
        case 10:
            stage = 2;
            console.log(stage,'---handleStageTimer')
//            startStageTimer();
            break;
        case 15:
            stage = 3;
            console.log(stage,'---handleStageTimer')
//            startStageTimer();
            break;
        case 20:
            game = 'win'
            handleGameWon();
            console.log('won ---handleStageTimer')
            break;
    }
}

//let endStageTimer = () => {
//    clearTimeout(stageTimer);
//}





// GAME LOOP --
// check for changes in display, data and game state
let gameLoop;
let gameTimer;

let startGameLoop = () => {
    gameLoop = setInterval(()=>{updateDisplay();}, FPS);
    //gameTimer = setTimeout(()=> {isGameWon();}, timer)
    console.log("--- startGameLoop")
}

let endGameLoop = () => {
    clearInterval(gameLoop);
    console.log("--- endGameLoop")
}

// check active length equals limit
let isGameOver = () => {
    if (activeBox.length === limit){
        deleteBlackBox();
        if (activeBox.length === limit){
            console.log("--- isGameOver")
            return true
        }
    } else {
        return false
    }
}

//check won condition
let isGameWon = () => {
    // as long you have not lost, you won
    if (game !== 'over') {
        game = 'won';
        console.log(game,'--- isGameWon')
        handleGameWon();
        return true
    } else {
        return false
    }
}

let handleGameWon = () => {
    endAllLoops();
    console.log(game)
    showSideBar()
}

// update game shld only check for win loss conditions not data handling

// double check logic when to check for endgame
let updateDisplay = () => {
    showSideBar();
    showActive();
    if (isGameOver()){
        handleGameEnd();
    }
    //console.log(game,"--- updateDisplay")
}

let handleGameEnd = () => {
    clearTimeout(gameTimer);
//    endStageTimer();
    endAllLoops();
    gameOver();
}












console.log('Script loaded!');