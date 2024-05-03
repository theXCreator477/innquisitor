let listCpy = data;

function clickableAnchors() {
    document.querySelectorAll('.card-body').forEach((element) => {
        element.addEventListener('click', () => {
            element.querySelector('a').click();
        });
    });
}

function filterCards(tempList, cardsContainer) {
    cardsContainer.innerHTML = '';
    for (let list of tempList) {
        let cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        let anchor = document.createElement('a');
        anchor.href = `/listing/${list._id}`;
        anchor.id = "show";
        anchor.style.display = "none";
        cardBody.appendChild(anchor);

        let imgContainer = document.createElement('div');
        imgContainer.classList.add("img-container", "swiper", "mySwiper", "img-swiper");

        let swiperWrapper = document.createElement('div');
        swiperWrapper.classList.add("swiper-wrapper");
        
        for (let j of list.image) {
            let swiperSlide = document.createElement('div');
            swiperSlide.classList.add("swiper-slide");

            let img = document.createElement('img');
            img.classList.add("square-img");
            img.src = `${j.url}`;

            swiperSlide.appendChild(img);
            swiperWrapper.appendChild(swiperSlide);
        }

        imgContainer.appendChild(swiperWrapper);

        let pagination = document.createElement('div');
        pagination.classList.add("swiper-pagination");
        imgContainer.appendChild(pagination);
        cardBody.appendChild(imgContainer);

        let infoContainer = document.createElement('div');
        infoContainer.classList.add("info-container");

        let title = document.createElement('h5');
        title.classList.add('card-title', 'medium');
        title.textContent = `${list.title}`;
        infoContainer.appendChild(title);

        let para = document.createElement('p');
        para.classList.add('card-description');
        para.textContent = list.description;
        infoContainer.appendChild(para);

        para = document.createElement('p');
        para.classList.add('card-price', 'medium');
        para.textContent = `\u20B9 ${list.price}/night`;
        infoContainer.appendChild(para);

        let location = document.createElement('div');
        location.classList.add('location-div', 'medium');

        let icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-location-dot');
        location.appendChild(icon);

        para = document.createElement('p');
        para.classList.add('location');
        para.textContent = `${list.location}, ${list.country}`;
        location.appendChild(para);
        infoContainer.appendChild(location);

        cardBody.appendChild(infoContainer);

        let cardLayer = document.createElement('div');
        cardLayer.classList.add('card-layer');
        cardBody.appendChild(cardLayer);

        cardsContainer.appendChild(cardBody);
    }
    clickableAnchors();
}

function getLoadingCards(cardsContainer) {
    cardsContainer.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body loading';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'img-container';
        cardBody.appendChild(imgContainer);

        const squareImg = document.createElement('div');
        squareImg.className = 'square-img loading-placeholder';
        imgContainer.appendChild(squareImg);

        const infoContainer = document.createElement('div');
        infoContainer.className = 'info-container';
        cardBody.appendChild(infoContainer);

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title loading-placeholder';
        infoContainer.appendChild(cardTitle);

        const cardDescription = document.createElement('p');
        cardDescription.className = 'card-description loading-placeholder';
        infoContainer.appendChild(cardDescription);

        const cardPrice = document.createElement('p');
        cardPrice.className = 'card-price loading-placeholder';
        infoContainer.appendChild(cardPrice);

        const locationDiv = document.createElement('div');
        locationDiv.className = 'location-div medium';
        infoContainer.appendChild(locationDiv);

        const location = document.createElement('p');
        location.className = 'location loading-placeholder';
        locationDiv.appendChild(location);

        const cardLayer = document.createElement('div');
        cardLayer.className = 'card-layer';
        cardBody.appendChild(cardLayer);

        cardsContainer.appendChild(cardBody);
    }
}

clickableAnchors();

let previousValue = null;

document.querySelectorAll('.filters-container input').forEach(input => {
    input.addEventListener('click', (event) => { 
        event.stopPropagation();
        if (event.target.id !== previousValue) {
            previousValue = event.target.id;
            let category = event.target.id.toUpperCase();

            let tempList = listCpy.filter(list => {
                let categories = list.category.toUpperCase();
                return categories.includes(category);
            });

            let cardsContainer = document.querySelector('.cards-container');
            getLoadingCards(cardsContainer);
            if (tempList.length) {
                setTimeout(() => filterCards(tempList, cardsContainer), 1000);
            } else {
                let heading = document.createElement('h1');
                heading.textContent = "No Listing Found !!";
                setTimeout(() => {
                    cardsContainer.innerHTML = '';
                    cardsContainer.appendChild(heading);
                }, 1000);
            }
            
        }
    });
});

document.querySelector('.search-btn').addEventListener('click', (event) => {
    let searchInput = document.querySelector('.search-input').value.toUpperCase();

    if (searchInput) {
        let tempList = listCpy.filter(list => {
            let destination = `${list.location.toUpperCase()} ${list.country.toUpperCase()} ${list.title.toUpperCase()}`.trim();
            return destination.includes(searchInput);
        });
        let cardsContainer = document.querySelector('.cards-container');
        getLoadingCards(cardsContainer);
        if (tempList.length) {
            setTimeout(() => filterCards(tempList, cardsContainer), 1000);
        } else {
            let heading = document.createElement('h1');
            heading.textContent = "No Listing Found !!";
            setTimeout(() => {
                cardsContainer.innerHTML = '';
                cardsContainer.appendChild(heading);
            }, 1000);
        }
    }
});

document.querySelector('.search-input').addEventListener('keypress', (event) => {
    if (event.code === 'Enter') document.querySelector('.search-btn').click();
});

const fSwiper = new Swiper(".f-swiper", {
    slidesPerView: 5,
    slidesPerGroup: 2,
    breakpoints: {
        700: {
            slidesPerView: 6,
        },
        900: {
            slidesPerView: 8,
        },
        1200: {
            slidesPerView: 10,
        }
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
});

const imgSwiper = new Swiper(".img-swiper", {
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },
    loop: true,
    autoplay: {
        delay: 3000, // Delay between transitions (in milliseconds)
    },
    effect: "fade",
    speed: 1000,
});