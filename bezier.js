// HTML Elements
const container = document.getElementById("container");

const createPointButton = document.getElementById("create-point");
const createPathButton = document.getElementById("create-path");

const pointCounter = document.getElementById("point-count");
const pathCounter = document.getElementById("path-count");

const pointList = document.getElementById("point-list");
const pathList = document.getElementById("path-list");

// Global Variables
const POINT_RADIUS = 7;

var numPoints = 0;
var numPaths = 0;
var pointListElements = [];
var points = [];

// Point Definition
// Contains x and y position
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = createListPoint(this);
        this.createSVG();
        pointList.appendChild(this.element);
        
        updateCounter();
    }

    // Point Getters
    getX() { return this.x; }
    getY() { return this.y; }

    // Point Setters
    setX(x) { 
        this.x = x;
        this.update();
    }

    setY(y) {
        this.y = y;
        this.update();
    }

    // Remove Point
    remove() {
        this.element.remove();
        this.pointSVG.remove();
        updateCounter();
    }

    createSVG()
    {
        this.pointSVG = createSVG('circle');
        
        setAttributeList(this.pointSVG, {
            r: POINT_RADIUS,
            fill: this.color
        })

        container.appendChild(this.pointSVG);
        this.update();
    }

    update()
    {
        setAttributeList(this.pointSVG, {
            cx: this.x,
            cy: this.y,
        })
    }

    // Returns point information in string form
    toString() { return `{x: ${this.x}, y: ${this.y}}` }
}

// Path Definition
// Contains list of points to draw curves
class Path {
    constructor()
    {
        this.pathPoints = [];
        this.element = createListPath(this);
        pathList.appendChild(this.element);
        console.log("created");

        updateCounter();
    }

    addPoint(point) {
        this.pathPoints.push(point);
    }

    removePoint(point) {
        this.pathPoints.splice(this.pathPoints.indexOf(point), 1);
    }

    remove()
    {
        this.element.remove();
        updateCounter();
    }

    toString()
    {
        let string = "";

        for (let i = 0; i < this.pathPoints.length; i++)
        {
            string += (this.pathPoints[i] + ", ");
        }

        return string;
    }
}


// Create random number within range
function random(min, max)
{
    return Math.floor(Math.random() * (max - min)) + min;
}

// Set Attribute List
// Sets attributes of an element with a map of properties
function setAttributeList(element, props)
{
    Object.entries(props).forEach(([key, value]) => {
        element.setAttributeNS(null, key, value);
    })
}

function createRemoveButton(element)
{
    let removeButton = document.createElement('button');  

    removeButton.innerText = "🔪";
    removeButton.className = "remove-button";

    removeButton.addEventListener("click", () => {
        element.remove();
    })

    return removeButton;
}

function createListPath(path)
{
    let pathContainer = document.createElement('div');
    let pathText = document.createElement('span');
    
    
    // Find an ID for the item
    let pathID = 0;
    
    while (document.getElementById(`path${pathID}`) != null)
    {
        pathID++;
    }
    if (pathID >= 5) return;

    pathContainer.id = `path${pathID}`;
    pathContainer.className = "list-item path-list-item";

    pathText.innerText = `path ${String.fromCharCode(parseInt(pathID) + 97).toUpperCase()}`


    pathContainer.appendChild(pathText);
    pathContainer.appendChild(createRemoveButton(path))

    return pathContainer;
}

// Create List Point
// Creates an HTML element containing information about its respective point
function createListPoint(point)
{
    // Generate list item components
    let pointContainer = document.createElement('div');
    let pointText = document.createElement('span');
    let inputX = document.createElement('input');
    let inputY = document.createElement('input');

    // Find an ID for the item
    let id = 0;
    while (document.getElementById(`point${id}`) != null)
    {
        id++;
    }
    if (id >= 26) return;

    // Assign attributes of item components
    pointContainer.id = `point${id}`;
    pointContainer.className = "list-item point-list-item";

    pointText.innerText = `point ${String.fromCharCode(parseInt(id) + 97).toUpperCase()}`;
    
    inputX.type = "text";
    inputY.type = "text";

    inputX.value = point.getX();
    inputY.value = point.getY();

    // Add event listeners to item components
    inputX.addEventListener("change", () => {
        point.setX(inputX.value);
        console.log(point.getX());
    })

    inputY.addEventListener("change", () => {
        point.setY(inputY.value)
        console.log(point.getY());
    })


    // Append components to the container
    pointContainer.appendChild(pointText);
    pointContainer.appendChild(inputX);
    pointContainer.appendChild(inputY);
    pointContainer.appendChild(createRemoveButton(point));
    
    return pointContainer;
}



// Update Counter
// Changes the counter on create point button 
function updateCounter()
{
    numPoints = pointList.childElementCount;
    numPaths = pathList.childElementCount;
    createPointButton.classList.remove("disabled");

    // Point Counter Code
    let pointCounterText;
    if (numPoints > 0 && numPoints < 10) pointCounterText = numPoints + "/10";
    else if (numPoints <= 0) pointCounterText = "";
    else if (numPoints >= 10)
    {
        pointCounterText = "MAX"
        createPointButton.classList.add("disabled");
    }

    pointCounter.innerText = pointCounterText;

    // Path Counter Code
    let pathCounterText;
    if (numPaths > 0 && numPaths < 5) pathCounterText = numPaths + "/5";
    else if (numPaths <= 0) pathCounterText = "";
    else if (numPaths >= 5)
    {
        pathCounterText = "MAX"
        createPathButton.classList.add("disabled");
    }

    pathCounter.innerText = pathCounterText;

    if (numPoints < 2 || numPaths >= 5) createPathButton.classList.add("disabled"); 
    else createPathButton.classList.remove("disabled");
}


// Returns new point from given x and y coordinates
function createPoint(x, y)
{
    return new Point(x, y);
}

function createPath()
{
    return new Path();
}


function createSVG(type)
{
    return document.createElementNS('http://www.w3.org/2000/svg', type);
}

///////////////////// Global code /////////////////////


createPointButton.addEventListener("click", () => {
    if (numPoints < 10) createPoint(random(50, 450), random(50, 450));
});

createPathButton.addEventListener("click", () => {
   
    if (numPoints >= 2 && numPaths < 5) createPath();
})