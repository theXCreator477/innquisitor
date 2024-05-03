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

// INSTANTIATING DATE RANGE PICKER

let selectedDates = [];

let daySpan, endDate, startDate;

function disableDates() {
    let spans = document.querySelectorAll('td > span[title]');
    
    spans.forEach(span => {
        let str = span.title.slice(span.title.indexOf(' ') + 1);

        if (reservedDates.includes(str)) {
            span.parentElement.classList.add('e-disabled');
            
            span.style.backgroundColor = '#D0D0D0';
            span.style.color = '#E3165B';
            span.style.borderRadius = '50%';
            span.parentElement.style.opacity = 0.75;
        }
    });
}

function isValidRange() {
    for (let date of selectedDates) {
        if (reservedDates.includes(date)) {
            dateRangePicker.clear();
            return false;
        }
    }
    return true;
}

function getSelectedDates(selectedRange) {
    let {startDate, endDate} = selectedRange;
    selectedDates.length = 0;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        selectedDates.push(date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }
}

const dateRangePicker = new ej.calendars.DateRangePicker({
    min: new Date(),

    max: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),

    close: function() {
        document.querySelector('.e-device').style.visibility = 'hidden';
    },

    open: function() {
        document.querySelector('.e-device').style.visibility = 'visible';
        setTimeout(() => {
            try {disableDates()} catch (err) {}
            document.querySelector('.e-calendar-container').addEventListener('click', () => {
                try {disableDates()} catch (err) {}
            });
        }, 100);
    },

});

dateRangePicker.appendTo('#element');

const calendarIcon = document.querySelector('.fa-calendar-days');

calendarIcon.addEventListener('click', function() {
    dateRangePicker.show();

    document.querySelector('.e-apply').addEventListener('click', () => {
        let selectedRange = dateRangePicker.getSelectedRange();

        getSelectedDates(selectedRange);

        if (!isValidRange()) {
            return alert("Selected date range contains RESERVED dates");
        }

        ({startDate, endDate, daySpan} = selectedRange);

        document.getElementById('checkin-date').innerText = startDate.toLocaleDateString();
        document.getElementById('checkout-date').innerText = endDate.toLocaleDateString();
    });
});


const reserveForm = document.getElementById('reserve-form');

reserveForm.addEventListener('submit', (event) => {
    if (!startDate || !endDate || !userID) event.preventDefault();
    else {
        document.querySelector('input[name="selectedDates"]').value = JSON.stringify(selectedDates);
    }
});