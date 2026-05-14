const gallery = document.getElementById("gallery");
const sentinel = document.getElementById("sentinel");

let images = [];
let index = 0;
const batchSize = 20;
const columns = 3;

// Create column containers
const columnElements = Array.from({ length: columns }, () => {
  const col = document.createElement("div");
  col.className = "column";
  gallery.appendChild(col);
  return col;
});

// Load image list from JSON
fetch("archive_images.json")
  .then(response => response.json())
  .then(data => {
    images = data;

    loadImages();

    observer.observe(sentinel);
  });

function loadImages() {
  for (let i = 0; i < batchSize; i++) {
    if (index >= images.length) return;

    const img = document.createElement("img");
    img.src = images[index];

    // distribute in strict order across columns
    const colIndex = index % columns;
    columnElements[colIndex].appendChild(img);

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
