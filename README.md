# SmartList 📃

A simple, fast, and reliable web application for creating instant submission lists. Perfect for collecting names and roll numbers without any authentication required.

## ✨ Features

- **No Sign-up Required** - Create lists instantly without any registration
- **Shareable Links** - Generate unique links to share your lists
- **Real-time Updates** - See submissions as they come in
- **Duplicate Prevention** - Prevents duplicate roll number submissions
- **Minimal & Aesthetic** - Clean dark theme interface
- **Mobile Responsive** - Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartlist.git
   cd smartlist
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

5. **Start the frontend server**
   
   In a new terminal:
   ```bash
   cd frontend
   npx http-server -p 3000 -c-1
   ```

6. **Access the application**
   
   Open your browser and go to `http://localhost:3000`

## 🛠️ How It Works

1. **Create a List** - Enter a title and description for your submission list
2. **Share the Link** - Copy the generated shareable link and distribute it
3. **Collect Submissions** - People can submit their name and roll number
4. **View Entries** - See all submissions in real-time with timestamps

## 📁 Project Structure

```
smartlist/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── models/
│   │   ├── List.js            # List schema
│   │   └── Entry.js           # Entry schema
│   ├── routes/
│   │   └── smartlist.js       # API routes
│   ├── index.js               # Main server file
│   └── package.json
├── frontend/
│   ├── index.html             # Main HTML file
│   ├── script.js              # Frontend JavaScript
│   └── styles.css             # Styling
└── README.md
```

## 🔧 API Endpoints

### Lists
- `POST /api/lists` - Create a new list
- `GET /api/lists/:shareableId` - Get list details

### Entries
- `POST /api/lists/:shareableId/entries` - Submit an entry
- `GET /api/lists/:shareableId/entries` - Get all entries for a list

### System
- `GET /` - Health check endpoint
- `GET /keep-alive` - Keep-alive endpoint (prevents server sleeping)

## 🎨 Features in Detail

### Keep-Alive System
The backend includes an automatic keep-alive system that pings the server every 14 minutes to prevent it from sleeping on platforms like Heroku or Render.

### Smart URL Generation
Each list gets a unique 8-character shareable ID that's easy to share and remember.

### Duplicate Prevention
The system automatically prevents duplicate roll number submissions to the same list.

### Real-time Updates
Submissions appear instantly without needing to refresh the page.

### Responsive Design
Works perfectly on desktop, tablet, and mobile devices with a clean dark theme.

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Vercel)

1. Set up your MongoDB Atlas database
2. Configure environment variables in your hosting platform
3. Deploy the backend folder

### Frontend Deployment (Netlify/Vercel/GitHub Pages)

1. Update the `baseURL` in `script.js` to point to your deployed backend
2. Deploy the frontend folder

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**VJ_2303**

- Created with ❤️ for simple and efficient data collection

## 🔗 Links

- [Live Demo](https://yourdeployedapp.com) (Update with your deployed URL)
- [Report Bug](https://github.com/yourusername/smartlist/issues)
- [Request Feature](https://github.com/yourusername/smartlist/issues)

---

SmartList © 2025 • Simple, Fast, Reliable
