"use strict"
import {canvas,ctx} from "/js/canvas.js";

let hideTools = document.getElementById("hide_tools");
let hideSearch = document.getElementById("hide_search");

hideTools.addEventListener("click", event => {
    let closeToolsIcon = document.getElementById("hide_tools");
    let toolBar = document.getElementById("tool_bar_container");
    let toolBarWrapper = document.getElementById("tool_bar_wrapper");
    if (toolBar.style.display === "none") {
        toolBar.style.display = "block";
        toolBarWrapper.style.width = "10em";
        closeToolsIcon.innerHTML = "X";
    }
    else {
        toolBar.style.display = "none";
        toolBarWrapper.style.width = ".8em";
        closeToolsIcon.innerHTML = "O";
    }
});

hideSearch.addEventListener("click", event => {
    let closeGenreIcons = document.getElementById("hide_search");
    let genreBar = document.getElementById("search_genre_container");
    let genreBarWrapper = document.getElementById("search_genre_wrapper");
    if (genreBar.style.display === "none") {
        genreBar.style.display = "block";
        genreBarWrapper.style.width = "10em";
        closeGenreIcons.innerHTML = "X";
    }
    else {
        genreBar.style.display = "none";
        genreBarWrapper.style.width = ".8em";
        closeGenreIcons.innerHTML = "O";

    }

});

//CUSTOM SEARCH DROP DOWN
let searchSelectWrapper = document.querySelector('.custom_search_select_wrapper');
let searchSelect = document.querySelector('.custom_search_select');

searchSelectWrapper.addEventListener('click', function () {
    searchSelect.classList.toggle('search_open');
})

window.addEventListener('click', event => {
    for (const select of document.querySelectorAll('.custom_search_select')) {
        if (!select.contains(event.target)) {
            select.classList.remove('search_open');
        }
    }
});

let customSearchOptionList = document.getElementsByClassName("custom_search_option");
for (var i = 0; i < customSearchOptionList.length; i++) {
    let customSearchOption = customSearchOptionList[i];
    customSearchOption.addEventListener("click", event => {
        let lastSelected = document.querySelector(".custom_search_option.selected");
        lastSelected.classList.remove("selected");
        customSearchOption.classList.add("selected");
        displaySearchGallery(customSearchOption.textContent);
    });
}

//BASE SELECTED ITEM
displaySearchGallery('Other');

// CUSTOM CHOOSE DROP DOWN
let chooseSelectWrapper = document.querySelector('.custom_choose_select_wrapper');
let chooseSelect = document.querySelector('.custom_choose_select');

chooseSelectWrapper.addEventListener('click', function () {
    chooseSelect.classList.toggle('choose_open');
})

window.addEventListener('click', event => {
    for (const select of document.querySelectorAll('.custom_choose_select')) {
        if (!select.contains(event.target)) {
            select.classList.remove('choose_open');
        }
    }
});

let customChooseOptionList = document.getElementsByClassName("custom_choose_option");
for (var i = 0; i < customChooseOptionList.length; i++) {
    let customChooseOption = customChooseOptionList[i];
    customChooseOption.addEventListener("click", event => {
        let lastSelected = document.querySelector(".custom_choose_option.selected");
        lastSelected.classList.remove("selected");
        customChooseOption.classList.add("selected");
    });
}

//IMPORTS IMAGE ONTO CANVAS
let img = new Image();

function imageHandler() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = this.result; // contains image url as data url
}

function loadImage(event) {
    let imageFileName = event.target.files[0];
    if (imageFileName) {
        let imageFileReader = new FileReader();
        imageFileReader.onload = imageHandler;
        imageFileReader.readAsDataURL(imageFileName);
    }
}

window.onload = function () {
    let y = document.getElementById("chosen_image_file");
    y.addEventListener('input', loadImage, false);
}

//ROTATE BUTTON
let rotateButton = document.getElementById("rotate");

rotateButton.addEventListener('click', event => {
    drawRotate();
})

function drawRotate() {
    let temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    temp.getContext('2d').drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width, canvas.height);//figure out position of where the image ends up
    ctx.rotate(90 * Math.PI / 2);
    ctx.drawImage(temp, canvas.width / 2 - temp.width / 2, canvas.height / 2 - temp.height / 2);
    ctx.restore();
}

// DISPLAY SEARCH GENRE GALLERY TAB

async function displaySearchGallery(genre) {
    let url = `${document.location.origin}/api/latest_genre/${genre}`;
    let response = await fetch(url);
    let obj = await response.json();
    let elements = document.querySelectorAll('.search_genre_imgs');
    for (var i = 0; i < obj.length; i++) {
        let imageURL = `/gallery/${obj[i].id}${obj[i].extensions}`;
        elements[i].style.backgroundImage = `url('${imageURL}')`;
        elements[i].href = `/remix/${obj[i].id}`;
    }
}

