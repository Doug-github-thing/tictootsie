const turnMax = 6;

let phase = 'placing' // phases: placing, moving, endgame

let x = true;
let counter = 1;

// when the window loads, builds onclick funciton for each button:
// on click, check what phase you're in, see if click is valid, then make move
window.onload = function() {
    for (i = 1; i < 4; i++)
        for (j = 1; j < 4; j++) {
            const this_box = document.getElementById(i + '' + j);

            // this is where the function is defined for what happens when any square is clicked
            this_box.onclick = function () {
                switch (phase) {
                    case 'placing':
                        if (this_box.innerHTML != '')
                            return;

                        this_box.innerHTML = getXValue();
                        if (counter > 4)
                            checkVictory(this_box.id);

                        switchTurns();
                        break;
                                
                    case 'moving':
                        makeMove(this_box.id);
                        break;

                    default:
                        return;
                }
            }
        }
}

// checks all possible ways the move just made could trigger a win by filling an array with a group of 3 
//    neighboring boxes and then checking if the values in all boxes are equal. If so, it's a win.
function checkVictory(coords) {
    const i = coords[0];
    const j = coords[1];

    let arr = [0, 0, 0];

    // check if all values in that row are the same
    for (q = 1; q < 4; q++)
        arr[q-1] = document.getElementById(q + '' + j);
    checkArr(arr);

    // check if all values in that column are the same
    for (q = 1; q < 4; q++)
        arr[q-1] = document.getElementById(i + '' + q);
    checkArr(arr);

    // if it's on a diagonal, check those too. For the non-diagonals, difference between i and j is +/- 1
    if (diff(Number(i), Number(j)) != 1) {
        // checks the backslash
        for (q = 1; q < 4; q++)
            arr[q-1] = document.getElementById(q + '' + q);
        checkArr(arr);

        // checks the forward slash (couldn't find a more elegant way than hardcoding the array)
        checkArr([document.getElementById('13'), document.getElementById('22'), document.getElementById('31')]);
    }
}

// given an array of length 3 containing squares, checks if they are all equal to see if game is over. If it is, makes it so
function checkArr(arr) {
    if (arr[0].innerHTML == arr[1].innerHTML && arr[1].innerHTML == arr[2].innerHTML) {
        document.getElementById('turn').innerHTML = getXValue().toUpperCase() + ' wins!';
        for(q = 0; q < 3; q++) {
            addClassToBox(arr[q], 'selected');
            arr[q].className = arr[q].className.replace(' closed', '')
        }
        endTheGame();
    }
}

let lastCoords = '00';
// called when a valid square is initially clicked during move phase
// Each turn in move phase involves 2 clicks, one to select which piece to move, and where to move it 
function makeMove(coords) {

    const clickedBox = document.getElementById(coords);
    // to allow for changing your mind on which piece to move, check if you've clicked one of your pieces, clean up all
    // open spaces before searching for new spaces
    if (clickedBox.innerHTML == getXValue()) {
        let abort = false;
        if (clickedBox.className.includes('selected'))
            abort = true;
        
        cleanUpOpenBoxes();
        counter = 0;

        if (abort)
            return;
    }

    // if counter % 2 checks if this is first or second click of the turn
    if (counter % 2 == 0) {

        if (clickedBox.innerHTML == getXValue()) {
            // array of open squares in movement phase
            let arr = [0, 0, 0];

            let arr_counter = 0;
            for (i = 1; i < 4; i++)
                for (j = 1; j < 4; j++) {
                    const this_box = document.getElementById(i + '' + j);
                    if (this_box.innerHTML == '') {
                        arr[arr_counter] = this_box;
                        arr_counter++;
                    }
                }

            const thisSum = sum(coords);

            var foundBox = false;
            for (q = 0; q < 3; q++) {
                const this_box = arr[q];
                // if the clicked on box is adjacent to an open space (is it only a distance of 1, and in same row or col?)
                // 2 3 4
                // 3 4 5
                // 4 5 6
                if (diff(thisSum, sum(this_box.id)) == 1)
                    if (coords[0] == this_box.id[0] || coords[1] == this_box.id[1]) {
                        addClassToBox(clickedBox, 'selected');
                        addClassToBox(arr[q], 'open');
                        lastCoords = coords;
                        foundBox = true;
                    }
                }
            }

            // if no open boxes adjacent to the clicked on square, will not increment counter.
            // if it finds at least 1 box, it will advance the turns
            if (foundBox)
                counter++;
    }

    if (counter % 2 == 1) {

        const newBox = clickedBox;  
        const oldBox = document.getElementById(lastCoords);

        if (newBox.className.includes('open')) {

            // if a valid open space is selected, find all open spaces and close them
            cleanUpOpenBoxes();
            
            oldBox.innerHTML = '';
            newBox.innerHTML = getXValue();

            addClassToBox(newBox, 'closed');

            checkVictory(newBox.id);
            switchTurns();
        }
    }
}

// iterates the turn counter, switches whose turn it is, changes phase if it's time for that
function switchTurns() {
    if (phase == 'endgame')
        return;

    x = x ? false : true;
    document.getElementById('turn').innerHTML = getXValue().toUpperCase() + "'s turn!";
    if (phase == 'placing' && counter == turnMax) {
        document.getElementById('phase').innerHTML = "Moving phase";
        phase = 'moving';
        counter = 0;
        return;
    }
    counter++;
}

// freezes mouseover animations
function endTheGame() {
    document.getElementById('phase').innerHTML = "Game ogre";
      
    const styleSheet = document.styleSheets[0];
    const len = styleSheet.length;

    const newHoverRule = ".board div:hover {cursor: default; background-color: teal !important;}";
    const newHoverRuleSelected = ".board .selected:hover {background-color: aqua !important;}";
    styleSheet.insertRule(newHoverRule, len);
    styleSheet.insertRule(newHoverRuleSelected, len + 1);

    // make replay button light up when game ends
    document.getElementById('reload').style.color = 'aqua'; 

    phase = 'endgame';
}

// util functions

function cleanUpOpenBoxes() {
    for (i = 1; i < 4; i++)
        for (j = 1; j < 4; j++) {
            const this_box = document.getElementById(i + '' + j);
            const classText = this_box.className;
                this_box.className = classText.replace(' open', '').replace(' closed','').replace(' selected','');
        }
}

// given a box element and text indicating what class to add to the element, adds class
function addClassToBox(box, classText) {
    if (!box.className.includes(classText))
        box.className = box.className + ' ' + classText;
}

// get a string value for who's turn it is
function getXValue() {
    return x ? 'x' : 'o';
}

// faster abs syntax difference between two nums
function diff(x, y) {
    return Math.abs(x - y);
}

// for a given 2 digit number (an id of box element), returns sum of two digits
function sum(num) {
    return Number(num[0]) + Number(num[1]);
}