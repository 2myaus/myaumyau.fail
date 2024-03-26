const MAIN_VIEW = document.getElementById("main-view");
const NAVBAR = document.getElementById("navbar");
const DESKTOP = document.getElementById("desktop");
let windowByNavItem = [];

const WINDOW_RESIZE_AREA_WIDTH = 8;

const DEFAULT_WINDOW = `
<div class="window" resizeable="true" style="top:100px;left:200px;width:600px;height:400px;">
    <div class="window-head">
        <div class="window-buttons">
            <button class="minimize-button"></button>
            <button class="maximize-button"></button>
            <button class="close-button"></button>
        </div>
        <div class="window-title">

        </div>
    </div>
    <div class="window-content">

    </div>
</div>
`;

const MIN_WINDOW_HEIGHT = 40;

const MIN_WINDOW_WIDTH = 80;

let lastclick = null;

let dragging_element = null;
let dragging_start = [0,0];
let dragging_element_start = [0,0];

let dragging_resize_side = "";
let dragging_size_start = [0,0];

let wasLastHoveringNavbar = false;

let window_counter = 0;

function getParentIcon(element){
    if(!MAIN_VIEW.contains(element)) return null;
    if(element.classList.contains("icon")) return element;
    if(element == MAIN_VIEW) return null;
    return getParentIcon(element.parentElement);
}

function getParentNavIcon(element){
    if(!NAVBAR.contains(element)) return null;
    if(element.classList.contains("nav-item")) return element;
    if(element == NAVBAR) return null;
    return getParentNavIcon(element.parentElement);
}

function getParentWindow(element){
    if(!MAIN_VIEW.contains(element)) return null;
    if(element.classList.contains("window")) return element;
    if(element == MAIN_VIEW) return null;
    return getParentWindow(element.parentElement);
}

function isOnWindowHead(element){
    if(!MAIN_VIEW.contains(element)) return false;
    if(element.classList.contains("window-head")) return true;
    if(element == MAIN_VIEW) return false;
    return getParentWindow(element.parentElement);
}

function setActiveIcon(icon_element){
    let icons = document.getElementsByClassName("icon active");
    for(let i = 0; i < icons.length; i++){
        icons[i].classList.remove("active");
    }
    if(icon_element){
        icon_element.classList.add("active");
    }
}

function setWindowInFront(window_element){
    //Appending the window breaks animations... so we have to do this :|
    let windows = Array.from(DESKTOP.getElementsByClassName("window"));
    for(let i = windows.length - 1; i >= 0; i--){
        if(windows[i] == window_element) continue;
        DESKTOP.prepend(windows[i]);
    }
}

function setActiveWindow(window_element){
    let windows = document.getElementsByClassName("window active");
    for(let i = 0; i < windows.length; i++){
        if(windows[i] == window_element) continue;
        windows[i].classList.remove("active");
    }
    if(window_element){
        if(window_element.parentElement.lastElementChild != window_element){
            setWindowInFront(window_element);
        }
        if(window_element.classList.contains("minimized")){
            toggleMinimizeWindow(window_element);
        }
        if(!window_element.classList.contains("active")){
            window_element.classList.add("active");
        }
    }
    updateNavbarWindowStates();
}

function runIconAction(icon_element){
    console.log(icon_element);

    let icon_action = icon_element.getAttribute("action");

    eval(icon_action);
}

function getWindowResizeSide(x, y, windowElement){
    let side = "";

    if(windowElement.getAttribute("resizeable") != "true") return side;

    let window_rect = windowElement.getBoundingClientRect();

    if(y < window_rect.top + WINDOW_RESIZE_AREA_WIDTH){
        side += "n";
    }
    else if(y > window_rect.bottom - WINDOW_RESIZE_AREA_WIDTH){
        side += "s";
    }
    if(x < window_rect.left + WINDOW_RESIZE_AREA_WIDTH){
        side += "w";
    }
    else if(x > window_rect.right - WINDOW_RESIZE_AREA_WIDTH){
        side += "e";
    }

    return side;
}

function closeWindow(windowElement){
    windowElement.remove();
    updateNavbar();
}

function focusNextWindow(){
    let windows = document.querySelectorAll(".window:not(.minimized)");
    if(windows.length > 0){
        setActiveWindow(windows[0]);
    }
}

function toggleMinimizeWindow(windowElement){
    if(windowElement.classList.contains("minimized")){
        windowElement.classList.remove("minimized");
        return;
    }
    windowElement.classList.add("minimized");
    updateNavbarWindowStates();
}

function toggleMaximizeWindow(windowElement){
    if(windowElement.classList.contains("maximized")){
        windowElement.classList.remove("maximized");
        return;
    }
    windowElement.classList.add("maximized");
    setActiveWindow(windowElement);
    updateNavbarWindowStates();
}

function getWindowName(windowElement){
    let title_elem = windowElement.getElementsByClassName("window-title")[0];
    if(title_elem){
        return title_elem.innerText;
    }
    return "";
}

function setWindowName(windowElement, name){
    let title_elem = windowElement.getElementsByClassName("window-title")[0];
    if(title_elem){
        title_elem.innerText = name;
    }
}

function createWindow(windowName, width, height){
    let template = document.createElement("template");
    template.innerHTML = DEFAULT_WINDOW;

    let windowElement = template.content.firstElementChild;

    windowElement.setAttribute("windownum", window_counter);
    window_counter++;

    if(height){
        windowElement.style.height = height + "px";
    }
    if(width){
        windowElement.style.width = width + "px";
    }

    DESKTOP.appendChild(windowElement);
    setWindowName(windowElement, windowName);
    setActiveWindow(windowElement);
    updateNavbar();

    return windowElement;
}

function createBrowserWindowTo(url, width, height){
    let windowElement = createWindow("nek0BROWSER", width, height);
    let content = windowElement.getElementsByClassName('window-content')[0];

    content.innerHTML = `
    <iframe style='width:100%;height:100%;border:none;position:absolute;top:0px;left:0px;' src='`+url.toString()+`' />
    `;

    return windowElement;
}

function updateNavbar(){
    let windows = Array.from(MAIN_VIEW.getElementsByClassName("window"));
    windows.sort((a, b) => {
        return parseInt(a.getAttribute("windownum")) - parseInt(b.getAttribute("windownum"));
    });

    while (NAVBAR.lastElementChild) {
        NAVBAR.lastElementChild.remove();
    }

    windowByNavItem = new Map();
    for(let i = 0; i < windows.length; i++){
        let windowElement = windows[i];
        let nav_item = document.createElement("div");
        nav_item.classList.add("nav-item");
        nav_item.innerText = getWindowName(windowElement);
        NAVBAR.appendChild(nav_item);

        windowByNavItem.set(nav_item, windows[i]);
    }
    updateNavbarWindowStates();
}

function updateNavbarHover(){
    let items = NAVBAR.getElementsByClassName("nav-item");

    for(let i = 0; i < items.length; i++){
        let matchingWindow = windowByNavItem.get(items[i]);
        if(items[i].matches(":hover")){
            if(!matchingWindow.classList.contains("nav-hover")){
                matchingWindow.classList.add("nav-hover");
            }
        }
        else{
            if(matchingWindow.classList.contains("nav-hover")){
                matchingWindow.classList.remove("nav-hover");
            }
        }
    }
}

function updateNavbarWindowStates(){
    let items = NAVBAR.getElementsByClassName("nav-item");

    for(let i = 0; i < items.length; i++){
        let matchingWindow = windowByNavItem.get(items[i]);
        if(matchingWindow.classList.contains("minimized")){
            if(!matchingWindow.classList.contains("minimized")){
                matchingWindow.classList.add("minimized");
            }
        }
        else{
            if(matchingWindow.classList.contains("minimized")){
                matchingWindow.classList.remove("minimized");
            }
        }
        if(matchingWindow.classList.contains("active")){
            if(!matchingWindow.classList.contains("active")){
                matchingWindow.classList.add("active");
            }
        }
        else{
            if(matchingWindow.classList.contains("active")){
                matchingWindow.classList.remove("active");
            }
        }
    }
}

MAIN_VIEW.addEventListener("click", (click_event) => {
    let parentIconElement = getParentIcon(click_event.target);

    if(lastclick && parentIconElement && parentIconElement.classList.contains("active")){
        runIconAction(parentIconElement);
    }

    setActiveIcon(parentIconElement);

    if(click_event.target.tagName == "BUTTON"){
        if(isOnWindowHead(click_event.target)){
            let windowElement = getParentWindow(click_event.target);
            if(click_event.target.classList.contains("close-button")){
                closeWindow(windowElement);
            }
            else if(click_event.target.classList.contains("minimize-button")){
                toggleMinimizeWindow(windowElement);
            }
            else if(click_event.target.classList.contains("maximize-button")){
                toggleMaximizeWindow(windowElement);
            }
        }
    }

    let parentNavIcon = getParentNavIcon(click_event.target);
    if(parentNavIcon){
        let corresponding_window = windowByNavItem.get(parentNavIcon);

        if(corresponding_window){
            setActiveWindow(corresponding_window);
        }
        else{
            updateNavbar();
        }
    }

    lastclick = click_event;

    setTimeout(() => {
        if(lastclick == click_event){
            lastclick = null;
        }
    }, 500);
});

MAIN_VIEW.addEventListener("mousedown", (mouse_event) => {
    let parentIconElement = getParentIcon(mouse_event.target);

    if(parentIconElement){
        dragging_element = parentIconElement;
        setActiveIcon(parentIconElement);
        dragging_start = [mouse_event.clientX, mouse_event.clientY];
        if(dragging_element.style.position != "relative"){
            dragging_element.style.position = "relative";
            dragging_element.style.top = "0px";
            dragging_element.style.left = "0px";
        }
        dragging_element_start = [parseInt(dragging_element.style.left), parseInt(dragging_element.style.top)];
        return;
    }

    let parentWindow = getParentWindow(mouse_event.target);

    if(parentWindow){
        setActiveWindow(parentWindow);
        let window_rect = parentWindow.getBoundingClientRect();

        dragging_resize_side = getWindowResizeSide(mouse_event.clientX, mouse_event.clientY, parentWindow);

        if(parentWindow.classList.contains("maximized") || (!isOnWindowHead(mouse_event.target) && dragging_resize_side == "")) return false;

        dragging_element = parentWindow;
        dragging_start = [mouse_event.clientX, mouse_event.clientY];
        dragging_element_start = [window_rect.left, window_rect.top];
        dragging_size_start = [window_rect.right - window_rect.left, window_rect.bottom - window_rect.top];
        return;
    }
});

let mouseUpListener = (mouse_event) => {
    document.body.style.setProperty("--iframe-pointer-events", "auto");
    dragging_element = null;
    dragging_resize_side = "";
}

MAIN_VIEW.addEventListener("mouseup", mouseUpListener);

MAIN_VIEW.addEventListener("mousemove", (mouse_event) => {
    let xPos = mouse_event.clientX;
    let yPos = mouse_event.clientY;

    let main_view_rect = MAIN_VIEW.getBoundingClientRect();

    if(xPos < main_view_rect.left) xPos = main_view_rect.left;
    if(xPos > main_view_rect.right) xPos = main_view_rect.right;

    if(yPos < main_view_rect.top) yPos = main_view_rect.top;
    if(yPos > main_view_rect.bottom) yPos = main_view_rect.bottom;

    if(mouse_event.buttons != 1){
        mouseUpListener(mouse_event);
    }

    if(dragging_element){
        document.body.style.setProperty("--iframe-pointer-events", "none");
        let totalDistance = [xPos - dragging_start[0], yPos - dragging_start[1]];

        if(dragging_element.classList.contains("window") && dragging_resize_side != ""){
            if(dragging_resize_side[0] == "n"){
                dragging_element.style.top = (dragging_element_start[1] + totalDistance[1]).toString() + "px";

                let setheight = (dragging_size_start[1] - totalDistance[1]);
                if(setheight < MIN_WINDOW_HEIGHT) setheight = MIN_WINDOW_HEIGHT;
                dragging_element.style.height = setheight.toString() + "px";
            }
            else if(dragging_resize_side[0] == "s"){
                let setheight = (dragging_size_start[1] + totalDistance[1]);
                if(setheight < MIN_WINDOW_HEIGHT) setheight = MIN_WINDOW_HEIGHT;
                dragging_element.style.height = setheight.toString() + "px";
            }

            if(dragging_resize_side.includes("w")){
                dragging_element.style.left = (dragging_element_start[0] + totalDistance[0]).toString() + "px";

                let setwidth = (dragging_size_start[0] - totalDistance[0]);
                if(setwidth < MIN_WINDOW_WIDTH) setwidth = MIN_WINDOW_WIDTH;
                dragging_element.style.width = setwidth.toString() + "px";
            }
            else if(dragging_resize_side.includes("e")){
                let setwidth = (dragging_size_start[0] + totalDistance[0]);
                if(setwidth < MIN_WINDOW_WIDTH) setwidth = MIN_WINDOW_WIDTH;
                dragging_element.style.width = setwidth.toString() + "px";
            }
        }
        else{
            dragging_element.style.top = (dragging_element_start[1] + totalDistance[1]).toString() + "px";
            dragging_element.style.left = (dragging_element_start[0] + totalDistance[0]).toString() + "px";
        }
    }
    else{
        let parentWindow = getParentWindow(mouse_event.target);

        if(parentWindow){
            if(!parentWindow.classList.contains("maximized")){
                let windowResizeSide = getWindowResizeSide(xPos, yPos, parentWindow);
                if(windowResizeSide != ""){
                    DESKTOP.style.cursor = windowResizeSide + "-resize";
                }
                /*else if(isOnWindowHead(mouse_event.target)){ //This isn't a thing in most desktop environments
                    parentWindow.style.cursor = "move";
                }*/
                else{
                    DESKTOP.style.cursor = null;
                }
            }
        }
        else{
            DESKTOP.style.cursor = null;
        }
    }
    /*
    if(NAVBAR.contains(mouse_event.target) || wasLastHoveringNavbar){
        updateNavbarHover();
        wasLastHoveringNavbar = true;
    }
    */
});

updateNavbar();
