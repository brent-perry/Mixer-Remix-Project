"use strict";
const canvasHome = document.getElementById("canvas_home");
const ctxHome = canvasHome.getContext('2d');
const canvasHomeContainer = document.getElementById("canvas_home_container");
canvasHome.width = window.innerWidth;
canvasHome.hieight = window.innerHeight;
let particleArray = [];
let adjustX = 20;//moves the image letter around 
let adjustY = 30;//moves the image letter around 
ctxHome.lineWidth = .5;//adjust the size of the border around the bubble

// RESIZING
let originalWindowWidth = window.innerWidth;
let originalWindowHeight = window.innerHeight;

window.addEventListener('resize', event => {
    let diffWidth = originalWindowWidth - window.innerWidth;
    let diffHeight = originalWindowHeight - window.innerHeight;

    for (let i = 0 ; i < particleArray.length ; ++i)
        {
        let particle = particleArray[i];
        particle.baseX = particle.originalX - diffWidth; 
        particle.baseY = particle.originalY - diffHeight;
        }
});

//handles the mouse
let particleMouse = {
    x: null,
    y: null,
    radius: 100 //adjust how big the radius is around the mouse to start the events
}

window.addEventListener('mousemove', event => {
    particleMouse.x = event.offsetX;
    particleMouse.y = event.offsetY;
});

ctxHome.fillStyle = "rgb(255,255,255)";
ctxHome.font = "30px Verdana";
ctxHome.textAlign = 'center';
 //moves text left to right
if(canvasHome.width < 499)//phone sizes
    ctxHome.fillText('MIXER', 70, 150);
else if(canvasHome.width < 593)
    ctxHome.fillText('MIXER', 70, 80);
else if(canvasHome.width < 703)
    ctxHome.fillText('MIXER', 100, 100);
else if (canvasHome.width < 1430)
    ctxHome.fillText('MIXER', 80, 40);
else
    ctxHome.fillText('MIXER', 100, 40);
let textCoordinates = ctxHome.getImageData(0, 0, canvasHome.width, canvasHome.height);//picks the size of the image selected

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 3;
        this.baseX = this.x;
        this.baseY = this.y;
        this.originalX = this.x;
        this.originalY = this.y;
        this.density = (Math.random() * 2) + 1;//controls the speed of the movement
        this.distance;
    }
    drawParticle() {
        ctxHome.fillStyle = "rgba(255,255,255,0.8)";
        ctxHome.strokeStyle = "rgba(34,147,214,1)";
        ctxHome.beginPath();
        //size of the bubbles 
        //bubbles breaks apart
        if(this.distance < particleMouse.radius - 5){
            this.size = 10;
            ctxHome.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctxHome.stroke();
            ctxHome.closePath();
            ctxHome.beginPath();
            ctxHome.arc(this.x - 3, this.y - 3, this.size/2.5, 0, Math.PI * 2);//making reflections
            ctxHome.arc(this.x + 7, this.y - 1, this.size/3.5, 0, Math.PI * 2);//making reflections
        }
        else if(this.distance <= particleMouse.radius){
            this.size = 10;
            ctxHome.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctxHome.stroke();
            ctxHome.closePath();
            ctxHome.beginPath();
            ctxHome.arc(this.x - 2, this.y - 2, this.size/3, 0, Math.PI * 2);//making reflections
        }
        else{
            this.size = 8;
            ctxHome.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctxHome.stroke();
            ctxHome.closePath();
            ctxHome.beginPath();
            ctxHome.arc(this.x - 1, this.y - 1, this.size/3, 0, Math.PI * 2);//making reflections
        }
        ctxHome.closePath();
        ctxHome.fill();
    }
    updateParticles() {
        let dx = particleMouse.x - this.x;
        let dy = particleMouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        this.distance = distance;
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = particleMouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;
        if (distance < particleMouse.radius) {//causes the particles to move away from mouse
            this.x -= directionX;
            this.y -= directionY;
        }
        else {
            if (this.x !== this.baseX) {//causes the particels to move back to the original position
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

function initParticle() {
    particleArray = [];
    for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                let positionX = x + adjustX;
                let positionY = y + adjustY;
                let multiplier = 6;
                if(canvasHome.width < 499)
                    multiplier = 2;
                else if(canvasHome.width < 760)
                    multiplier = 3;
                else if (canvasHome.width < 1038)
                    multiplier = 4;
                particleArray.push(new Particle(positionX * multiplier, positionY * multiplier));//adjust size of particle text

            }
        }
    }
}

initParticle();
//console.log(particleArray);

function animateParticles() {
    ctxHome.clearRect(0, 0, canvasHome.width, canvasHome.height);
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].drawParticle();
        particleArray[i].updateParticles();
    }
    //connectParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();


//this is to  make it have other cool effects
// function connectParticles() {
//     let opacityValue = 1;
//     for (let a = 0; a < particleArray.length; a++) {
//         for (let b = a; b < particleArray.length; b++) {
//             let dx = particleArray[a].x - particleArray[b].x;
//             let dy = particleArray[a].y - particleArray[b].y;
//             let distance = Math.sqrt(dx * dx + dy * dy);
//             if (distance < 20){//chooses how much to have the lines
//                 opacityValue = 1 - (distance/20); //this number must match the previous distance value line above
//                 ctxHome.strokeStyle = "rgb(255,255,255," + opacityValue + ")"; //makes lines disapear as you move your mouse
//                 ctxHome.lineWidth = 2;
//                 ctxHome.beginPath();
//                 ctxHome.moveTo(particleArray[a].x, particleArray[a].y);
//                 ctxHome.lineTo(particleArray[b].x, particleArray[b].y);
//                 ctxHome.stroke();
//             }
//         }
//     }
// }