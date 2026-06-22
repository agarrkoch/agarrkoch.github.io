const piles = document.querySelectorAll(".photo-pile");

let activePhoto = null;
let dragging = false;

let startX = 0;
let startY = 0;

let offsetX = 0;
let offsetY = 0;


piles.forEach(pile => {

    let layer = 1;

    const photos = pile.querySelectorAll(".pile-photo");


    photos.forEach(photo => {


        const rotation =
            Math.random() * 16 - 8;


        photo.dataset.rotation = rotation;


        // Dynamic pile spread:
        // more photos = wider pile
        const baseSpread = 40;
        const spreadIncrease = 8;

        const spread = Math.min(
            baseSpread + (photos.length * spreadIncrease),
            220
        );

        pile.style.setProperty("--pile-height", `${spread * 2 + 100}px`);


        // Random position radiating from center
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



        photo.addEventListener("pointerdown", e => {


            e.preventDefault();


            activePhoto = photo;

            dragging = true;


            startX = e.clientX;
            startY = e.clientY;



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

});



document.addEventListener("pointermove", e => {


    if (!dragging || !activePhoto)
        return;


    activePhoto.style.left =
        `${e.clientX - offsetX}px`;


    activePhoto.style.top =
        `${e.clientY - offsetY}px`;


});



document.addEventListener("pointerup", () => {


    if (!dragging || !activePhoto)
        return;


    activePhoto.classList.remove("dragging");


    // check if photo was dragged outside the pile
    const pile = activePhoto.closest(".photo-pile");

    const photoRect = activePhoto.getBoundingClientRect();
    const pileRect = pile.getBoundingClientRect();


    const outside =
        photoRect.right < pileRect.left ||
        photoRect.left > pileRect.right ||
        photoRect.bottom < pileRect.top ||
        photoRect.top > pileRect.bottom;


    if (outside) {

        activePhoto.style.transition = "opacity 0.3s ease";

        activePhoto.style.opacity = "0";


        setTimeout(() => {

            activePhoto.style.display = "none";

        }, 300);

    }


    dragging = false;

    activePhoto = null;


});