const gallery = document.getElementById("gallery");
const sentinel = document.getElementById("sentinel");

// Example image source (replace with your own or API)
let page = 0;

function loadImages() {
  for (let i = 0; i < 20; i++) {
    const img = document.createElement("img");

    const id = page * 20 + i;

    const width = 600;
    const height = Math.floor(Math.random() * 400 + 400); 
    // random height = staggered feel

    img.src = `https://picsum.photos/${width}/${height}?random=${id}`;

    gallery.appendChild(img);
  }
  page++;
}

loadImages();

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadImages();
  }
});

observer.observe(sentinel);
