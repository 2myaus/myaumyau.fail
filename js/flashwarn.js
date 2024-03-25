const doflash = confirm("WARNING: This website may potentially trigger seizures for people with photosensitive epilepsy. Viewer discretion is advised");

if(doflash){
    document.getElementsByClassName("content")[0].style.display = "block";
}
