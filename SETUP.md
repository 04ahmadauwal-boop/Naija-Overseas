# Naija & Overseas — Setup Guide

## 1. Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Paystack account (free — use test keys to start)
- Gmail account (for email notifications)
- Cloudinary account (free — for image uploads)

## 2. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in .env with your real values (see below)
npm run dev
```

### server/.env values to fill in:
| Key | Where to get it |
|-----|----------------|
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Any random string (e.g. use: `openssl rand -hex 32`) |
| `PAYSTACK_SECRET_KEY` | Paystack Dashboard → Settings → API Keys |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail → Security → App Passwords (16-char code) |
| `CLOUDINARY_*` | Cloudinary Dashboard → API Keys |

## 3. Frontend Setup

```bash
cd client
cp .env.example .env
# Fill in:
# VITE_API_URL=http://localhost:5000/api
# VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx  (from Paystack Dashboard)
npm run dev
```

## 4. Tawk.to Live Chat
1. Go to tawk.to → Create free account
2. Copy your Property ID
3. Replace `YOUR_TAWK_PROPERTY_ID` in `client/index.html` with your actual ID

## 5. Create First Admin User
After starting the server, register normally then run this in MongoDB Atlas:
```
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

## 6. Run Both Together
```bash
# From root folder:
npm run dev
```

## 7. Deployment

### Frontend → Vercel
1. Push `client/` folder to GitHub
2. Connect repo to Vercel
3. Set root directory to `client`
4. Add environment variables from `.env`

### Backend → Railway
1. Push `server/` folder to GitHub  
2. Connect repo to Railway
3. Add all environment variables from `server/.env`
4. Set start command: `node server.js`

### Connect Domain
1. In Vercel → Domains → Add `naijaandoverseas.com`
2. Update DNS A record at your domain registrar to point to Vercel

## 8. Go Live Checklist
- [ ] Switch Paystack keys from `pk_test_` to `pk_live_`
- [ ] Update `CLIENT_URL` in server `.env` to `https://naijaandoverseas.com`
- [ ] Update `VITE_API_URL` in client `.env` to Railway backend URL
- [ ] Test payment flow with a real card
- [ ] Add logo to `client/public/favicon.svg`
- [ ] Update placeholder social media links in Footer.jsx
- [ ] Update placeholder phone/email in Contact.jsx and Footer.jsx
