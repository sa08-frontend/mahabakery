# Premium 3D Bakery - Razorpay Integration

A luxury 3D bakery experience with seamless Razorpay payment integration.

## 🚀 Features

- **3D Product Visualization**: Interactive Three.js scenes for each bakery product
- **Shopping Cart**: Persistent cart with localStorage
- **Razorpay Integration**: Secure payment processing
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live cart badge and toast notifications

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, Three.js, HTML5 Canvas
- **Backend**: Node.js, Express.js
- **Payment**: Razorpay API
- **Deployment**: Railway (Backend), GitHub Pages/Netlify (Frontend)

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Razorpay account with API keys

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd premium-3d-bakery
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your Razorpay keys:

```bash
cp env.example .env
```

Edit `.env` with your Razorpay credentials:

```env
# Get these from https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
PORT=3000
```

### 3. Local Development

```bash
# Start the backend server
npm start

# Frontend runs on localhost:5500 (VS Code Live Server)
# Backend API on localhost:3000
```

## 🚢 Deployment

### Backend (Railway)

1. **Connect Repository**:
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Deploy the project

2. **Environment Variables**:
   In Railway dashboard → Variables, add:
   ```
   RAZORPAY_KEY_ID=rzp_live_your_live_key
   RAZORPAY_KEY_SECRET=your_live_secret
   NODE_ENV=production
   ```

3. **Domain**:
   - Railway provides a domain like: `https://bakery-backend-production-dbeb.up.railway.app`

### Razorpay Dashboard Settings

- In Razorpay Dashboard > Settings > API Keys (or App):
  - Add allowed URLs:
    - `http://localhost:5500`
    - `http://127.0.0.1:5500`
    - `http://localhost:3000`
    - `http://127.0.0.1:3000`
    - `https://bakery-backend-production-dbeb.up.railway.app`
  - Ensure the API key used is from the same account and mode (test/live).

### Frontend Deployment

Deploy the static files (`index.html`, `app.js`, `style.css`) to:
- **Netlify**: Drag & drop the files or connect repository
- **GitHub Pages**: Use GitHub Actions
- **Vercel**: Connect repository

**Important**: Update `API_BASE_URL` in `app.js` with your Railway backend URL:

```javascript
const API_BASE_URL = 'https://your-railway-app.railway.app';
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/config` | Get Razorpay key |
| POST | `/api/create-order` | Create payment order |
| POST | `/api/verify-payment` | Verify payment signature |

## 🧪 Testing

### Local Testing
```bash
# Test API endpoints
node test-api.js

# Or use curl:
curl http://localhost:3000/health
curl http://localhost:3000/api/config
```

### Payment Flow Testing

1. **Add items to cart**
2. **Go to checkout**
3. **Fill form and click "Pay Now"**
4. **Use Razorpay test card**: `4111 1111 1111 1111`
5. **Complete payment** → Redirect to success page

## 🐛 Troubleshooting

### Common Issues

**"Network error" during payment:**
- ✅ CORS is configured in backend
- ✅ API_BASE_URL points to correct Railway URL
- ✅ Environment variables are set in Railway

**"Payment configuration failed":**
- ✅ RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set
- ✅ Keys are valid (test keys for development)

**Mobile responsiveness issues:**
- ✅ Form inputs have `font-size: 16px` to prevent zoom
- ✅ Form rows stack vertically on mobile

### Debug Steps

1. **Check backend logs** in Railway dashboard
2. **Test API endpoints** directly:
   ```bash
   curl https://your-railway-app.railway.app/health
   ```
3. **Browser console** for frontend errors
4. **Network tab** to check API calls

## 📱 Mobile Optimization

- **Touch-friendly buttons** (44px minimum)
- **No zoom on input focus** (16px font-size)
- **Responsive grid layouts**
- **Optimized 3D scenes** for mobile GPUs

## 🔒 Security

- **Environment variables** for sensitive data
- **Payment verification** with signature validation
- **CORS protection** (configurable origins)
- **Input validation** on all endpoints

## 📈 Performance

- **Lazy loading** of Three.js scenes
- **Compressed assets** and optimized bundles
- **Efficient re-renders** and memory management
- **CDN delivery** for static assets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues:
1. Check the troubleshooting section
2. Review Railway deployment logs
3. Test with Razorpay sandbox
4. Create an issue with detailed error logs

---

**Happy Baking! 🧁✨**