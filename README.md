# ☀️ Helio - Your AI Wellness Companion

Rise to your best self with AI-powered wellness coaching, smart habit tracking, and personalized health insights. Built as a Progressive Web App (PWA) with React and Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- **Gemini API Key** (FREE from Google AI Studio)

### Get Your FREE Gemini API Key (2 minutes)
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy your key

### Installation & Setup

```bash
# Install dependencies
npm install

# Create .env file and add your API key
echo "VITE_GEMINI_API_KEY=your_actual_key_here" > .env

# Start development server
npm run dev

# Open browser at http://localhost:5173
```

**📖 Full AI Setup Guide:** See `GEMINI-SETUP.md` for detailed instructions

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📦 What's Built

### ✅ Landing Page Features
- Beautiful, modern hero section with gradient effects
- Email capture form for waitlist building
- Pre-order functionality ready for Stripe integration
- 8 key feature showcases with icons (all clickable and working!)
- "Why Different" comparison section
- Pricing tiers (Free, Lifetime Pro, Monthly)
- Mobile-responsive design
- Professional styling with smooth animations
- Install app button for PWA

### ✅ AI-Powered Features (NEW! 🤖)
- **AI Personal Coach** - Chat with Gemini AI for personalized wellness advice
- **Progress Photo Analysis** - Upload photos, get AI body composition feedback
- **Food Photo Recognition** - Snap meals, get automatic calorie counting
- **AI Workout Generator** - Get personalized workout plans instantly
- **Smart Habit Tracking** - AI analyzes patterns and suggests improvements
- **Motivational AI** - Proactive tips and encouragement

### ✅ Full Dashboard Features
- **Smart Tracking** - Interactive habit tracker with checkboxes
- **Progress Photos** - Upload and track visual progress over time
- **Nutrition Logging** - Photo-based meal logging with AI analysis
- **Workout Programs** - 4 workout types with AI-generated custom plans
- **Mental Wellness** - Mood tracking, gratitude journal, meditation
- **Analytics** - Progress visualization and stats
- **Smart Reminders** - Customizable daily reminders with toggle switches

### ✅ Technical Features
- Progressive Web App (PWA) - installable on mobile/desktop
- React 19 with React Router for navigation
- **Google Gemini AI integration** for intelligent features
- Vite for blazing-fast development and builds
- Fully responsive CSS with mobile-first approach
- Optimized performance and SEO
- Real-time AI responses (1-3 seconds)

## 🎯 Next Steps for Launch

### 1. Add Your Stripe Payment Link

Edit `src/pages/LandingPage.jsx` line 21:

```javascript
const handlePreOrder = () => {
  // Replace with your actual Stripe payment link
  window.open('https://buy.stripe.com/YOUR_PAYMENT_LINK_HERE', '_blank')
}
```

**How to get your Stripe link:**
1. Go to https://dashboard.stripe.com/payment-links
2. Click "Create payment link"
3. Product: "WellnessAI Lifetime Access"
4. Price: £99 (or your currency)
5. Copy the generated link and paste it in the code above

### 2. Set Up Email Collection

The landing page has email capture forms. To collect emails, you can:

**Option A: Use a backend API**
- Build a simple endpoint to save emails to a database
- Update `handleEmailSubmit` function in `LandingPage.jsx`

**Option B: Use a service (easiest)**
- [EmailJS](https://www.emailjs.com/) - Free tier available
- [Mailchimp](https://mailchimp.com/) - Free up to 500 subscribers
- [ConvertKit](https://convertkit.com/) - Creator-friendly
- [Buttondown](https://buttondown.email/) - Simple newsletter service

### 3. Deploy to Production

**Deploy to Vercel (Recommended - Free):**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

**Deploy to Netlify:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### 4. Add Custom Domain

After deploying, add your custom domain:
- `wellnessai.co.uk` or similar
- Purchase from Namecheap, GoDaddy, or Google Domains
- Point DNS to your hosting provider

## 📊 Project Structure

```
wellnessai-app/
├── src/
│   ├── pages/
│   │   └── LandingPage.jsx    # Main landing page with all sections
│   ├── styles/
│   │   └── LandingPage.css    # Complete styling
│   ├── App.jsx                # Router setup
│   └── main.jsx               # App entry point
├── public/                    # Static assets
├── .github/
│   └── copilot-instructions.md
├── index.html                 # HTML template
├── vite.config.js            # Vite + PWA configuration
└── package.json              # Dependencies
```

## 🎨 Customization

### Change Colors

Edit CSS variables in `src/styles/LandingPage.css`:

```css
:root {
  --primary: #10b981;      /* Main brand color */
  --secondary: #3b82f6;    /* Secondary accent */
  --text: #1f2937;         /* Text color */
}
```

### Add More Features

The landing page has 8 feature cards. To add more, edit the `features-grid` section in `src/pages/LandingPage.jsx`.

### Modify Pricing

Update the pricing cards in the `pricing` section of `LandingPage.jsx` to match your offers.

## 🚀 Marketing Plan

### Day 1 - Launch Day
1. Post on Product Hunt
2. Share on Reddit (r/SideProject, r/fitness, r/selfimprovement)
3. Post on Twitter/X with hashtags
4. Share in Facebook wellness groups
5. Email your network

### Week 1
- Create content (demo videos, screenshots)
- Respond to all comments and questions
- Gather testimonials from early users
- Iterate based on feedback

### Weeks 2-8
- Build the full app with wellness tracking features
- Keep marketing the landing page
- Build email list
- Collect pre-orders

## 💰 Revenue Potential

**Conservative (First 48 hours):**
- 15 pre-orders × £99 = £1,485
- 50 waitlist signups

**Optimistic (First week):**
- 50 pre-orders × £99 = £4,950
- 500+ waitlist signups

## 🛠️ Built With

- **React 19** - UI framework
- **Vite 7** - Build tool
- **React Router 6** - Navigation
- **Vite PWA Plugin** - Progressive Web App features
- **CSS3** - Modern styling with gradients and animations

## 📝 License

Private project - All rights reserved.

## 🤝 Support

Questions? Issues? Want to add more features?

**Current Status:** Landing page complete and ready to launch! ✅

**Next Phase:** Build full wellness tracking app with AI coaching features.

---

Built with ❤️ for helping people achieve their wellness goals.
