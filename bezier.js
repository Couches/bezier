// HTML Elements
const container = document.getElementById("container");
const createPointButton = document.getElementById("create-point");
const createPathButton = document.getElementById("create-path");
const itemCounter = document.getElementById("point-count");
const pointList = document.getElementById("point-list");

// Global Variables
const POINT_RADIUS = 7;

var numPoints = 0;
var pointListElements = [];
var points = [];

// Point Definition
// Contains x and y position
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = createListPoint(x, y, this);
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
            fill: 'black'
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
    }

    add(p) {
        this.pathPoints.push(p);
    }

    remove(p) {
        this.pathPoints.splice(this.pathPoints.indexOf(p), 1);
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


// Create List Point
// Creates an HTML element containing information about its respective point
function createListPoint(x, y, point)
{
    // Generate list item components
    let pointContainer = document.createElement('div');
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

    // Assign attributes of item components
    pointContainer.id = id;
    pointContainer.className = "list-item";

    pointText.innerText = `point ${String.fromCharCode(parseInt(pointContainer.id) + 97)}`;
    
    inputX.type = "text";
    inputY.type = "text";

    inputX.value = x;
    inputY.value = y;

    removeButton.innerText = "🔪";

    // Add event listeners to item components
    inputX.addEventListener("change", () => {
        point.setX(inputX.value);
        console.log(point.getX());
    })

    inputY.addEventListener("change", () => {
        point.setY(inputY.value)
        console.log(point.getY());
    })

    

    removeButton.addEventListener("click", () => {
        point.remove();
    })

    // Append components to the container
    pointContainer.appendChild(pointText);
    pointContainer.appendChild(inputX);
    pointContainer.appendChild(inputY);
    pointContainer.appendChild(removeButton);
    
    return pointContainer;
}



// Update Counter
// Changes the counter on create point button 
function updateCounter()
{
    numPoints = pointList.childElementCount;
    createPointButton.classList.remove("disabled");


    let text;
    if (numPoints > 0 && numPoints < 26) text = numPoints + "/26";
    else if (numPoints <= 0) text = "";
    else if (numPoints >= 26)
    {
        text = "MAX"
        createPointButton.classList.add("disabled");
    }

    itemCounter.innerText = text;

    if (numPoints < 2)
    {
        createPathButton.classList.add("disabled");
    }
    else
    {
        createPathButton.classList.remove("disabled");
    }
}


// Returns new point from given x and y coordinates
function createPoint(x, y)
{
    return new Point(x, y);
}


function createSVG(type)
{
    return document.createElementNS('http://www.w3.org/2000/svg', type);
}

///////////////////// Global code /////////////////////


createPointButton.addEventListener("click", () => {
    if (numPoints < 26) createPoint(random(50, 450), random(50, 450));
});


const point1 = createPoint(15, 5);
const point2 = createPoint(10, 10);
const point3 = createPoint(5, 15);

const path1 = new Path();

path1.add(point1);
path1.add(point2);
path1.add(point3);

console.log(path1.toString());

point2.setX(35)

console.log(path1.toString());

path1.remove(point2);

console.log(path1.toString());