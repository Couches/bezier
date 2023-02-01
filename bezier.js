const container = document.getElementById("container");
const createButton = document.getElementById("create-point");
const itemCounter = document.getElementById("item-count");
const pointList = document.getElementById("point-list");

const curves = [];

var numPoints = 0;
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

// Set Attribute List
// Sets attributes of an element with a map of properties
function setAttributeList(element, props)
{
    Object.entries(props).forEach(([key, value]) => {
        element.setAttributeNS(null, key, value);
    })
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

    createPointPath(x + id * 10, y + id * 10, id);

    updateCounter();
}

// Create a circle at x and y, then assign id
function createPointPath(x, y, id)
{
    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    text.textContent = `${String.fromCharCode(parseInt(id) + 97)}`;

    setAttributeList(circle, {
        cx: x,
        cy: y,
        r: 6,
        stroke: 'orange',
        "stroke-width": '4px',
        fill: 'transparent',
        id: 'p' + id
    });

    setAttributeList(text, {
        x: x + 5,
        y: y - 5,
        "font-size": "13px",
        id: 't' + id
    })

    container.appendChild(circle);
    container.appendChild(text);
}

// Update Counter
// Changes the 
function updateCounter()
{
    numPoints = pointList.childElementCount;
    let text;
    if (numPoints > 0 && numPoints < 26) text = numPoints + "/26";
    else if (numPoints <= 0) text = "";
    else if (numPoints >= 26) text = "MAX"

    itemCounter.innerText = text;
}

function createPoint(x, y)
{
    createListPoint(x, y);
}

// Delete Point
// Removes point from PointList element and points array
// and point circle from the svg
function deletePoint(parentID)
{
    let target = document.getElementById(parentID);
    points.splice(points.indexOf(target), 1);
    target.remove();

    document.getElementById("p" + parentID).remove();
    document.getElementById("t" + parentID).remove();

    //console.log(`deleted ${parentID}`);
    updateCounter();
}

createButton.addEventListener("click", () => {
    createPoint(100, 100);
});

function generatePath()
{
    
}

//curves.push(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
