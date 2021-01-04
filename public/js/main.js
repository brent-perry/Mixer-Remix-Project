"use strict";
import {canvas} from "/js/canvas.js";
import {ctx} from "/js/canvas.js";
import {imageSourceId} from "/js/canvas.js";
// const canvasURL = canvas.toDataURL();
const brushSizeSlider = document.getElementById("brush_size_slider");

function brushSizer() {
    ctx.lineWidth = brushSizeSlider.value;
}
brushSizeSlider.addEventListener("click",brushSizer);//click instead of change for when users decide to only click the the tool and not change the size
brushSizeSlider.addEventListener("change",brushSizer);//for the mobile version to work as touchscreen reads change not click

let imagePNG;
canvas.toBlob(blob => {
    imagePNG = blob, 'image/png', .5;
});

let data = new FormData;
data.append('imageFile', imagePNG);
let xhr = new XMLHttpRequest();

let uploadButton = document.getElementById("upload_gallery");
uploadButton.addEventListener("click", event => {
    uploadButton.disabled = true;
    canvas.toBlob(blob => {
        let location = document.location.origin;
        let data = new FormData();
        // data.append('category_id' categoryId);
        data.append('image', blob);
        let chosenGenre = document.querySelector(".custom_choose_option.selected");
        if(imageSourceId)
            data.append('parentId',imageSourceId);
        let genre = chosenGenre.dataset.value;
            data.append('genre', genre);
        let xhr = new XMLHttpRequest();
        xhr.open('post', location + '/canvas');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == xhr.DONE) {
                //request is compelete
                //console.log(xhr.responseText);
                switch (xhr.responseText) {
                    case 'LOGIN':
                        document.location.href = '/login';
                        break;
                    case 'WRONGFILTERTYPE':
                        console.error('wrong file type');
                        break;
                    default:
                        if (xhr.responseText.substr(0, 3) === 'OK:') {
                            var image_id = xhr.responseText.substr(3);
                            document.location.href = '/gallery';
                        }
                        break;
                }
            }

        };
        xhr.onerror = error => {
            //console.log(error)
            uploadButton.disabled = false;
        }
        xhr.send(data);
    });
})



