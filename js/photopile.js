const pile = document.querySelector(".photo-pile");

let activePhoto = null;
let dragging = false;

let offsetX = 0;
let offsetY = 0;

let layer = 1;



// -----------------------------
// LOAD JSON FROM HTML ATTRIBUTE
// -----------------------------

const jsonFile = pile.dataset.json;


fetch(jsonFile)

    .then(response => response.json())

    .then(images => {


        images.forEach(image => {


            const photo = document.createElement("div");

            photo.className = "pile-photo";



            const img = document.createElement("img");

            img.src = image.src;

            img.width = image.width;

            img.height = image.height;



            photo.appendChild(img);

            pile.appendChild(photo);


        });


        initializePile();


    });





// -----------------------------
// CREATE RANDOM PHOTO PILE
// -----------------------------

function initializePile() {


    const photos =
        document.querySelectorAll(".pile-photo");



    photos.forEach(photo => {



        const rotation =
            Math.random() * 16 - 8;



        // More images = wider pile

        const spread = Math.min(
            40 + (photos.length * 8),
            220
        );



        const x =
            Math.random() * spread * 2 - spread;


        const y =
            Math.random() * spread * 2 - spread;



        photo.style.left =
            `calc(50% + ${x}px)`;


        photo.style.top =
            `calc(50% + ${y}px)`;



        photo.style.transform =
            `translate(-50%, -50%) rotate(${rotation}deg)`;



        photo.style.zIndex =
            layer++;




        // -----------------------------
        // START DRAG
        // -----------------------------

        photo.addEventListener("pointerdown", e => {


            e.preventDefault();


            activePhoto = photo;

            dragging = true;



            offsetX =
                e.clientX - photo.offsetLeft;


            offsetY =
                e.clientY - photo.offsetTop;



            photo.style.zIndex =
                layer++;



            photo.classList.add("dragging");



            photo.setPointerCapture(e.pointerId);


        });



    });


}






// -----------------------------
// MOVE PHOTO
// -----------------------------

document.addEventListener("pointermove", e => {


    if (!dragging || !activePhoto)
        return;



    activePhoto.style.left =
        `${e.clientX - offsetX}px`;



    activePhoto.style.top =
        `${e.clientY - offsetY}px`;



});







// -----------------------------
// DROP PHOTO
// -----------------------------

document.addEventListener("pointerup", () => {


    if (!dragging || !activePhoto)
        return;



    activePhoto.classList.remove("dragging");



    const pile =
        activePhoto.closest(".photo-pile");



    const photoRect =
        activePhoto.getBoundingClientRect();



    const pileRect =
        pile.getBoundingClientRect();




    const outside =

        photoRect.right < pileRect.left ||

        photoRect.left > pileRect.right ||

        photoRect.bottom < pileRect.top ||

        photoRect.top > pileRect.bottom;




    if (outside) {


        activePhoto.style.transition =
            "opacity 0.3s ease, transform 0.3s ease";


        activePhoto.style.opacity = "0";


        activePhoto.style.transform +=
            " scale(0.8)";



        setTimeout(() => {


            activePhoto.remove();


        }, 300);


    }



    dragging = false;

    activePhoto = null;


});