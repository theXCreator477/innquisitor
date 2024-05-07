const User = require("../models/userSchema");
const PendingUser = require("../models/pendingUserSchema");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
    let {username, email, password} = req.body;
    const regexp = new RegExp('^[a-zA-Z0-9]+(\\s[a-zA-Z0-9]+)?$');

    if (!email || !username || !password) {
        req.flash('error', 'All fields are required');
        res.redirect('/signup');
        return;
    }

    username = username.trim();
    if (!regexp.test(username)) {
        req.flash('error', 'Username can only contain letters and numbers');
        return res.redirect('/signup');
    }
    email = email.trim();
    password = password.trim();

    let existingUser = await User.findOne({ username });
    if (existingUser) {
        req.flash('error', 'This username is not available');
        res.redirect('/user/signup');
        return;
    }
    existingUser = await User.findOne({ email });
    if (existingUser) {
        req.flash('error', 'Email address already in use');
        res.redirect('/user/signup');
        return;
    }

    try {
        const verifyToken = crypto.randomBytes(16).toString("hex");

        const user = new PendingUser({username, email, password, verifyToken, expiresAt: Date.now() + 30 * 60 * 1000});
        await user.save();

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
            to: email,
            subject: `Welcome ${username}, Discover Your Perfect Stay with InnQuisitor`,
            html: `<body>
                        <table cellpadding="0" cellspacing="0" style="width: 80vw; max-width: 500px; background-color: #F7F7F7; margin: auto; border: 1px solid rgba(128, 128, 128, 0.25); border-radius: 1rem; padding: 1rem;">
                            <tr>
                                <td align="center" style="padding: 0.25rem;">
                                    <img src="https://res.cloudinary.com/dhqqljnt3/image/upload/v1714725885/20240418_203344_ue48dt.png"
                                        height="80" style="height: 80px;">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        Dear ${username},<br><br>
                                        We are delighted to welcome you to InnQuisitor, the premier hotel booking platform for discerning travelers. Our tagline, "Discover Your Perfect Stay," is not just a slogan, it's a promise we make to every one of our valued users.<br><br>Our platform is designed to provide you with a seamless and intuitive booking experience, so you can focus on what matters most - creating unforgettable memories.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center">
                                    <button type="button"
                                        style="border: none; border-radius: 0.5rem; background-color: #FF385C; padding: 0.75rem 1.5rem; font-size: 1rem; margin: 0.5rem auto;">
                                        <a href="${req.protocol}://${req.headers.host}/user/verify/${verifyToken}" style="text-decoration: none; color: white;">Verify Email</a>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        Link is valid for 30 minutes.<br><br>Thank you for choosing InnQuisitor, and we look forward to helping you discover your perfect stay.<br><br>Best regards,<br>InnQuisitor Team
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </body>`,
        }
        
        await transporter.sendMail(mailOptions);

        req.flash("success", "A verification email has been sent to your email address. Please click the link to activate your account");
        req.redirect("/listing");
        
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing");
    }
};

// module.exports.verify = async (req, res) => {
//     console.log("PROGRAM STARTED\n");

//     const {token} = req.params;
//     console.log("TOKEN FETCHED FROM PARAMS\n");

//     const user = await PendingUser.findOne({verifyToken: token});
//     console.log("USER FOUND FROM DB\n");

//     if (!user) {
//         console.log("IF STATEMENT EXECUTED\n");

//         req.flash("error", "Token Expired");
//         console.log("FLASH MESSAGE SET TO ERUR\n");

//         console.log("REDIRECTING TO HOME FROM IF BLOCK\n");
//         return res.redirect(307, "/listing");
//     }

//     const profilePic = `/assets/Images/pic-${Math.floor(Math.random() * 5 + 1)}.avif`;
//     console.log("PROFILE PIC CHOSEN\n");

//     const newUser = new User({
//         username: user.username,
//         email: user.email,
//         profilePic: profilePic,
//     });
//     console.log("NEW USER CREATED\n");

//     try {
//         console.log("TRY BLOCK STARTED\n");

//         const registeredUser = await User.register(newUser, user.password);
//         console.log("USER REGISTERED\n");

//         await PendingUser.deleteMany({email: user.email});
//         console.log("PENDING USER DELETED\n");

//         await req.login(registeredUser, (err) => {
//             console.log("LOGIN FUNCTION STARTED\n");
//             if (err) {
//                 console.log("ERROR IN LOGIN FUNCTION\n");
//                 console.log(err);
//                 req.flash("error", "Error logging in");
//                 console.log("FLASH MESSAGE SET TO ERROR IN LOGIN FUNCTION\n");
//                 console.log("REDIRECTING TO HOME FROM ERROR IN LOGIN FUNCTION\n");
//                 return res.redirect(307, "/listing");
//             }
            
//             req.flash("success", "Email verification successful");
//             console.log("FLASH MESSAGE SET TO SUCCESS IN LOGIN FUNCTION\n");

//             console.log("REDIRECTING TO HOME FROM LOGIN FUNCTION\n");
//             return res.redirect(307, "/listing");
//         });

//     } catch (err) {
//         console.log("CATCH BLOCK STARTED\n");
//         console.log(err);

//         req.flash("error", err.message);
//         console.log("FLASH MESSAGE SET TO ERROR FROM CATCH BLOCK\n");

//         console.log("REDIRECTING TO HOME FROM CATCH BLOCK\n");
//         return res.redirect(307, "/listing");
//     }
//     console.log("PROGRAM ENDED\n");
//     console.log("LOCALS AT THE END\n");
//     console.log(res.locals);
// };

module.exports.verify = async (req, res) => {
    console.log("PROGRAM STARTED");
    const {token} = req.params;
    let user, createdUser;

    try {
        user = await PendingUser.findOne({verifyToken: token});
    } catch (err) {
        req.flash("error", "Something went wrong. Please try again");
        return res.redirect("/listing");
    }

    if (!user) {
        console.log("IF BLOCK EXECUTING");
        req.flash("error", "Token Expired");
        console.log("REDIRECTING TO HOME FROM IF BLOCK");
        return res.redirect("/listing");
    }

    // const profilePic = `/assets/Images/pic-${Math.floor(Math.random() * 5 + 1)}.avif`;
    const profilePic = `/assets/Images/pic-1.avif`;

    const newUser = new User({
        username: user.username,
        email: user.email,
        profilePic: profilePic,
    });

    try {
        console.log("TRY CREATING USER");
        createdUser = await newUser.setPassword(user.password);
        await newUser.save()
        await PendingUser.deleteMany({email: user.email});
    } catch (err) {
        console.log("CAUGHT ERROR");
        req.flash("error", err.message);
        return res.redirect("/listing");
    }

    req.login(createdUser, (err) => {
        console.log("LOGIN FUNCTION STARTED");
        if (err) {
            console.log("ERROR IN LOGIN FUNCTION");
            req.flash("error", err.message);
            console.log("REDIRECTING TO HOME FROM ERROR IN LOGIN FN");
            return res.redirect("/listing");
        }
        req.flash("success", "Email verification successful");
        console.log("REDIRECTING TO HOME FROM LOGIN FN");
        res.redirect("/listing");
    });
    res.redirect("/listing");

    console.log("PROGRAM ENDED");
};

// module.exports.register = (req, res) => {

// };

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    let {url, method} = res.locals.redirectInfo || {};
    let redirectUrl = url || "/listing";
    req.flash("success", "Welcome to InnQuisitor. Discover your perfect stay with us !");
    if (method && method !== 'GET') res.redirect(307, redirectUrl);
    else res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        else {
            req.flash("success", "Logged Out Successfully");
            res.redirect("/listing");
        }
    });
};

//To get the username 
module.exports.renderForgot = (req, res) => {
    res.render("users/forgot");
};

//To submit the username
module.exports.submitForgot = async (req, res) => {
    let {userInfo} = req.body;
    if (!userInfo) {
        req.flash("error", "The field is requierd");
        res.redirect("/user/forgot");
        return;
    }

    userInfo = userInfo.trim();
    let user;
    if (userInfo.includes('@')) user = await User.findOne({email: userInfo});
    else  user = await User.findOne({username: userInfo});

    if (!user) {
        req.flash("error", "credentials do not match our records.");
        res.redirect("/user/forgot");
        return;
    }

    const resetToken = user.generateResetToken();
    
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_APP_USER,
            pass: process.env.GMAIL_APP_PASS
        }
    });

    const mailOptions = {
        from: {
            name: 'InnQuisitor Support',
            address: process.env.GMAIL_APP_USER
        },
        to: user.email,
        subject: 'Password Reset Request',
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
                                <p>
                                    Hello ${user.username},<br><br>
                                    We have received a password reset request for your account.<br>
                                    If you did not request this, please ignore this email.<br><br>
                                    To reset your password, please click the button below:
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center">
                                <button type="button"
                                    style="border: none; border-radius: 0.5rem; background-color: #FF385C; padding: 0.75rem 1.5rem; font-size: 1rem; margin: 0.5rem auto;">
                                    <a href="${req.protocol}://${req.headers.host}/user/reset/${resetToken}" style="text-decoration: none; color: white;">Reset Password</a>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>
                                    This link will expire in 5 minutes.<br><br>
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
        req.flash("success", "A password reset email has been sent to your email address.");
        res.redirect("/user/login");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/user/forgot");
    }

};

//To get the new password page
module.exports.renderReset = async (req, res) => {
    const {resetToken} = req.params;
    try {
        const user = await User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } });
    
        if (!user) {
          req.flash("error", "Token Expired");
          res.redirect("/user/forgot");
          return;
        }
    
        res.render("users/reset", { resetToken });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/user/forgot");
    }
};

//To submit the new password
module.exports.submitReset = async (req, res) => {
    const {create, confirm} = req.body.password;
    const {resetToken} = req.params;

    if (!create || !confirm) {
        req.flash("error", "The fields are required");
        res.redirect("/user/login");
        return;
    }
    
    if (create === confirm) {
        try {
            const user = await User.findOne({resetToken, resetTokenExpiration: {$gt: Date.now()}});
            
            if (!user) {
                req.flash("error", "Token Expired");
                res.redirect("/user/forgot");
                return;
            }

            try {
                await User.findByIdAndDelete(user._id);

                let newUser = new User({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePic: user.profilePic
                });

                await User.register(newUser, create);

                req.flash("success", "Password reset successfully");
                res.redirect("/user/login");
            } catch (err) {
                req.flash("error", err.message);
                res.redirect("/user/forgot");
            }
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("/user/forgot");
        }
        
    } else {
        req.flash("error", "Passwords do not match");
        res.redirect(`/user/reset/${resetToken}`);
    }
};

module.exports.renderBookings = async (req, res) => {
    const user = await req.user.populate({path: "reservations", populate: {path: "listing"}});
    res.render("listings/bookings", {user});
}