if (process.env.NODE_ENV != "production") require("dotenv").config();
const Listing = require("../models/listingSchema");
const User = require("../models/userSchema");
const Reservation = require("../models/reservationSchema");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const {cloudinary} = require("../cloudConfig");
const geoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = geoCoding({ accessToken: process.env.MAP_ACCESS_TOKEN });

module.exports.renderListings = async (req, res) => {
    let list = await Listing.find().populate('owner');
    res.render("listings/listings", {list});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.listingDetails = async (req, res) => {
    let {id} = req.params;
    let data = await Listing.findById(id).populate([{path: "reviews", populate: {path: "owner"}}, "owner"]);
    if (!data) {
        req.flash("error", "Required Listing does not exist");
        res.redirect("/listing");
    }
    res.render("listings/details", {data});
};

module.exports.createListing = async (req, res) => {
    if (!req.files || !req.files.length) {
        req.flash("error", "Please upload at least one image");
        return res.redirect("/listing/new");
    }

    req.body.listing.image = req.files.map(file => {
        let path = file.path.replace('/upload', '/upload/f_webp,w_2000');
        return {filename: file.filename, url: path};
    });

    let location = `${req.body.listing.location}, ${req.body.listing.country}`;
    try {
        let response = await geocodingClient.forwardGeocode({
            query: location,
            limit: 1
        }).send();

        let category = req.body.listing.category;
        category = Array.isArray(category) ? category.join(", ") : category;
        req.body.listing.category = category;
        let listing = new Listing(req.body.listing);
        listing.owner = req.user._id;
        listing.geometry = response.body.features[0].geometry;
        let saved = await listing.save();



        console.log(saved);



        req.flash("success", "New Listing Added successfully");
        res.redirect("/listing");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing/new");
    }
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    try {
        let listing = await Listing.findByIdAndUpdate(id, req.body.listing);
        if (req.files && req.files.length) {

            let trashFiles = listing.image.map(image => {
                return image.filename;
            });

            listing.image = req.files.map(file => {
                let path = file.path.replace('/upload', '/upload/f_webp,w_2000');
                return {url: path, filename: file.filename,};
            });

            await listing.save();
            
            for (let trash of trashFiles) {
                await cloudinary.uploader.destroy(trash);
            }
        }
        req.flash("success", "Listing Updated Successfully");
        res.redirect(`/listing/${id}`);
    } catch (e) {
        req.flash("error", e.message);
        res.redirect(`/listing/${id}`);
    }
};

module.exports.destroyListing = async (req, res) => {
    try {
        let {id} = req.params;
        let listing = await Listing.findByIdAndDelete(id);

        let trashFiles = listing.image.map(image => {
            return image.filename;
        });

        for (let trash of trashFiles) {
            await cloudinary.uploader.destroy(trash);
        }

        req.flash("success", "Listing Deleted Successfully");
        res.redirect("/listing");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing");
    } 
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    let  data = await Listing.findById(id);
    if (!data) {
        req.flash("error", "Required Listing does not exist");
        res.redirect("/listing");
    }
    res.render("listings/edit", {data});
};

module.exports.renderReserve = async (req, res) => {
    let {id} = req.params;
    if (!id) {
        req.flash("error", "Required Listing does not exist");
        res.redirect("/listing");
    }
    try {
        let selectedDates = JSON.parse(req.body.selectedDates);
        req.session.selectedDates = selectedDates;
        let listing = await Listing.findById(id);
        res.render("listings/reserve", {listing, selectedDates});
    } catch (err) {
        req.flash("error", err);
        res.redirect(`/listing/${id}`);
    }
}

module.exports.requestReservation = async (req, res) => {
    const {id} = req.params;

    if (!req.session.selectedDates || !req.session.selectedDates.length) {
        req.flash("error", "Something went wrong !! Please select the dates again");
        return res.redirect(`/listing/${req.params.id}`);
    }

    if (req.user.reqTokenExpiration > Date.now()) {
        req.flash("error", "You already have a pending request");
        return res.redirect(`/listing/${req.params.id}`);
    }

    try {
        let listing = await Listing.findById(req.params.id).populate('owner');
        let owner = listing.owner;

        req.user.selectedDates = req.session.selectedDates;
        let reqToken = req.user.generateReqToken();
        await req.user.save();

        // Calculating Amount
        let price = listing.price;
        let totalPrice = price * req.session.selectedDates.length;
        let amount = (totalPrice + totalPrice * 0.21);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_APP_USER,
                pass: process.env.GMAIL_APP_PASS
            }
        });
    
        const approvalURL = `${req.protocol}://${req.headers.host}/listing/${id}/reserve/approve/${reqToken}`;
        const denialURL = `${req.protocol}://${req.headers.host}/listing/${id}/reserve/deny/${reqToken}`;

        const mailOptions = {
            from: {
                name: 'InnQuisitor',
                address: process.env.GMAIL_APP_USER
            },
            to: owner.email,
            subject: `Booking Request`,
            html: `<body>
                        <table cellpadding="0" cellspacing="0"
                            style="width: 80vw; max-width: 500px; background-color: #F7F7F7; margin: auto; border: 1px solid rgba(128, 128, 128, 0.25); border-radius: 1rem; padding: 1rem;">
                            <tr>
                                <td align="center" style="padding: 0.25rem;">
                                    <img src="https://res.cloudinary.com/dhqqljnt3/image/upload/v1714725885/20240418_203344_ue48dt.png"
                                        height="80" style="height: 80px;">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        <h3>New booking request for "${listing.title}":</h3>
                                        <ul>
                                            <li>Check-in: <i style="opacity: 0.65;">${req.session.selectedDates[0]}</i></li>
                                            <li>Check-out: <i style="opacity: 0.65;">${req.session.selectedDates[req.session.selectedDates.length - 1]}</i></li>
                                            <li>Total Amount: <i style="opacity: 0.65;">&#8377; ${amount.toLocaleString("en-IN")}</i></li>                    
                                        </ul> <br>
                                    <h3>Guest Information:</h3>
                                        <ul>
                                            <li>Username: <i style="opacity: 0.65;">${req.user.username}</i></li>
                                            <li>Email: <i style="opacity: 0.65;">${req.user.email}</i></li>
                                        </ul> <br>
                                        Please review and confirm the booking.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center">
                                    <button type="button"
                                        style="border: none; border-radius: 0.5rem; background-color: #FF385C; padding: 0.75rem 1.5rem; font-size: 1rem; margin: 0.5rem auto;">
                                        <a href="${approvalURL}"
                                            style="text-decoration: none; color: white;">Approve</a>
                                    </button>
                                    <button type="button"
                                        style="border: none; border-radius: 0.5rem; background-color: #516365; padding: 0.75rem 1.5rem; font-size: 1rem; margin: 0.5rem auto;">
                                        <a href="${denialURL}"
                                            style="text-decoration: none; color: white;">Deny</a>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        Best regards,<br>
                                        InnQuisitor Team
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </body>`
        }
        
        try {
            await transporter.sendMail(mailOptions);

            req.flash("success", "You will be notified via email when HOST will approve your request");
            res.redirect(`/listing/${id}`);
            
        } catch (err) {
            req.user.selectedDates = [];
            req.user.reqToken = undefined;
            req.user.reqTokenExpiration = undefined;
            await req.user.save();

            req.flash("error", err.message);
            res.redirect(`/listing/${id}`);
        }

    } catch (err) {
        console.log(err);
        req.flash("error", err);
        res.redirect(`/listing/${id}`);
    };

};

module.exports.approveReservation = async (req, res) => { 
    let {id, reqToken} = req.params;
    const user = await User.findOne({reqToken});

    try {
        const listing = await Listing.findById(req.params.id);
        let selectedDates = user.selectedDates;

        for (let date of selectedDates) {
            if (listing.reservedDates.includes(date)) {

                user.reqToken = undefined;
                user.reqTokenExpiration = undefined;
                user.selectedDates = [];
                await user.save();

                req.flash("error", "Dates already reserved");
                res.redirect("/listing");
                return;
            }
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_APP_USER,
                pass: process.env.GMAIL_APP_PASS
            }
        });

        const payURL = `${req.protocol}://${req.headers.host}/listing/${id}/reserve/pay/${reqToken}`;

        const mailOptions = {
            from: {
                name: 'InnQuisitor',
                address: process.env.GMAIL_APP_USER
            },
            to: user.email,
            subject: `Request Approved`,
            html: `<body>
                        <table cellpadding="0" cellspacing="0" style="width: 80vw; max-width: 500px; background-color: #F7F7F7; margin: auto; border: 1px solid rgba(128, 128, 128, 0.25); border-radius: 1rem; padding: 1rem;">
                            <tr>
                                <td align="center" style="padding: 1rem;">
                                    <img src="https://res.cloudinary.com/dhqqljnt3/image/upload/v1714725885/20240418_203344_ue48dt.png"
                                        height="80" style="height: 80px;">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Dear ${user.username},<br><br>
                                        We're thrilled to inform you that your booking request for <b
                                            style="font-weight: bold;">${listing.title}</b>
                                        has been approved by the host.<br><br>
                                        To confirm your booking, please click on the <b style="font-weight: bold;">Pay</b> button to proceed
                                        with
                                        payment:
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center">
                                    <button type="button"
                                        style="border: none; border-radius: 0.5rem; background-color: #FF385C; padding: 0.75rem 1.5rem; font-size: 1rem; margin: 0.5rem auto;">
                                        <a href="${payURL}" style="text-decoration: none; color: white;">Confirm & pay</a>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        This will secure your booking and ensure that your accommodation is reserved for your stay from <b
                                            style="font-weight: bold;">${selectedDates[0]}</b> to <b
                                            style="font-weight: bold;">${selectedDates[selectedDates.length - 1]}</b>.<br><br>
                                        Please note that your booking is only confirmed once payment is received. If you have any questions
                                        or concerns,
                                        feel free to reach out to us.<br><br>
                                        Thank you for choosing us.<br>
                                        Best regards,<br>
                                        InnQuisitor Team
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </body>`
        }
        
        await transporter.sendMail(mailOptions);

        req.flash("success", "Approval Successful. Guest will be notified via email");
        res.redirect("/listing");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing");
    }
};

module.exports.denyReservation = async (req, res) => {
    let {id, reqToken} = req.params;
    const user = await User.findOne({reqToken});
    const listing = await Listing.findById(id);

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_APP_USER,
                pass: process.env.GMAIL_APP_PASS
            }
        });

        const mailOptions = {
            from: {
                name: 'InnQuisitor',
                address: process.env.GMAIL_APP_USER
            },
            to: user.email,
            subject: `Request Denied`,
            html: `<body>
                        <table cellpadding="0" cellspacing="0"
                            style="width: 80vw; max-width: 500px; background-color: #F7F7F7; margin: auto; border: 1px solid rgba(128, 128, 128, 0.25); border-radius: 1rem; padding: 1rem;">
                            <tr>
                                <td align="center" style="padding: 0.25rem;">
                                    <img src="https://res.cloudinary.com/dhqqljnt3/image/upload/v1714725885/20240418_203344_ue48dt.png"
                                        height="80" style="height: 80px;">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        Dear ${user.username}, <br><br>
                                        We are sorry to inform you that your booking request for <b>${listing.title}</b> has been denied by the host.
                                        <br>
                                        We understand that this may be disappointing, but we would like to assure you that there are many
                                        other great options available on our platform. <br><br>
                                        Our team is committed to providing you with the best possible experience, and we hope to help you
                                        find the perfect accommodation for your needs.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center">
                                    <button type="button"
                                        style="border: none; border-radius: 0.5rem; background-color: #FF385C; padding: 0.75rem 1.5rem; font-size: 1rem; margin: 0.5rem auto;">
                                        <a href="${req.protocol}://${req.headers.host}/listing" style="text-decoration: none; color: white;">Discover more</a>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        If you have any questions or concerns, please do not hesitate to contact us. <br><br>
                                        Thank you for your understanding. <br><br>
                                        Best regards, <br>
                                        InnQuisitor Team
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </body>`
        }
        
        await transporter.sendMail(mailOptions);

        user.reqToken = undefined;
        user.reqTokenExpiration = undefined;
        user.selectedDates = [];
        await user.save();

        req.flash("success", "Denial Successful. Guest will be notified via email");
        res.redirect("/listing");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing");
    }
};

module.exports.renderPay = async (req, res) => {
    let {id, reqToken} = req.params;
    const user = await User.findOne({reqToken});

    if (user.username !== req.user.username) {
        req.flash("error", "Booking Request was made from another account");
        return res.redirect("/listing");
    }

    try {
        let listing = await Listing.findById(id);
        let selectedDates = user.selectedDates;
        res.render("listings/pay", {listing, selectedDates});

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing");
    }

};

module.exports.createOrder = async (req, res) => {
    let {id} = req.params;
    let user = req.user;

    try {
        let listing = await Listing.findById(id);
        let price = listing.price;
        let selectedDates = user.selectedDates;
        let totalPrice = price * selectedDates.length;
        let amount = (totalPrice + totalPrice * 0.21) * 100;

        let razorpay = new Razorpay({
            key_id: process.env.RZP_KEY_ID,
            key_secret: process.env.RZP_KEY_SECRET
        });

        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
        });

        req.session.order_id = order.id;

        order.name = user.username;
        order.email = user.email;
        order.keyID = process.env.RZP_KEY_ID;

        res.status(200).send(order);

    } catch (err) {
        req.flash("error", err.message);
        res.redirect(`/listing`);
    }
};

module.exports.verifyPayment = async (req, res) => {
    let {id, reqToken} = req.params;

    const generated_signature = crypto.createHmac('sha256', process.env.RZP_KEY_SECRET).update(req.session.order_id + "|" + req.body.razorpay_payment_id).digest('hex');

    if (generated_signature == req.body.razorpay_signature) {
        const listing = await Listing.findById(id);
        const user = await User.findOne({reqToken});

        listing.reservedDates.push(...user.selectedDates);
        await listing.save();

        // reservation dates
        let dates = user.selectedDates;

        // reservation amount
        let price = listing.price;
        let totalPrice = price * dates.length;
        let amount = (totalPrice + totalPrice * 0.21);

        const reservation = new Reservation({listing, dates, amount});
        await reservation.save();

        user.reservations.push(reservation);
        user.reqToken = undefined;
        user.reqTokenExpiration = undefined;
        user.selectedDates = [];
        await user.save();
        
        req.flash("success", "Congratulations! Your hotel reservation has been confirmed.");
        return res.redirect("/listing");
    }

    req.flash("error", "Invalid payment signature found");
    res.redirect("/listing");
};