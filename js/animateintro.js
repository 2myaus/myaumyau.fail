const consoletext = document.getElementsByClassName("consoletext")[0];
const tunnel = document.getElementsByClassName("tunnel")[0];
const title = document.getElementsByClassName("title")[0];
const title_loadbar = document.getElementsByClassName("loadbar")[0];

const mm_dos = document.getElementsByClassName("mm-dos")[0];

function playIntro(){
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

    Array.from(consoletext.children).forEach((child) => {
        child.style.display = "none";
    });

    consoletext.style.display = "block";

    let consoleChildNum = 0;
    const showNextConsoleChild = () => {
        consoletext.children[consoleChildNum].style.display = "block";
        consoleChildNum++;
        if(consoleChildNum>=consoletext.childElementCount) return;
        setTimeout(showNextConsoleChild, 200);
    }
    setTimeout(showNextConsoleChild, 200);

    const typeInto = consoletext.getElementsByClassName("typing")[0];
    const startProgramText = "myaumyau.fail";
    let startProgramCharPos = 0;
    const typeNextStartChar = () => {
        typeInto.textContent = startProgramText.substring(0, startProgramCharPos) + '_';
        startProgramCharPos++;
        if(startProgramCharPos > startProgramText.length){
            setTimeout(() => {
                typeInto.textContent = startProgramText; //Remove the underscore
                setTimeout(() => {
                    consoletext.style.display = "none";

                    setTimeout(() => {
                        tunnel.style.display="block";

                        setTimeout(() => {
                            title.style.display = "block";
                        }, 1800);
                    }, 1000);

                }, 600);
            }, 1200);
            return;
        }
        setTimeout(typeNextStartChar, 100);
    }
    setTimeout(typeNextStartChar, 2000);

    //TODO: Typing animation

    title.addEventListener("animationend", (titleevent) => {
        if(titleevent.animationName != "slideinup") return;
        title_loadbar.style.display = "block";
        let continueDots = true;
        title_loadbar.addEventListener("animationend", (event) => {
            if(event.animationName != "bar-fill") return;
            continueDots = false;
            console.log("end");
        });
        const dots = title_loadbar.getElementsByClassName("dots")[0];
        const dotFunc = () => {
            if(!continueDots) return;
            const numDots = 4;
            dots.textContent += ".";
            if(dots.textContent == ".".repeat(numDots+1)){
                dots.textContent="";
            }
            setTimeout(dotFunc, 500);
        }
        dotFunc();
    });

    title_loadbar.addEventListener("animationend", (event) => {
        setTimeout(() => {
            if(event.animationName != "bar-fill") return;

            //Load mm-dos
            title.style.display = "none";
            title_loadbar.style.display = "none";
            tunnel.style.display = "none";

            mm_dos.style.display = "block";
        }, 600);
    });
}
