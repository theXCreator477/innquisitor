if (!reservations.length) {
    document.querySelector('.bookings-heading').innerText = "No bookings yet !!";
    let bc = document.querySelector('.bookings-container');
    let bcStyles = bc.style;
    bcStyles.alignItems = 'center';
}