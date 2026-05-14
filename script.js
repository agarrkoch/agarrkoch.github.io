const gallery = document.getElementById("gallery");
const sentinel = document.getElementById("sentinel");

let images = [];
let index = 0;
const batchSize = 20;

// Load image list from JSON
fetch("images.json")
  .then(response => response.json())
  .then(data => {
    images = data;

    // load first batch
    loadImages();

    // start observer AFTER json loads
    observer.observe(sentinel);
  });

function loadImages() {
  for (let i = 0; i < batchSize; i++) {

    // stop if no more images
    if (index >= images.length) return;

    const img = document.createElement("img");

    img.src = images[index];

    gallery.appendChild(img);

    index++;
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadImages();
  }
}, {
  rootMargin: "300px"
});
