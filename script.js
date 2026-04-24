const size = 18;

const across = [
    {q: "Rim davlatining boshqaruv shakli", a: "RESPUBLIKA"},
    {q: "Gladiatorlar jang qiladigan joy", a: "KOLIZEY"},
    {q: "Rim askarlari", a: "LEGION"},
    {q: "Rim markaziy maydoni", a: "FORUM"},
    {q: "Boy tabaqa vakillari", a: "PATRISIY"},
    {q: "Qadimgi Rim uyi", a: "DOMUS"},
    {q: "Rim yozuv tizimi", a: "LOTIN"},
    {q: "Qullar mehnatiga asoslangan tizim", a: "QULLIK"},
    {q: "Rimdagi xalq yig‘ini", a: "KOMITSIYA"},
    {q: "Harbiy boshliq", a: "GENERAL"},
    {q: "Rim yo‘llari nimadan qurilgan", a: "TOSH"},
    {q: "Savdo qilinadigan joy", a: "BOZOR"}
];

const down = [
    {q: "Mashhur sarkarda Sezar ismi", a: "YULIY"},
    {q: "Oddiy xalq vakillari", a: "PLEBEY"},
    {q: "Rim poytaxti", a: "RIM"},
    {q: "Rim imperatori unvoni", a: "IMPERATOR"},
    {q: "Rim qonunlari yozilgan jadval", a: "QONUN"},
    {q: "Rimda suv olib keluvchi inshoot", a: "AKVEDUK"},
    {q: "Rim armiyasi bo‘linmasi", a: "KOHORTA"},
    {q: "Rim xudolaridan biri", a: "YUPITER"},
    {q: "Rimda qullar ishlatilgan joy", a: "FERMA"},
    {q: "Rim askarining quroli", a: "QILICH"}
];

const allWords = [...across, ...down];

let grid = [];
let selected = [];
let startCell = null;
let direction = null;
let isSelecting = false;

/* GRID */
function createGrid() {
    const container = document.getElementById("grid");

    for (let i = 0; i < size; i++) {
        grid[i] = [];
        for (let j = 0; j < size; j++) {

            let div = document.createElement("div");
            div.classList.add("cell");
            div.dataset.row = i;
            div.dataset.col = j;

            container.appendChild(div);
            grid[i][j] = div;

            div.addEventListener("mousedown", start);
            div.addEventListener("mouseover", move);

            div.addEventListener("touchstart", touchStart);
            div.addEventListener("touchmove", touchMove);
        }
    }
}

/* RANDOM */
function randomLetter() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[Math.floor(Math.random() * letters.length)];
}

/* PLACE WORDS */
function placeWords() {

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            grid[i][j].textContent = "";
        }
    }

    allWords.forEach(word => {
        let placed = false;

        while (!placed) {
            let dir = Math.random() > 0.5 ? "across" : "down";
            let row = Math.floor(Math.random() * size);
            let col = Math.floor(Math.random() * size);

            let fits = true;

            for (let i = 0; i < word.a.length; i++) {
                let r = row + (dir === "down" ? i : 0);
                let c = col + (dir === "across" ? i : 0);

                if (r >= size || c >= size) { fits = false; break; }

                let current = grid[r][c].textContent;
                if (current !== "" && current !== word.a[i]) {
                    fits = false; break;
                }
            }

            if (fits) {
                for (let i = 0; i < word.a.length; i++) {
                    let r = row + (dir === "down" ? i : 0);
                    let c = col + (dir === "across" ? i : 0);
                    grid[r][c].textContent = word.a[i];
                }
                placed = true;
            }
        }
    });

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j].textContent === "") {
                grid[i][j].textContent = randomLetter();
            }
        }
    }
}

/* QUESTIONS */
function loadQuestions() {
    const acrossList = document.getElementById("across");
    const downList = document.getElementById("down");

    across.forEach(w => {
        let li = document.createElement("li");
        li.textContent = w.q;
        li.dataset.answer = w.a;
        acrossList.appendChild(li);
    });

    down.forEach(w => {
        let li = document.createElement("li");
        li.textContent = w.q;
        li.dataset.answer = w.a;
        downList.appendChild(li);
    });
}

/* START */
function start(e) {
    begin(e.target);
}

function touchStart(e) {
    e.preventDefault();
    let cell = e.target.closest(".cell");
    if (cell) begin(cell);
}

function begin(cell) {
    clear();
    isSelecting = true;
    startCell = cell;
    selected = [cell];
    direction = null;
    cell.classList.add("selected");
}

/* MOVE */
function move(e) {
    if (!isSelecting) return;
    handle(e.target);
}

function touchMove(e) {
    e.preventDefault();
    let t = e.touches[0];
    let el = document.elementFromPoint(t.clientX, t.clientY);
    if (el && el.classList.contains("cell")) handle(el);
}

function handle(cell) {
    if (!cell || selected.includes(cell)) return;

    let r1 = +startCell.dataset.row;
    let c1 = +startCell.dataset.col;
    let r2 = +cell.dataset.row;
    let c2 = +cell.dataset.col;

    let dr = r2 - r1;
    let dc = c2 - c1;

    if (!direction) {
        if (dr === 0 && dc !== 0) direction = "across";
        else if (dc === 0 && dr !== 0) direction = "down";
        else return;
    }

    if (direction === "across" && dr !== 0) return;
    if (direction === "down" && dc !== 0) return;

    selected.push(cell);
    cell.classList.add("selected");
}

/* END */
document.addEventListener("mouseup", finish);
document.addEventListener("touchend", finish);

function finish() {
    if (!isSelecting) return;
    isSelecting = false;
    check();
}

/* CHECK */
function check() {
    let word = selected.map(c => c.textContent).join("");

    let found = allWords.find(w => w.a === word);

    if (found) {
        selected.forEach(c => {
            c.classList.remove("selected");
            c.classList.add("found");
        });

        markQuestion(found.a);
    } else {
        clear();
    }
}

/* MARK QUESTION */
function markQuestion(answer) {
    let q = document.querySelector(`[data-answer="${answer}"]`);
    if (!q) return;

    q.classList.add("done");
}

/* CLEAR */
function clear() {
    selected.forEach(c => c.classList.remove("selected"));
    selected = [];
}

/* INIT */
createGrid();
placeWords();
loadQuestions();
