# E-commerce Application

A modern e-commerce application built with Vue 3, Pinia, and Firebase.

## Features

- 🛍️ Product listing with search and filtering
- 🛒 Shopping cart functionality
- 🔐 User authentication (login/register)
- 📱 Responsive design
- ⚡ Fast and performant with Vite
- 🎨 Clean and modern UI

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase account (for authentication and database)

## Project Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ecommerce-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
ecommerce-app/
├── public/               # Static files
├── src/
│   ├── assets/           # Images, icons, fonts
│   ├── components/        # Reusable components
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── router/            # Vue Router configuration
│   ├── services/          # API and Firebase services
│   ├── store/             # Pinia store
│   ├── utils/             # Utility functions
│   ├── App.vue            # Root component
│   └── main.js            # Application entry point
├── .env                   # Environment variables
├── .gitignore
├── package.json
├── README.md
└── vite.config.js         # Vite configuration
```

## Technologies Used

- Vue 3 - Progressive JavaScript framework
- Pinia - State management
- Vue Router - Client-side routing
- Firebase - Authentication and database
- Vite - Build tool and dev server
- Tailwind CSS (optional) - Utility-first CSS framework

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
