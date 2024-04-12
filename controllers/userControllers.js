const User = require("../models/userSchema");
const nodemailer = require("nodemailer");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
    let {username, email, password} = req.body;

    if (!email || !username || !password) {
        req.flash('error', 'All fields are required');
        res.redirect('/signup');
        return;
    }

    username = username.trim();
    email = email.trim();
    password = password.trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        req.flash('error', 'Email address already in use');
        res.redirect('/user/signup');
        return;
    }

    let profilePic = `/assets/Images/pic-${Math.floor(Math.random() * 5 + 1)}.avif`; 
    let newUser = new User({username, email, profilePic});

    try {
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            else {
                req.flash("success", "Welcome to AirBnB. Book your next adventure now!");
                res.redirect("/listing");
            }
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/user/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    let {url, method} = res.locals.redirectInfo || {};
    let redirectUrl = url || "/listing";
    req.flash("success", "Welcome to AirBnB. Book your next adventure now!");
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
            name: 'BnB Bookings',
            address: process.env.GMAIL_APP_USER
        },
        to: user.email,
        subject: 'Password Reset Request',
        html: `Hello ${user.username},<br><br>
         We have received a password reset request for your account.<br>
         If you did not request this, please ignore this email.<br><br>
         To reset your password, please <a href="${req.protocol}://${req.headers.host}/user/reset/${resetToken}">click here</a><br><br>
         This link will expire in 5 minutes.<br><br>
         Best regards,<br>BnB Bookings`
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