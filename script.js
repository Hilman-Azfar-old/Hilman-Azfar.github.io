console.log('Loading script...');

//////
//// HARD CODED GAME SETTINGS

// game over array size (non-inclusive)
//let limit = 5;

// refresh every ms data
let refreshMS = 900;

// frames per second
let FPS = 1000 / 60;

// timer won condition
let timer = 10000; //10 sec

// time to next stage
let nextStageTime = 8000;

// secret word
let endWord = 'trap';
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
    console.log("--- gameOver")
}

// rest data and display to default values
let reset = () => {
    resetDisplay();
    resetData();
    resetInput();
    stage = 1;
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
        //showActive()
        showSideBar()
    } else if (game !== 'start' && (event.key === " " || event.key === "Enter")) {
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




///
// DATA HANDLING -- checks for changes in data
///

let stageText = [['get','it','right'],
                 ['red','blue','green'],
                 ['trap','truman','jerome'],]

let color = ['green', 'blue', 'red']


let display = document.querySelector('.display-game');

class box {
    // arr can be changed to use any data set
    constructor(arr){
        var newBox = document.createElement('div');
        newBox.classList.add('move');
        var insideText = document.createElement('p')
        var word = this.randomText(arr)
        insideText.innerText = word;
        newBox.appendChild(insideText);

        // positioning
        this.x = 800;
        newBox.style.right = this.x + 'px';

        let y = Math.floor(Math.random() * 350);
        this.y = y;
        newBox.style.top = y + 'px';
        this.velocity = 2;

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

    // display
    showBox () {
        display.appendChild(this.box);
    }


    // update position
    updatePosition () {
        this.x = this.x - this.velocity
        let newPos = this.x + 'px';

        this.box.style.right = newPos;
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
    newBox.showBox();
    activeBox.push(newBox)
}

// NOTE: expensive to look up and delete in array
// consider hashmap with linked lists
// returns true if deleted false if not found indicating invalid input
let lastDelete = '';

let deleteBox = (arr, word) => {
    //check for first occurance and delete it
    let index = -1;
    let child = null;
    for (var i = 0; i < arr.length; i++) {
        console.log(arr[i].word, word,'--- deleteBox')
        if (arr[i].word === word){
            if (word === 'trap') {
                handleGameEnd();
            }
            child = arr[i].box;
            index = i;
            break
        }
    }
    //if only word exists
    if (index > -1) {
        // remove from screen
        display.removeChild(child);

        // remove from array
        arr = arr.splice(index, 1)
        lastDelete = word;
        if (updateCombo()){
            addScore(100);
        }
        addScore(10);
        console.log("Deleted ---",word,"--- deleteBox")
        return true
    } else {
        console.log(word + 'not found! --- deleteBox')
        return false
    }
}

let deleteTrapBox = () => {
    if (activeBox[0].word === 'trap'){
        display.removeChild(activeBox[0].box)
        activeBox.shift();
    }
}


// after deletion increment score
let score = 0;

let addScore = (num) => {
    score += num;
    handleStageTimer();
}


// reset data to default
let resetData = () => {
    activeBox = [];
    score = 0;
    lastDelete = '';
}

// combo will be an array of deleted word in specific order

const combo = ['get','it','right'];
let activeCombo = [];

let updateCombo = () => {
    comboLength = activeCombo.length;
    if ( comboLength === 0 && lastDelete === combo[0]){
        activeCombo[0] = lastDelete;
        return
    } else if ( comboLength === 1 && lastDelete === combo[1]){
        activeCombo[1] = lastDelete;
        return
    } else if ( comboLength === 2 && lastDelete === combo[2]){
        activeCombo = [];
        console.log('combo successful! --- isCombo')
        return true
    }
    activeCombo = [];
    return false
}



// DISPLAY HANDLING -- updates to show things

// show all active box in display game div starting with the oldest
// let display = document.querySelector('.display-game');
// let showActive = () => {
//     display.innerHTML = '';
//     for (var i = activeBox.length - 1; i > -1 ; i--) {
//         display.appendChild(activeBox[i].box);
//     }
// }

// show game state in the side bar
// show point system
let gameHeading = document.querySelector('.game-state>p');
let stageHeading = document.querySelector('.game-stage>p');
let scoreHeading = document.querySelector('.score>p');
let lastDelHeading = document.querySelector('.last-delete>p');
let comboHeading = document.querySelector('.combo>p');

let showSideBar = () => {

    var comboHeadingText = () => {
        var concat = '';
        for (var i = 0; i < activeCombo.length; i++) {
            concat = concat + ' ' + activeCombo[i];
        }
        return concat
    }
    gameHeading.innerText = game;
    stageHeading.innerText = stage;
    scoreHeading.innerText = score;
    lastDelHeading.innerText = lastDelete;
    comboHeading.innerText = comboHeadingText();
}


// change the displays to the default
let resetDisplay = () => {
    display.innerHTML = ''
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

    if (score > 400){
        game = 'win'
        handleGameWon();
        console.log('won ---handleStageTimer')
    } else if (score > 350){
        stage = 3;
        console.log(stage,'---handleStageTimer')
//      startStageTimer();
    } else if (score > 200){
        stage = 2;
        console.log(stage,'---handleStageTimer')
//      startStageTimer();
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
// let isGameOver = () => {
//     if (activeBox.length === limit){
//         deleteTrapBox();
//         if (activeBox.length === limit){
//             console.log("--- isGameOver")
//             return true
//         }
//     } else {
//         return false
//     }
// }

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
    //showActive();

    // go thru the array and update all the obj position
    // check if box at end of screen
    // if normal lose
    // if trap delete
    // not at end update
    let endScreen = 0;

    for (var i = 0; i < activeBox.length; i++) {
        activeBox[i].updatePosition();
        console.log('/// ping ///')
        if (activeBox[i].x < endScreen && activeBox[i].word === endWord){
            console.log('trap detected');
            deleteTrapBox();
        } else if (activeBox[i].x < endScreen){
            handleGameEnd();
            return;
        }
    }

    // if (isGameOver()){
    //     handleGameEnd();
    // }
    //console.log(game,"--- updateDisplay")
}

let handleGameEnd = () => {
    clearTimeout(gameTimer);
//    endStageTimer();
    endAllLoops();
    gameOver();
    showSideBar();
    console.log("--- handleGameEnd")
}












console.log('Script loaded!');