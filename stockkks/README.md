# Stock Video Hub

A web application for searching, viewing, and downloading high-quality stock videos.

## Features

- Search videos by keyword and category
- Video playback in browser
- Direct download of videos
- Admin panel for uploading new videos
- Secure authentication for admin users
- Cloud storage for videos using Cloudinary

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Cloud Storage: Cloudinary

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud)
- Cloudinary account for video storage

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd stockkks
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory (or edit the existing one)
   - Add the following variables:
     ```
     PORT=5000
     MONGO_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/<your-database>?retryWrites=true&w=majority
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     JWT_SECRET=your_jwt_secret_key_should_be_long_and_complex
     ```

4. Seed admin user
   ```
   node utils/seedAdmin.js
   ```
   This will create an admin user with the following credentials:
   - Username: admin
   - Password: admin123
   
   **Important:** Change these credentials in production!

5. Start the server
   ```
   npm start
   ```

6. Access the application
   - Main site: http://localhost:5000
   - Admin panel: http://localhost:5000/admin

## Deployment

### Deploying to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Log in to Heroku CLI
   ```
   heroku login
   ```
3. Create a new Heroku app
   ```
   heroku create stock-video-hub
   ```
4. Set environment variables
   ```
   heroku config:set MONGO_URI=your_mongo_uri
   heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
   heroku config:set CLOUDINARY_API_KEY=your_api_key
   heroku config:set CLOUDINARY_API_SECRET=your_api_secret
   heroku config:set JWT_SECRET=your_jwt_secret
   ```
5. Push to Heroku
   ```
   git push heroku main
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Cloudinary](https://cloudinary.com/) for video storage and streaming
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Express.js](https://expressjs.com/) for the backend framework
