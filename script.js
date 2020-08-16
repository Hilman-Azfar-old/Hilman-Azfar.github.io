console.log('Loading script...');

//////
//// HARD CODED GAME SETTINGS

// game over array size (non-inclusive)
let limit = 5;

// refresh every ms
let refreshMS = 1200;

// timer won condition
let timer = 10000; //10 sec
//////

// STATE MANAGER

// idle -- default waiting for user to start
let game = 'idle';

// start -- when start button is clicked, begin game loop
// gameStart should not do anything if there is an ongoing game
let gameStart = () => {
    if (game !== start){
        game = 'start';
        startGameLoop();
        userInputText.focus();
        console.log(game,"--- gameStart")
    }
}
// over -- end all operations and reset to default and set back to
let gameOver = () => {
    game = 'over';
    console.log(game,"--- gameOver")
}


// DATA HANDLING -- checks for changes in data

let textArr = ['toy', 'abc', 'try', 'get'];



class box {
    // arr can be changed to use any data set
    constructor(arr){
        var newBox = document.createElement('div');
        var insideText = document.createElement('p')
        var word = this.randomText(arr)
        insideText.innerText = word;
        newBox.appendChild(insideText);
        this.word = word;
        this.box = newBox;
    }
    // create new boxes with random text
    randomText (arr) {
        var index  = Math.floor(Math.random() * arr.length)
        return arr[index];
    }
}


// add box to active every gameloop
let activeBox = [];

let updateBox = (arr) => {
    var newBox = new box(arr);
    activeBox.push(newBox)
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

// after deletion increment score
let score = 0;

let addScore = () => {
    score++;
}


// reset data to default
let resetData = () => {
    activeBox = [];
    score = 0;
}




// USER HANDLING
// during game start
// record the user input only onchange and compare to the exist

let userInputText = document.querySelector('#user-input');

userInputText.addEventListener('keypress',(event)=>{handleSpaceDown(event)});
userInputText.addEventListener('input',(event)=>{handleInput(event)});


let currentInput;
let handleSpaceDown = (event) => {
    if (game === 'start' && event.key === " ") {
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
let scoreHeading = document.querySelector('.score>p');
let lastDelHeading = document.querySelector('.last-delete>p');

let showSideBar = () => {
    gameHeading.innerText = game;
    scoreHeading.innerText = score;
    lastDelHeading.innerText = lastDelete;
}


// change the displays to the default
let resetDisplay = () => {
    display.innerText = 'DISPLAY'
    gameHeading.innerText = game;
}






// GAME LOOP -- updates game every 5 seconds
// check for changes in display, data and game state
let gameLoop;

let startGameLoop = () => {
    gameLoop = setInterval(()=>{updateGame();}, refreshMS);
    gameTimer = setTimeout(()=>{isGameWon();}, timer)
    console.log("--- startGameLoop")
}

let endGameLoop = () => {
    clearInterval(gameLoop);
    console.log("--- endGameLoop")
}

// check active length equals limit
let isGameOver = () => {
    if (activeBox.length === limit){
        console.log("--- isGameOver")
        return true
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

// rest data and display to default values
let reset = () => {
    resetDisplay();
    resetData();
    game = 'idle';
}

// update all check data first then end/won condition then gamestate then display
// double check logic when to check for endgame
let updateGame = () => {
    updateBox(textArr);
    showSideBar();
    showActive();
    if (isGameOver()){
        handleGameEnd();
    }

    console.log(game,"--- updateGame")
}

let handleGameEnd = () => {
    clearTimeout(gameTimer);
    endGameLoop();
    gameOver();
    reset();
}

let handleGameWon = () => {
    endGameLoop();
    reset();
}








console.log('Script loaded!');