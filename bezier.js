// HTML Elements
const container = document.getElementById("container");

const createPointButton = document.getElementById("create-point");
const createPathButton = document.getElementById("create-path");

const pointCounter = document.getElementById("point-count");
const pathCounter = document.getElementById("path-count");

const pointList = document.getElementById("point-list");
const pathList = document.getElementById("path-list");

// Global Variables
const POINT_RADIUS = 8;

var numPoints = 0;
var numPaths = 0;
var pointListElements = [];

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
        this.createSVG();
        pointList.appendChild(this.element);
        
        makeDraggable(this);

        updateCounter();
    }

    // Point Getters
    getX() { return this.x; }
    getY() { return this.y; }

    // Point Setters
    setX(x) {
        this.x = clamp(x, 8, 492);
        this.update();
    }

    setY(y) {
        this.y = clamp(y, 8, 492);
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
            style: "fill: black",
            id: this.element.id
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
        this.listElement = document.createElement('div');
        pathList.appendChild(this.element);

        updateCounter();
    }

    addPoint(point) {
        //this.pathPoints.push(point);

        this.createPointItem();
    }

    removePoint(point) {
        this.pathPoints.splice(this.pathPoints.indexOf(point), 1);
    }

    remove()
    {
        this.element.remove();
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
        let pointInputID = document.createElement('input');

        pointItem.className = "path-point-item";
        pointItem.innerText = "point";

        pointInputID.type = "datalist";
        pointInputID.className = "input";
        pointInputID.addEventListener("click", () => {
            pickPoint();
        });

        pointItem.appendChild(pointInputID);

        pointItem.appendChild(createRemoveButton(pointItem));

        this.listElement.appendChild(pointItem);

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
}

function pickPoint(pathPoint) {
    document.addEventListener("mousedown", function(e) {
        if (e.target.tagName == "circle") console.log(e.target.id);
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

                let adjustedPos = cornerCurve(mouseX, mouseY, 500, 500, 16);
                
                point.setX(adjustedPos.x);
                point.setY(adjustedPos.y);
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
                    let diffX = mouseX - anchorX;
                    let diffY = mouseY - anchorY;
                    
                    let distance = Math.min(Math.sqrt((diffX * diffX) + (diffY * diffY)), POINT_RADIUS);
    
                    let angle = Math.PI / 2;
                    if (diffX != 0) angle = Math.atan(diffY / diffX);
    
                    position.x = anchorX - ((Math.cos(angle) * distance) * ((flipAngle) ? -1 : 1));
                    position.y = anchorY - ((Math.sin(angle) * distance) * ((flipAngle) ? -1 : 1));

                    adjustCorner = false;
                    flipAngle = false;
                }

                return position;
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
function createRemoveButton(element, object)
{
    let removeButton = document.createElement('button');  

    removeButton.innerText = "✕";
    removeButton.className = "remove-button";

    removeButton.addEventListener("click", () => {
        element.remove();
        if (object != null) object.remove();
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
        path.addPoint();
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

///////////////////// Global code /////////////////////


createPointButton.addEventListener("click", () => {
    if (numPoints < 10) createPoint(random(50, 450), random(50, 450));
});

createPathButton.addEventListener("click", () => {
   
    if (numPaths < 5) createPath();
})