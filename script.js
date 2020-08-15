console.log('Loading script...');

//////
// game over array size (non-inclusive)
let limit = 5;

// refresh every ms
let refreshMS = 1000;

//////

// STATE MANAGER

// idle -- default waiting for user to start
let game = 'idle';

// start -- when start button is clicked, begin game loop
// gameStart should not do anything if there is an ongoing game
let gameStart = () => {
    if (game !== start){
        game = 'start'
        startGameLoop();
        console.log(game,"--- gameStart")
    }
}
// over -- end all operations and reset to default and set back to
let gameOver = () => {
    game = 'over'
    console.log(game,"--- gameOver")
}



// DATA HANDLING -- checks for changes in data

// create new boxes with random text
let textArr = ['text', 'abc', 'try', 'people'];

let randomText = (arr) => {
    var index  = Math.floor(Math.random() * arr.length)
    return arr[index];
}

// textArr can be changed to use any data set
let createBox = (arr) => {
    var newBox = document.createElement('div');
    var insideText = document.createElement('p')
    var word = randomText(arr)
    insideText.innerText = word;

    newBox.appendChild(insideText);
    var boxObj = {}
    boxObj['word'] = word;
    boxObj['box'] = newBox;
    return boxObj;
}

// add box to active every gameloop
let activeBox = [];

let updateBox = (arr) => {
    var newBox = createBox(arr);
    activeBox.push(newBox)
}

// NOTE: expensive to look up and delete in array
// consider hashmap with linked lists
// returns true if deleted false if not found indicating invalid input
let deleteBox = (arr, word) => {
    //check for first occurance and delete it

    let index = -1;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].word === word){
            index = i;
            break
        }
    }
    //if only word exists
    if (index > -1) {
        arr = arr.splice(index, 1)
        console.log(word,"--- deleteBox")
        return true
    } else {
        console.log('not found! --- deleteBox')
        return false
    }
}

// USER HANDLING
// during game start
// record the user input only onchange and compare to the exist
let currentInput;
let handleChange = (event) => {
    if (game === 'start') {
        currentInput = event.target.value;
        deleteBox(activeBox, currentInput)
        // force the new display
        showActive()
    } else {
        alert('Start the damn game!')
    }
    event.target.value = '';
}




// DISPLAY HANDLING -- updates to show things
let display = document.querySelector('.display-game');

// show all active box in display game div starting with the oldest
let showActive = () => {
    display.innerHTML = null;
    for (var i = 0; i < activeBox.length; i++) {
        display.appendChild(activeBox[i].box);
    }
    console.log(activeBox,"--- showActive")

}


// GAME LOOP -- updates game every 5 seconds
// check for changes in display, data and game state
let gameLoop;

let startGameLoop = () => {
    gameLoop = setInterval(()=>{updateGame();}, refreshMS);
    console.log("--- startGameLoop")
}

let endGameLoop = () => {
    clearInterval(gameLoop);
    console.log("--- endGameLoop")
}

// check active length equals limit
let checkGameOver = () => {
    if (activeBox.length === limit){
        console.log("--- checkGameOver")
        return true
    } else {
        return false
    }
}

// update all check data first then end/win condition then gamestate then display
// double check logic when to check for endgame
let updateGame = () => {
    updateBox(textArr);
    if (checkGameOver()){
        endGameLoop();
        gameOver();
    } else {
        showActive();
    }
    console.log(game,"--- updateGame")
}










console.log('Script loaded!');