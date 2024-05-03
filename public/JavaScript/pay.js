document.querySelectorAll('#pay-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const reqToken = window.location.pathname.split('pay/')[1];
        let url = `/listing/${listing._id}/reserve/confirm/${reqToken}`;
    
        try {
            let response = await axios.get(url);
            let data = response.data;
    
            let options = {
                "key": data.keyID,
                "amount": data.amount,
                "currency": "INR",
                "name": "InnQuisitor Payments",
                "image": "https://res.cloudinary.com/dhqqljnt3/image/upload/v1714662731/icon_vcafmj.png",
                "order_id": data.id,
                "callback_url": `/listing/${listing._id}/reserve/verify/${reqToken}`,
                "prefill": {
                    "name": data.name,
                    "email": data.email,
                    "contact": "9000090000"
                },
                "theme": {
                    "color": "#FF385C",
                }
            };
            
            let razorpay = new Razorpay(options);
    
            razorpay.open();
    
        } catch (err) {
            console.log(err);
        }
    
    });
});