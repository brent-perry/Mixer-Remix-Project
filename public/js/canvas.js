"use strict";
export {canvas};
export {ctx};
export {brushColor};
export {imageSourceId};
export {drawing};
import {Picker} from "/js/colorPicker.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById('canvas_container');
let previousX = 0;
let previousY = 0;
let drawing = false;
let brushColor = "rgb(0,0,0)";
canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;
const drawHistory = [];


//REMIX LOGIC
let imageSourceUrl = canvas.dataset.imageSourceUrl;
let imageSourceId = canvas.dataset.imageId;
let sourceImage = null;

if (imageSourceUrl) {
    sourceImage = new Image();
    sourceImage.addEventListener('load', event => {
        ctx.drawImage(sourceImage, 0, 0);
    });
    sourceImage.src = imageSourceUrl;
}

//CLEAR BUTTON
const clearButton = document.getElementById("clear");
clearButton.addEventListener("click", event => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (sourceImage) {
        ctx.drawImage(sourceImage, 0, 0);
    }
});

// ERASER BUTTON
const eraserButton = document.getElementById("eraser_size_slider");
function eraser(){
    brushColor = "rgba(255,255,255)";
    ctx.lineWidth = eraserButton.value;
};
//click instead of change for when users decide to only click the the tool and not change the size
eraserButton.addEventListener("click", eraser);
//for the mobile to work touchscreen reads change not click
eraserButton.addEventListener("change", eraser);

// RESIZING
window.addEventListener('resize', event => {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
    ctx.putImageData(imageData, canvas.width / 2 - imageData.width / 2, canvas.height / 2 - imageData.height / 2);
    // console.log(imageData);
});

//UNDO BUTTON
const undoButton = document.getElementById("undo");

undoButton.addEventListener("click", event => {
    let latestUndoImg = drawHistory.pop();
        if(latestUndoImg)
        {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.putImageData(latestUndoImg,0,0);
        console.log(drawHistory);
        }
});

//DRAW LOGIC
let picker = new Picker(document.getElementById("color_picker"), 250, 220);

let down = event => {
    let undoImg = ctx.getImageData(0,0,canvas.width,canvas.height);
    drawHistory.push(undoImg);
    if(drawHistory.length > 20)
    drawHistory.shift();
    previousX = event.pageX;
    previousY = event.pageY;
    drawing = true;
}

let up = event => {
    drawing = false;
}

let leave = event => {
    drawing = false;
}

let draw = event => {
    if (!drawing)
        return;
    let x = event.pageX;
    let y = event.pageY;

    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineJoin = 'round';
    ctx.moveTo(previousX, previousY);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
    previousX = x;
    previousY = y;
}

canvas.addEventListener("mousedown", down);
canvas.addEventListener("mouseup", up);
canvas.addEventListener("mouseleave", leave);
canvas.addEventListener("mousemove", draw);


//TOUHCSCREEN DRAWING
let previousTouchX = 0;
let previousTouchY = 0;
let touchDrawing = false;

let touchDown = event => {
    touchDrawing = true;
    previousTouchX = event.targetTouches[0].pageX;
    previousTouchY = event.targetTouches[0].pageY;
    touchDrawing = true;
}

let touchUp = event => {
    touchDrawing = false;
}


let touchDraw = event => {
    event.preventDefault();
    if (!touchDrawing)
        return;
    let touchX = event.targetTouches[0].pageX;
    let touchY = event.targetTouches[0].pageY;

    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineJoin = 'round';
    ctx.moveTo(previousTouchX, previousTouchY);
    ctx.lineTo(touchX, touchY);
    ctx.closePath();
    ctx.stroke();
    previousTouchX = touchX;
    previousTouchY = touchY;
}

canvas.addEventListener("touchstart", touchDown,{passive:true});
canvas.addEventListener("touchmove",touchDraw);//cant have passive true with using preventDefault();
canvas.addEventListener("touchend", touchUp,{passive:true});

  
picker.onChange((color) => {
    // console.log(color);
    let selected = document.getElementsByClassName("selected_color")[0];
    let rgb = `rgb(${color.r} ,${color.g} ,${color.b})`;
    selected.style.backgroundColor = rgb;
    brushColor = rgb;
});
