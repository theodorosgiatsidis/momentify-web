# Momentify - Web Application

Modern React + TypeScript frontend for Momentify with real-time updates.

## Tech Stack

- **React** 18.2.0 - UI library
- **Vite** 5.0.11 - Fast build tool
- **TypeScript** 5.3.3
- **React Admin** 4.16.12 - Admin panel framework
- **TanStack Query** 5.17.9 - Data fetching and caching
- **Socket.io Client** 4.6.0 - Real-time updates
- **Tailwind CSS** 3.4.1 - Utility-first styling
- **React Router** 6.21.1 - Routing

## Features

- 🎨 Beautiful gradient UI with Tailwind CSS
- 📱 Mobile-first responsive design
- 🔴 Real-time photo/video updates
- 📸 Camera capture support
- 📤 Direct upload to cloud storage
- 🎭 Image lightbox with pinch-to-zoom
- 👨‍💼 Admin panel with React Admin
- ⚡ Optimistic UI updates
- 🔄 Automatic reconnection
- ✅ Component tests with Vitest

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

**Required variables:**
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_DOMAIN=localhost:3000
```

For production, update these to your deployed backend URLs.

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at:
- **App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

**Default admin credentials:**
- Email: `admin@memory.app`
- Password: `admin123`

## Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── admin/          # React Admin panel
│   │   ├── AdminApp.tsx
│   │   ├── authProvider.ts
│   │   ├── dataProvider.ts
│   │   └── resources/
│   ├── components/     # Reusable components
│   │   ├── Gallery.tsx
│   │   └── UploadWidget.tsx
│   ├── pages/          # Page components
│   │   └── MemoryPage.tsx
│   ├── lib/            # Utilities
│   │   ├── api-client.ts
│   │   └── socket-client.ts
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main routing
│   └── main.tsx        # Entry point
├── tailwind.config.js  # Tailwind configuration
├── vite.config.ts      # Vite configuration
└── package.json
```

## Routes

### Public Routes
- `/` - Home page
- `/m/:slug` - Memory page (view and upload)

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/login` - Admin login
- `/admin/memories` - Memory list
- `/admin/memories/create` - Create new memory
- `/admin/memories/:slug/show` - Memory details

## Features in Detail

### Public Memory Page
- View event details and cover photo
- Upload photos/videos from camera or gallery
- View gallery of all uploaded media
- Real-time updates when others upload
- Lightbox for viewing full-size media
- Mobile-optimized upload experience

### Admin Panel
- Create new memory events
- Upload cover images
- Generate QR codes automatically
- View memory statistics
- Download QR codes
- Manage media items

### Real-Time Updates
- WebSocket connection to backend
- Automatic reconnection on disconnect
- Live photo/video additions to gallery
- Connection status indicator

## Testing

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## Styling

This project uses **Tailwind CSS** for styling. Key features:

- **Gradient backgrounds** - Beautiful indigo → purple → pink gradients
- **Glassmorphism** - Backdrop blur effects
- **Animations** - Smooth transitions and hover effects
- **Mobile-first** - Responsive design from the ground up
- **Custom animations** - Fade-in, scale-in, slide-up effects

Tailwind configuration in `tailwind.config.js`.

## Deployment

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set environment variables:
   - `VITE_API_URL` - Your backend API URL
   - `VITE_WS_URL` - Your WebSocket URL
3. Build command: `npm run build`
4. Output directory: `dist`

### Deploy to Render
1. Create a new Static Site
2. Connect repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables

## Environment Variables

- `VITE_API_URL` - Backend API base URL
- `VITE_WS_URL` - WebSocket server URL
- `VITE_APP_DOMAIN` - Frontend domain (for QR codes)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with camera API support

## License

MIT
