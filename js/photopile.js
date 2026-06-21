const photos = document.querySelectorAll(".pile-photo");

let layer = 1;
let originRect = null;
let openScale = 1;
let originRotation = 0;

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");

photos.forEach(photo => {


    let rotation = Math.random() * 16 - 8;


    photo.dataset.rotation = rotation;


    photo.style.left = Math.random() * 65 + "%";
    photo.style.top = Math.random() * 45 + "%";
    photo.style.transform = `rotate(${rotation}deg)`;
    photo.style.zIndex = layer++;



    let dragging = false;
    let moved = false;


    let startX;
    let startY;

    let offsetX;
    let offsetY;



    photo.addEventListener("mousedown", e => {


        e.preventDefault();


        dragging = true;
        moved = false;


        startX = e.clientX;
        startY = e.clientY;


        offsetX = e.clientX - photo.offsetLeft;
        offsetY = e.clientY - photo.offsetTop;


        photo.style.zIndex = layer++;


    });




    document.addEventListener("mousemove", e => {


        if(!dragging) return;



        let distance = Math.sqrt(
            (e.clientX - startX)**2 +
            (e.clientY - startY)**2
        );


        if(distance > 10){
            moved = true;
        }



        photo.style.left =
        e.clientX - offsetX + "px";


        photo.style.top =
        e.clientY - offsetY + "px";


    });




    document.addEventListener("mouseup", () => {



        if(dragging && !moved){


            const image = photo.dataset.full;


            originRect = photo.getBoundingClientRect();


            originRotation = photo.dataset.rotation;



            lightboxImage.src = image;



            // thumbnail size

            lightboxImage.style.width =
(photo.querySelector("img").getBoundingClientRect().width) + "px";

lightboxImage.style.height =
(photo.querySelector("img").getBoundingClientRect().height) + "px";



            const startX =
            originRect.left -
            (window.innerWidth / 2 - originRect.width / 2);


            const startY =
            originRect.top -
            (window.innerHeight / 2 - originRect.height / 2);



            // start tilted like the photo

            lightboxImage.style.transform =
            `
            translate(${startX}px, ${startY}px)
            scale(1)
            rotate(${originRotation}deg)
            `;



            lightbox.classList.add("open");



            openScale =
            Math.min(
                (window.innerWidth * .7) / originRect.width,
                (window.innerHeight * .75) / originRect.height
            );



            requestAnimationFrame(() => {


                // lift photo and straighten

                lightboxImage.style.transform =
                `
                translate(0,0)
                scale(${openScale})
                rotate(0deg)
                `;


            });



        }


        dragging = false;


    });


});







// CLOSE

lightbox.addEventListener("click", e => {


    if(e.target !== lightbox){
        return;
    }


    if(!originRect){
        return;
    }



    const targetX =
    originRect.left -
    (window.innerWidth / 2 - originRect.width / 2);


    const targetY =
    originRect.top -
    (window.innerHeight / 2 - originRect.height / 2);



    // force transition

    lightboxImage.getBoundingClientRect();



    requestAnimationFrame(() => {


        // retrace path:
        // center -> pile
        // large -> thumbnail
        // straight -> original angle

        lightboxImage.style.transform =
        `
        translate(${targetX}px, ${targetY}px)
        scale(1)
        rotate(${originRotation}deg)
        `;


    });



    setTimeout(() => {


        lightbox.classList.remove("open");


        lightboxImage.style.transform = "";


        originRect = null;
        originRotation = 0;


    }, 5000);



});






// prevent close when clicking image

lightboxImage.addEventListener("click", e => {

    e.stopPropagation();

});