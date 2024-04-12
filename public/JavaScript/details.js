try {

    document.getElementById('delete-btn').addEventListener('click', (event) => {
        if (!confirm('Are You Sure ? This page will be deleted permanently.')) event.preventDefault();
    });

    if (!userID || userID !== ownerID) {
        document.querySelector('.edit-delete-div').style.display = 'none';
    }

} catch (err) {}

document.querySelectorAll(".review-card").forEach(card => {
    let rating = card.querySelector(".hidden-rating").innerText;
    let id = card.querySelector(".card-id").innerText;
    let targetId = `${id}-${rating}-star`;
    document.getElementById(targetId).checked = true;
});

const reviewsHeading = document.querySelector('.reviews-heading');
const reviewCard = document.querySelector('.review-card');

if (!reviewCard) {
    reviewsHeading.innerText = "No Reviews. Be the first one to review !!";
    reviewsHeading.style.textAlign = "center";
    reviewsHeading.style.marginLeft = 0;
}

mapboxgl.accessToken = mapAccessToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// create DOM element for the marker
const el = document.createElement('div');
el.id = 'marker';
el.style.backgroundImage = `url(${markerImg})`;
// create the marker
new mapboxgl.Marker(el)
    .setLngLat(coordinates)
    .addTo(map);


const imgSwiper = new Swiper(".img-swiper", {
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    effect: "fade",
});