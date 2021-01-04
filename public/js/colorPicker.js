"use strict";
export {Picker};
class Picker {
    constructor(target) {
        this.target = target;
        this.width = 100;
        this.height = 100;
        this.target.width = 100;
        this.target.height = 100;
        this.context = this.target.getContext("2d");
        //circle
        this.pickerCircle = {x: 10, y: 10, width: 7, height: 7 };//set size and starting location of color picker selector
  
        this.listenForEvents();
        this.draw();
    }
        draw() {
            this.build();
            window.requestAnimationFrame(this.draw.bind(this));
        }

        build() {
            let colorGradient = this.context.createLinearGradient(0, 0, this.width, 0);
            //add basic colors
            colorGradient.addColorStop(0, "rgb(255, 0, 0");
            colorGradient.addColorStop(0.15, "rgb(255, 0, 255");
            colorGradient.addColorStop(0.33, "rgb(0, 0, 255");
            colorGradient.addColorStop(0.49, "rgb(0, 255, 255");
            colorGradient.addColorStop(0.67, "rgb(0, 255, 0");
            colorGradient.addColorStop(0.84, "rgb(255, 255, 0");
            colorGradient.addColorStop(1, "rgb(255, 0, 0");
            this.context.fillStyle = colorGradient;
            this.context.fillRect(0, 0, this.width, this.height);
            //add black and whites
            let BWgradient = this.context.createLinearGradient(0, 0, 0, this.height);
            BWgradient.addColorStop(0, "rgb(255, 255, 255, 1)");
            BWgradient.addColorStop(0.5, "rgb(255, 255, 255, 0)");
            BWgradient.addColorStop(0.5, "rgb(0, 0, 0, 0)");
            BWgradient.addColorStop(1, "rgb(0, 0, 0, 1)");
            this.context.fillStyle = BWgradient;
            this.context.fillRect(0, 0, this.width, this.height);

            //circle
            this.context.beginPath();
            this.context.arc(this.pickerCircle.x, this.pickerCircle.y, this.pickerCircle.width, 0, Math.PI * 2);
            this.context.strokeStyle = "black";
            this.context.stroke();
            this.context.closePath();
        }
        listenForEvents() {
            let isMouseDown = false;
            
            const onMouseDown = (e) => {
                this.pickerCircle.x = e.offsetX;
                this.pickerCircle.y = e.offsetY;
                isMouseDown = true;
            }

            const onMouseMove = (e) => {
                if(isMouseDown) {
                    this.pickerCircle.x = e.offsetX;
                    this.pickerCircle.y = e.offsetY;
                    this.onChangeCallback(this.getPickedColor());
                }
            }

            const onMouseUp = () => {
                isMouseDown = false;
            }
            this.target.addEventListener("mousedown", onMouseDown);
            this.target.addEventListener("touchstart",onMouseDown,{passive:true});
            this.target.addEventListener("touchend",onMouseUp);
            this.target.addEventListener("mousemove", onMouseMove);
            this.target.addEventListener("mousedown", () => this.onChangeCallback(this.getPickedColor()));
            this.target.addEventListener("touchstart", () => this.onChangeCallback(this.getPickedColor()),{passive:true});
            
            document.addEventListener("mouseup", onMouseUp);
        }
        getPickedColor() {
            let imageData = this.context.getImageData(this.pickerCircle.x, this.pickerCircle.y, 1, 1);
            return { 
                r: imageData.data[0], 
                g: imageData.data[1], 
                b:imageData.data[2] 
            };
        }

        onChange(callback) {
            this.onChangeCallback = callback;
        }
}