# InnQuisitor- A Full Fledged Hotel Booking Platform

Welcome to our Hotel Booking Website! This project is a full-stack web application that allows users to browse, book, and manage hotel listings. The website includes features such as user authentication, hotel listings management, reservation requests, and payment processing.

## Features

- **User Authentication:**
  - Create an account, log in, log out, and reset passwords.
- **Hotel Listings Management:**
  - Upload, edit, and delete hotel listings (authorized users only).
- **Reservation Requests:**
  - Request to reserve a hotel for a specific period with host approval/denial notifications.
- **Payment Processing:**
  - Secure payment gateway using Razorpay.
- **Email Notifications:**
  - Host request notifications, user approval/denial notifications, and password reset notifications.
- **Interactive Map Integration:**
  - Visualize hotel locations using Mapbox.
- **Reservation Management:**
  - View and manage reservations in the user profile.

## Tech Stack

- **Express.js:** Web application framework.
- **MongoDB:** NoSQL database for storing user and hotel data.
- **Mongoose:** MongoDB object modeling.
- **Passport.js:** User authentication middleware.
- **Cloudinary:** Image upload and management.
- **Mapbox:** Interactive map integration.
- **Razorpay:** Payment gateway.
- **Syncfusion:** Calendar integration.
- Other libraries: `connect-flash`, `connect-mongo`, `cookie-parser`, `dotenv`, `ejs`, `ejs-mate`, `express-session`, `joi`, `method-override`, `multer`, `multer-storage-cloudinary`.

## Demo

Check out our live demo at [Hotel Booking Website](https://innquisitor.onrender.com).

## Project Video

Watch our project video at [Project Video](https://youtu.be/tvMy1AiOZxI?si=Rkl6r_ds9yUvJv_f).

## Getting Started

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/theXCreator477/innquisitor.git
   ```

2. Navigate to the project directory:

   ```bash
   cd innquisitor
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your environment-specific configuration (e.g., database connection details, API keys).

5. Start the server:

   ```bash
   npm start
   ```

6. Access the application in your browser at `http://localhost:3000`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
