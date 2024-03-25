const tunnel = document.getElementsByClassName("tunnel")[0];
const title = document.getElementsByClassName("title")[0];

for(let i = 0; i < 10; i++){
    const heart = document.createElement("object");
    heart.data="assets/heart.svg";
    heart.style.animationDelay = `${(i*0.8)/40}s`;
    heart.style.opacity = 1-i/10;
    tunnel.appendChild(heart);
}

for(let i = 0; i < 10; i++){
    const star = document.createElement("object");
    star.data="assets/star.svg";
    star.style.animationDelay = `${0.4 + (i*0.8)/40}s`;
    star.style.opacity = 1-i/10;
    tunnel.appendChild(star);
}

for(let i = 0; i < 10; i++){
    const heart = document.createElement("object");
    heart.data="assets/cheart.svg";
    heart.style.animationDelay = `${0.8 + (i*0.8)/40}s`;
    heart.style.opacity = 1-i/10;
    tunnel.appendChild(heart);
}

for(let i = 0; i < 10; i++){
    const moon = document.createElement("object");
    moon.data="assets/moon.svg";
    moon.style.animationDelay = `${1.2 + (i*0.8)/40}s`;
    moon.style.opacity = 1-i/10;
    tunnel.appendChild(moon);
}

const titlestring = "myaumyau";
let currentLetter = 0;
