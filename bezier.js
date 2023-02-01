const container = document.getElementById("container");
const createButton = document.getElementById("create-point");
const itemCounter = document.getElementById("item-count");
const pointList = document.getElementById("point-list");

var points = [];

// Point Object
// Contains x and y position
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() { return this.x; }
    getY() { return this.y; }

    toString() { return `${this.x} ${this.y}` }
}


// Create List Point
// Creates an HTML element containing information about its respective point
function createListPoint(x, y)
{
    // Generate list item components
    let div = document.createElement('div');
    let pointText = document.createElement('span');
    let inputX = document.createElement('input');
    let inputY = document.createElement('input');
    let removeButton = document.createElement('button');

    // Find an ID for the item
    let id = 0;
    while (document.getElementById(`${id}`) != null)
    {
        id++;
    }
    if (id >= 26) return;
    div.id = id;

    div.className = "point-list-item";

    pointText.innerText = `point ${String.fromCharCode(parseInt(div.id) + 97)}`;
    
    inputX.type = "text";
    inputY.type = "text";

    inputX.value = x;
    inputY.value = y;

    inputX.addEventListener("change", () => {
        console.log(div.id + " " + inputX.value);
    })

    inputY.addEventListener("change", () => {
        console.log(div.id + " " + inputY.value);
    })

    removeButton.innerText = "🔪";

    removeButton.addEventListener("click", () => {
        deletePoint(div.id);
    })

    div.appendChild(pointText);
    div.appendChild(inputX);
    div.appendChild(inputY);
    div.appendChild(removeButton);

    points.push(div);
    pointList.appendChild(points[points.length - 1]);

    updateCounter();
}

// Update Counter
// Changes the 
function updateCounter()
{
    let count = pointList.childElementCount;
    let text;
    if (count > 0 && count < 26) text = count + "/26";
    else if (count == 0) text = "";
    else if (count == 26) text = "MAX"

    itemCounter.innerText = text;
}

function createPoint(x, y)
{
    createListPoint(x, y);
}

function deletePoint(parentID)
{
    document.getElementById(parentID).remove();
    console.log(`deleted ${parentID}`);
    updateCounter();
}

createButton.addEventListener("click", () => {
    createPoint(0, 0);
});