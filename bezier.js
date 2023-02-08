// HTML Elements
const container = document.getElementById("container");

const createPointButton = document.getElementById("create-point");
const createPathButton = document.getElementById("create-path");

const pointCounter = document.getElementById("point-count");
const pathCounter = document.getElementById("path-count");

const pointList = document.getElementById("point-list");
const pathList = document.getElementById("path-list");

// Global Variables
const POINT_RADIUS = 6;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

var numPoints = 0;
var numPaths = 0;

var pointListElements = [];
var points = [];
var paths = [];

var pt = container.createSVGPoint();

var activeDropdown;
var selecting = false;

// Point Definition
// Contains x and y position
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = createListPoint(this);
        this.id = this.element.id.charAt(5);
        this.createSVG();

        pointList.appendChild(this.element);
        points.push(this);
        
        makeDraggable(this);

        updateCounter();
    }

    // Point Getters
    getX() { return this.x; }
    getY() { return this.y; }

    // Point Setters
    setX(x) {
        this.x = clamp(x, POINT_RADIUS, CANVAS_WIDTH - POINT_RADIUS);
        this.update();
    }

    setY(y) {
        this.y = clamp(y, POINT_RADIUS, CANVAS_HEIGHT - POINT_RADIUS);
        this.update();
    }

    // Remove Point
    remove() {
        this.element.remove();
        this.pointSVG.remove();
        points.splice(points.indexOf(this), 1);
        updateCounter();
    }

    createSVG()
    {
        this.pointSVG = createSVG('circle');
        
        
        setAttributeList(this.pointSVG, {
            r: POINT_RADIUS,
            style: "fill: black",
            id: this.element.id,
            className: "point pickable"
        })

        container.appendChild(this.pointSVG);
        this.update();
    }

    updateInputValues()
    {
        this.element.querySelector("#input-x").value = Math.round(this.x);
        this.element.querySelector("#input-y").value = Math.round(this.y);
    }

    getSVG()
    {
        return this.pointSVG;
    }

    update()
    {
        let adjustedPosition = cornerCurve(this.x, this.y, CANVAS_WIDTH, CANVAS_HEIGHT, 16);

        this.x = adjustedPosition.x;
        this.y = adjustedPosition.y;

        this.updateInputValues();

        setAttributeList(this.pointSVG, {
            cx: this.x,
            cy: this.y,
        })
    }

    // Returns point information in string form
    toString() { return `{x: ${this.x}, y: ${this.y}}` }
}

class PathPoint {
    constructor(inputButton, path)
    {
        this.pointID = null;
        this.point = null;
        this.inputButton = inputButton;
        this.path = path;
    }

    setPointID(pointID)
    {
        this.pointID = pointID;
        
        if (this.pointID == null)
        {
            this.inputButton.innerText = "?";
            this.point = null;
        }
        else
        {
            let pointIndex = points.map(function(e) { return e.id; }).indexOf(this.pointID);
            this.point = points[pointIndex];
            this.inputButton.innerText = pointID;
        }

        this.path.update();
    }

    getPointID()
    {
        return this.pointID;
    }

    getPoint()
    {
        return this.point;
    }

    select()
    {
        this.inputButton.classList.add("selected");
    }

    deselect()
    {
        this.inputButton.classList.remove("selected");
    }

    toString()
    {
        if (this.getPoint() != null) return this.point.getX() + " " + this.point.getY();
        return "";
    }
}

// Path Definition
// Contains list of points to draw curves
class Path {
    constructor()
    {
        this.pathPoints = [];
        this.element = createListPath(this);
        this.listElement = document.createElement('div');
        this.pathSVG = createSVG('path');

        container.appendChild(this.pathSVG);
        pathList.appendChild(this.element);
        paths.push(this);

        updateCounter();
    }

    addPoint(pathPoint) {
        this.pathPoints.push(pathPoint);
        this.update();
    }

    removePoint(point) {
        this.pathPoints.splice(this.pathPoints.indexOf(point), 1);
        this.update();
    }

    remove()
    {
        this.pathSVG.remove();
        this.element.remove();
        paths.splice(paths.indexOf(this), 1);

        updateCounter();
    }

    closeDropdown()
    {
        this.element.querySelector("#dropdown-menu").remove();
        this.element.querySelector(".dropdown-button").innerText = "▸";
    }

    openDropdown()
    {

        this.element.appendChild(createDropdown(this));
        this.element.querySelector(".dropdown-button").innerText = "▾";

    }

    createPointItem()
    {
        let pointItem = document.createElement('div');
        let pointInputID = document.createElement('button');
        let pathPoint = new PathPoint(pointInputID, this);


        pointItem.className = "path-point-item";
        pointItem.id = this.listElement.childElementCount;
        pointItem.innerText = "point";

        pointInputID.type = "datalist";
        pointInputID.className = "pick-point input";
        pointInputID.innerText = "?";

        pointInputID.addEventListener("click", () => {
            pickPoint(pathPoint);
        });

        pointItem.appendChild(pointInputID);

        pointItem.appendChild(createRemoveButton(pointItem, this, pathPoint));

        this.listElement.appendChild(pointItem);

        this.addPoint(pathPoint);
    }

    getPoints()
    {
        return this.pathPoints;
    }

    getListElement()
    {
        return this.listElement;
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

    generatePath()
    {
        let path = "";

        for (let i = 0; i < this.pathPoints.length; i++)
        {
            let pathPoint = this.pathPoints[i];
            if (pathPoint.getPoint() != null)
            {
                path += pathPoint.toString() + " ";
            }
                
        }

        if (path.split(" ").length >= 4) return "M " + path;
        return "";
    }

    update()
    {
        setAttributeList(this.pathSVG, {
            d: this.generatePath(),
            stroke: "black",
            fill: "transparent"
        });
    }
}



function pickPoint(pathPoint) {
    pathPoint.select();

    document.addEventListener("mousedown", function(e) {
        if (e.target.tagName == "circle") pathPoint.setPointID(e.target.id.charAt(5));
        else pathPoint.setPointID("?");

        pathPoint.deselect();
    }, {once : true});
}

// Make a point draggable in the svg container
function makeDraggable(point)
{
    let svg = point.getSVG();

    if (!selecting)
    {
        svg.onmousedown = function(event)
        {
            let conBCR = container.getBoundingClientRect();
    
            moveAt(event.pageX, event.pageY);
    
            function moveAt(pageX, pageY)
            {
                let mouseX = pageX - conBCR.left;
                let mouseY = pageY - conBCR.top;
                
                let posX = mouseX;
                let posY = mouseY;

                let adjustedPos = cornerCurve(mouseX, mouseY, CANVAS_WIDTH, CANVAS_HEIGHT, 16);
                
                point.setX(adjustedPos.x);
                point.setY(adjustedPos.y);

                updatePaths();
            }

            function onMouseMove(event)
            {
                moveAt(event.pageX, event.pageY);
                point.updateInputValues();

                document.onmouseup = function() {
                    document.removeEventListener('mousemove', onMouseMove);
                }
            }

            document.addEventListener('mousemove', onMouseMove);
    
            svg.onmouseup = function() {
                document.removeEventListener('mousemove', onMouseMove);
                svg.onmouseup = null;
            }
        }
    
        svg.ondragstart = function() {

            

            return false;
        }
    }
}

function cornerCurve(mouseX, mouseY, width, height, cornerRadius)
{
    let position = {
        x: mouseX,
        y: mouseY
    };
    let posX = clamp(mouseX, 0, width);
    let posY = clamp(mouseY, 0, height);
    let anchorX;
    let anchorY;
    let adjustCorner = false;
    let flipAngle = false;
    // Set anchors
    {
        if (posX <= cornerRadius && posY <= cornerRadius)
        {
            anchorX = cornerRadius;
            anchorY = cornerRadius;
            adjustCorner = true;
        }
        if (posX <= cornerRadius && posY >= height - cornerRadius)
        {
            anchorX = cornerRadius;
            anchorY = height - cornerRadius;
            adjustCorner = true;
        }
        if (posX >= width - cornerRadius && posY >= height - cornerRadius)
        {
            anchorX = width - cornerRadius;
            anchorY = height - cornerRadius;
            adjustCorner = true;
            flipAngle = true;
        }
        if (posX >= width - cornerRadius && posY <= cornerRadius)
        {
            anchorX = width - cornerRadius;
            anchorY = cornerRadius;
            adjustCorner = true;
            flipAngle = true;
        }
    }
    if (adjustCorner)
    {
        let diffX = clamp(mouseX, 0, width) - anchorX;
        let diffY = clamp(mouseY, 0, height) - anchorY;
        
        let distance = Math.min(Math.sqrt((diffX * diffX) + (diffY * diffY)), cornerRadius - POINT_RADIUS)
        let angle = Math.PI / 2;
        if (diffX != 0) angle = Math.atan(diffY / diffX)
        position.x = anchorX - ((Math.cos(angle) * distance) * ((flipAngle) ? -1 : 1));
        position.y = anchorY - ((Math.sin(angle) * distance) * ((flipAngle) ? -1 : 1));
        adjustCorner = false;
        flipAngle = false;
    }
    return position;
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

// Create a remove button
function createRemoveButton(element, path, pathPoint)
{
    let removeButton = document.createElement('button');  

    removeButton.innerText = "✕";
    removeButton.className = "remove-button";

    removeButton.addEventListener("click", () => {
        if (path != null)
        {
            path.removePoint(pathPoint);
        } 
        element.remove();
        
    })

    return removeButton;
}

function createDropdown(path)
{
    let dropdownMenu = document.createElement('div');
    let addPointButton = document.createElement('button');

    dropdownMenu.id = "dropdown-menu";

    addPointButton.className = "add-point-button input";
    addPointButton.innerText = "＋";

    dropdownMenu.appendChild(addPointButton);
    dropdownMenu.appendChild(path.getListElement());

    addPointButton.addEventListener("click", () => {
        path.createPointItem();
    })


    return dropdownMenu;
}

// Open and Close dropdowns
function setActiveDropdown(path)
{
    if (activeDropdown == path)
    {
        path.closeDropdown();
        activeDropdown = null;
        return;
    }
    else if (activeDropdown != null)
    {
        activeDropdown.closeDropdown();
    }
    if (activeDropdown != path) activeDropdown = path;
    activeDropdown.openDropdown();


    return activeDropdown;
}

function createListPath(path)
{
    let listItemContainer = document.createElement('div');
    let pathContainer = document.createElement('div');
    let pathText = document.createElement('span');
    let dropdownButton = document.createElement('button');
    
    
    // Find an ID for the item
    let id = 0;
    
    while (document.getElementById(`path${id}`) != null)
    {
        id++;
    }
    if (id >= 5) return;

    listItemContainer.id = `path${id}`;
    pathContainer.className = "list-item path-list-item";

    pathText.innerText = `path ${id}`

    dropdownButton.innerText = "▸"
    dropdownButton.className = "dropdown-button input"

    dropdownButton.addEventListener("click", () => {
        setActiveDropdown(path)
    });

    pathContainer.appendChild(pathText);
    pathContainer.appendChild(dropdownButton);
    pathContainer.appendChild(createRemoveButton(path))

    listItemContainer.appendChild(pathContainer);

    return listItemContainer;
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

    pointText.innerText = `point ${id}`;
    
    inputX.type = "text";
    inputY.type = "text";

    inputX.className = "input";
    inputY.className = "input";

    inputX.id = "input-x";
    inputY.id = "input-y"; 

    inputX.value = point.getX();
    inputY.value = point.getY();

    // Add event listeners to item components
    inputX.addEventListener("change", () => {
        point.setX(inputX.value);
    })

    inputY.addEventListener("change", () => {
        point.setY(inputY.value)
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

    updateButton(createPointButton, pointCounter, numPoints, 10);
    updateButton(createPathButton, pathCounter, numPaths, 5);

    if (numPaths >= 5) createPathButton.classList.add("disabled"); 
    else createPathButton.classList.remove("disabled");
}

function updateButton(buttonElement, textElement, num, max)
{
    let text;

    if (num > 0 && num < max) text = `${num}/${max}`;
    else if (num <= 0) text = "";
    else if (num >= max)
    {
        text =  "MAX"
        buttonElement.classList.add("disabled");
    }

    textElement.innerText = text;
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

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function updatePaths()
{
    for (let i = 0; i < paths.length; i++)
    {
        paths[i].update();
    }
}

///////////////////// Global code /////////////////////


createPointButton.addEventListener("click", () => {
    if (numPoints < 10) createPoint(random(50, 450), random(50, 450));
});

createPathButton.addEventListener("click", () => {
   
    if (numPaths < 5) createPath();
})