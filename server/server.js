import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import csv from 'csv-parser';
import stream from 'stream';
import { OAuth2Client } from 'google-auth-library';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// --- Configuration & Environment Variable Check ---
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'GOOGLE_CLIENT_ID' // <-- Merged Env Var
];

for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        console.error(`FATAL ERROR: Environment variable ${varName} is not set.`);
        process.exit(1);
    }
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Razorpay ----------------------------------------------------------------
// Optional: server boots without these. Routes return 503 if not configured.
const razorpayEnabled = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpay = razorpayEnabled
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;
if (!razorpayEnabled) console.warn('[razorpay] disabled — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable online payments.');

// --- Email (nodemailer) ------------------------------------------------------
// Optional. If SMTP_HOST + SMTP_USER + SMTP_PASS are all present, emails are sent.
const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const mailer = emailEnabled
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    : null;
const sendEmail = async ({ to, subject, html }) => {
    if (!mailer || !to) return;
    try {
        await mailer.sendMail({
            from: process.env.SMTP_FROM || `"Steamy Bites" <${process.env.SMTP_USER}>`,
            to, subject, html,
        });
    } catch (e) { console.warn('[email] send failed:', e.message); }
};
if (!emailEnabled) console.warn('[email] disabled — set SMTP_HOST/SMTP_USER/SMTP_PASS to enable order emails.');

// --- SMS (Twilio) ------------------------------------------------------------
// Optional. If creds are missing we simply log OTPs to the console (dev mode).
const smsEnabled = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
const smsClient = smsEnabled ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
const sendSms = async (to, body) => {
    if (!smsClient) return false;
    try {
        await smsClient.messages.create({ from: process.env.TWILIO_FROM, to, body });
        return true;
    } catch (e) { console.warn('[sms] send failed:', e.message); return false; }
};
if (!smsEnabled) console.warn('[sms] disabled — set TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM to enable SMS OTPs.');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'steamy-bites-menu',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const imageUpload = multer({ storage: imageStorage });
const csvUpload = multer({ storage: multer.memoryStorage() });

const app = express();
// Render (and most PaaS) put the app behind a proxy that appends the real client
// IP to X-Forwarded-For. Trust exactly one hop so req.ip is the true client IP and
// can't be spoofed by a client-supplied XFF header (which would defeat rate limiting).
app.set('trust proxy', 1);
const port = process.env.PORT || 8001;
const mongoURI = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

// --- CORS Configuration ---
const allowedOrigins = [
    'https://www.steamybites.shop',
    'https://new-folder-ynyn.vercel.app',
    'https://new-folder-e329.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5180'  // pinned client dev port (5173 is taken by another project)
];

const corsOptions = {
    origin: (origin, callback) => {
        if (
            !origin || 
            allowedOrigins.includes(origin) || 
            (origin && /^(new-folder-[\w-]+|steamybites-marketing)\.vercel\.app$/.test(new URL(origin).hostname))  // our Vercel projects only
        ) {
            callback(null, true);
        } else {
            console.error("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));

// Razorpay webhook needs the raw body to verify the HMAC signature, so it must
// be mounted BEFORE express.json() globally consumes the body. The handler is
// defined further down; we just register a forwarder here.
app.post('/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => handleRazorpayWebhook(req, res).catch(next)
);

app.use(express.json({ limit: '256kb' }));

// This helps with the Cross-Origin-Opener-Policy warnings from Google OAuth
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// --- Helpers: input sanitization, rate limiting, validation -------------------
// Strip control chars and tags from user-supplied strings to keep admin UI safe.
const sanitize = (val, max = 500) => {
    if (val == null) return '';
    return String(val)
        .replace(/\p{C}/gu, '')
        .replace(/<\/?[a-zA-Z][^>]*>/g, '')
        .trim()
        .slice(0, max);
};

// Simple in-memory token-bucket rate limiter (per key). Sufficient for one node;
// for horizontal scale swap with Redis-backed limiter.
const rateBuckets = new Map();
const rateLimit = ({ key, limit, windowMs }) => {
    const now = Date.now();
    const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + windowMs; }
    bucket.count += 1;
    rateBuckets.set(key, bucket);
    return { allowed: bucket.count <= limit, retryAfterMs: Math.max(0, bucket.resetAt - now) };
};
// With `trust proxy` set, Express resolves req.ip to the real client IP from the
// proxy chain; do NOT hand-parse the client-controllable X-Forwarded-For header.
const clientIp = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

const limiter = ({ limit, windowMs, scope = 'ip' }) => (req, res, next) => {
    const ipKey = clientIp(req);
    const key = `${scope}:${req.baseUrl || ''}${req.path}:${ipKey}`;
    const { allowed, retryAfterMs } = rateLimit({ key, limit, windowMs });
    if (!allowed) {
        res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));
        return res.status(429).json({ message: 'Too many requests. Please slow down.' });
    }
    next();
};

// Periodic cleanup of expired rate buckets to bound memory.
setInterval(() => {
    const now = Date.now();
    for (const [k, b] of rateBuckets) if (now > b.resetAt + 60_000) rateBuckets.delete(k);
}, 5 * 60_000).unref?.();

// Order status state machine. Keys are current state, values are allowed next states.
const ORDER_STATUS_TRANSITIONS = {
    'Pending Payment': ['Received', 'Rejected'],
    'Received':        ['Preparing', 'Rejected'],
    'Preparing':       ['Ready', 'Out for Delivery', 'Rejected'],
    'Ready':           ['Out for Delivery', 'Rejected'],
    'Out for Delivery': ['Delivered', 'Rejected'],
    'Delivered':       [],
    'Rejected':        [],
};
const isValidStatusTransition = (from, to) =>
    from === to || (ORDER_STATUS_TRANSITIONS[from] || []).includes(to);


// --- SSE Admin Notifications Setup ---
const adminSseClients = new Set();

const sendAdminNotification = (notification) => {
  const message = JSON.stringify(notification);
  adminSseClients.forEach(res => {
    try {
      res.write(`data: ${message}\n\n`);
    } catch (e) {
      adminSseClients.delete(res);
    }
  });
};

// --- SSE Customer Order Status Setup ---
const customerSseClients = new Map(); // orderId -> Set of res objects

const notifyCustomerOrderStatus = (orderId, status) => {
  const clients = customerSseClients.get(orderId.toString());
  if (!clients) return;
  const message = JSON.stringify({ status });
  clients.forEach(res => {
    try { res.write(`data: ${message}\n\n`); }
    catch (e) { clients.delete(res); }
  });
};

// --- Database Connection ---
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected successfully');
        // Only seed default admin in environments that explicitly request it.
        // Production must never ship with admin@example.com / password123.
        if (process.env.SEED_ADMIN === 'true') {
            seedAdminUser();
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas ---
const PriceSchema = new mongoose.Schema({
    half: { type: Number },
    full: { type: Number, required: true }
}, { _id: false });

const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: PriceSchema, required: true },
    imageUrl: { type: String, default: '' },
    category: { type: String, required: true, trim: true, default: 'Uncategorized' },
    position: { type: Number, default: 0 }
});

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    position: { type: Number, required: true, default: 0 }
});

const OrderItemSchema = new mongoose.Schema({
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    itemName: { type: String },
    quantity: { type: Number, required: true },
    variant: { type: String, enum: ['half', 'full'], required: true },
    priceAtOrder: { type: Number, required: true },
    instructions: { type: String, default: '' }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    appliedCoupon: {
        code: String,
        discountType: String,
        discountValue: Number
    },
    customerName: { type: String, required: true },
    mobile: { type: String, default: '' },
    address: { type: String, required: true },
    status: { 
        type: String, 
        default: 'Pending Payment', // <-- CHANGED: New default status
        enum: ['Pending Payment', 'Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Rejected'] 
    },
    isAcknowledged: { type: Boolean, default: false },
    // --- NEW FIELDS FOR PAYMENT ---
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'UPI', 'RAZORPAY']
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Paid', 'Failed']
    },
    utr: { type: String, trim: true }, // manual UPI reference (legacy flow)
    // When a PAID order is cancelled/rejected we must NOT relabel it "Failed"
    // (that hides a real captured payment). We keep paymentStatus 'Paid' and flag
    // that a refund is owed, so it stays visible to admin for reconciliation.
    refundStatus: { type: String, enum: ['None', 'Refund Due', 'Refunded', 'Refund Failed'], default: 'None' },
    refundId: { type: String },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    locationCoords: { type: String, required: false },
    locationLink: { type: String, required: false },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // <-- Merged: Password is no longer required
    role: { type: String, default: 'customer', enum: ['customer', 'admin'] }
}, { collection: 'users_v2' });


const ComplaintSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Resolved'] }
}, { timestamps: true });

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, required: true, enum: ['percentage', 'fixed'] },
    discountValue: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true }
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
const Category = mongoose.model('Category', CategorySchema);
const Order = mongoose.model('Order', OrderSchema);
const User = mongoose.model('User', UserSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);
const Coupon = mongoose.model('Coupon', CouponSchema);
const OtpSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    mobile: { type: String, required: true },
    code: { type: String, required: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });
// TTL index: Mongo auto-purges expired OTP docs, no manual cleanup needed.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', OtpSchema);

// Abandoned-order sweep: online orders created but never paid (customer closed the
// Razorpay sheet, lost signal, etc.) would otherwise pile up forever showing a fake
// "Live" tracker. Every 10 min, expire ones older than 30 min. Guarded on
// paymentStatus:'Pending' so a real captured payment is NEVER touched.
setInterval(async () => {
    try {
        const cutoff = new Date(Date.now() - 30 * 60 * 1000);
        await Order.updateMany(
            { status: 'Pending Payment', paymentStatus: 'Pending', createdAt: { $lt: cutoff } },
            { $set: { status: 'Rejected', paymentStatus: 'Failed' } }
        );
    } catch (e) { console.warn('[sweep] abandoned-order cleanup failed:', e.message); }
}, 10 * 60 * 1000).unref?.();

// --- Middleware ---
const authMiddleware = (req, res, next) => {
    // Header is preferred; query ?token= is the fallback so EventSource/SSE (which
    // can't set custom headers) can authenticate the admin notifications stream.
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Admin access required' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying admin role' });
    }
};

// Health Check for AWS
app.get('/', (req, res) => {
  res.status(200).send('Server is healthy and running.');
});

// --- API Routes ---

// Public Routes
app.get('/api/menu', async (req, res) => {
    try {
        const categories = await Category.find().sort({ position: 'asc' });
        const menuItems = await MenuItem.find().sort({ position: 'asc' });

        const categorizedMenu = categories.map(category => ({
            name: category.name,
            items: menuItems.filter(item => item.category === category.name)
        }));
        
        const uncategorizedItems = menuItems.filter(item => !categories.some(c => c.name === item.category));
        if (uncategorizedItems.length > 0) {
            categorizedMenu.push({ name: 'Uncategorized', items: uncategorizedItems });
        }

        res.json(categorizedMenu);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items' });
    }
});


app.get('/api/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
});

app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code.' });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
        }

        const finalPrice = Math.max(0, cartTotal - discountAmount);

        res.json({
            message: 'Coupon applied successfully!',
            discountAmount,
            finalPrice,
            coupon
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during coupon validation.' });
    }
});

// --- Auth Routes ---
// Customer auth is Google-only; admin auth uses email/password below.
app.post('/api/auth/google', limiter({ limit: 30, windowMs: 60_000 }), async (req, res) => {
    const { token } = req.body;
    try {
        // Accept the website's web client ID AND the iOS app's client ID, so the
        // same route serves both surfaces. (Native iOS ID tokens are audienced
        // to the iOS OAuth client.)
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID].filter(Boolean),
        });
        const payload = ticket.getPayload();
        const { name, email } = payload;
        // Only trust Google-verified emails (Google recommends this explicitly).
        if (!payload.email_verified) {
            return res.status(401).json({ message: 'Google Sign-In failed.' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new one without a password
            user = new User({ name, email, role: 'customer' });
            await user.save();
        }

        // Create your application's JWT token
        const appToken = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1d' });
        
        res.json({ token: appToken, userName: user.name, userRole: user.role });

    } catch (error) {
        console.error("Google auth error:", error);
        res.status(401).json({ message: 'Google Sign-In failed.' });
    }
});

app.post('/api/auth/admin/login', limiter({ limit: 10, windowMs: 5 * 60_000 }), async (req, res) => {
    try {
        const { email, password } = req.body;
        // Identical generic 401 on every failure path (no such admin / no password set /
        // wrong password) so admin emails cannot be enumerated by response differences.
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        if (!user.password) {
             return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1d' });
        res.json({ token, userName: user.name, userRole: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error during admin login' });
    }
});

// --- OTP endpoints for mobile verification (supports guest users) ---
// Public endpoint: allows sending OTP to a mobile number without authentication.
// Layered limits: per-IP burst (10/min), per-mobile cooldown (60s) inside handler.
app.post('/api/send-otp', limiter({ limit: 10, windowMs: 60_000 }), async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile || typeof mobile !== 'string' || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ message: 'Invalid mobile number. Expected 10 digits.' });
        }

        // rate limit: do not allow sending another OTP within 60 seconds for same mobile
        const recent = await Otp.findOne({ mobile }).sort({ createdAt: -1 });
        if (recent && (Date.now() - new Date(recent.createdAt).getTime()) < 60 * 1000) {
            return res.status(429).json({ message: 'OTP recently sent. Please wait before retrying.' });
        }

        // crypto.randomInt is uniform and unpredictable; Math.random is neither.
        const code = crypto.randomInt(100000, 1_000_000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const otpDoc = new Otp({ user: req.user?.userId || undefined, mobile, code, expiresAt });
        await otpDoc.save();

        // Try SMS via Twilio first; fall back to console log only when SMS is
        // unconfigured AND we're not in production (so prod never silently leaks
        // OTPs to logs).
        const smsTo = mobile.startsWith('+') ? mobile : `+91${mobile}`;
        const sent = await sendSms(smsTo, `Your Steamy Bites OTP is ${code}. Valid for 5 minutes.`);
        if (!sent && process.env.NODE_ENV !== 'production') {
            console.log(`OTP for mobile ${mobile}: ${code} (expires ${expiresAt.toISOString()})`);
        }

        res.json({ message: 'OTP sent' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

app.post('/api/verify-otp', limiter({ limit: 20, windowMs: 60_000 }), async (req, res) => {
    try {
        const { mobile, code } = req.body;
        // Both MUST be strings before reaching Mongo — otherwise an object like
        // {"$ne":null} would be interpreted as a query operator (NoSQL injection)
        // and match an arbitrary unused OTP, bypassing verification entirely.
        if (typeof mobile !== 'string' || typeof code !== 'string' ||
            !/^[0-9]{10}$/.test(mobile) || !/^[0-9]{4,8}$/.test(code)) {
            return res.status(400).json({ message: 'Valid mobile and code are required.' });
        }

        // If user is authenticated, prefer matching by user + mobile; otherwise match by mobile only
        let otpDoc = null;
        if (req.user && req.user.userId) {
            otpDoc = await Otp.findOne({ user: req.user.userId, mobile, code, used: false });
        }
        if (!otpDoc) {
            otpDoc = await Otp.findOne({ mobile, code, used: false });
        }

        if (!otpDoc) return res.status(404).json({ message: 'OTP not found or already used.' });
        if (new Date() > otpDoc.expiresAt) return res.status(400).json({ message: 'OTP expired.' });

        otpDoc.used = true;
        await otpDoc.save();

        res.json({ message: 'OTP verified' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
});

// --- Phone login: verify OTP AND issue a customer JWT (mobile-app sign-in) ---
// Additive to /api/verify-otp (which only marks the OTP used). Find-or-create a
// customer keyed by mobile so app users land in the same users_v2 collection as
// the website. Returns the same shape as the Google/admin auth routes.
app.post('/api/auth/phone', limiter({ limit: 20, windowMs: 60_000 }), async (req, res) => {
    try {
        const { mobile, code } = req.body;
        if (!mobile || typeof mobile !== 'string' || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ message: 'Invalid mobile number. Expected 10 digits.' });
        }
        // code MUST be a string — a {"$ne":null} object would otherwise be treated as
        // a Mongo query operator (NoSQL injection) and match any pending OTP → account takeover.
        if (typeof code !== 'string' || !/^[0-9]{4,8}$/.test(code)) {
            return res.status(400).json({ message: 'Valid code is required.' });
        }

        // Dev/testing convenience: when ALLOW_DEV_OTP=true, a master code (default
        // 424242, override with DEV_OTP) signs in without SMS. Hard-gated off in prod.
        const devCode = process.env.DEV_OTP || '424242';
        const devOk = process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_OTP === 'true' && code === devCode;

        if (!devOk) {
            const otpDoc = await Otp.findOne({ mobile, code, used: false });
            if (!otpDoc) return res.status(404).json({ message: 'OTP not found or already used.' });
            if (new Date() > otpDoc.expiresAt) return res.status(400).json({ message: 'OTP expired.' });
            otpDoc.used = true;
            await otpDoc.save();
        }

        // Phone-only users get a synthesized, stable email so they slot into the
        // existing (email-unique) User model without schema changes.
        const syntheticEmail = `91${mobile}@phone.steamybites.app`;
        let user = await User.findOne({ email: syntheticEmail });
        if (!user) {
            user = new User({ name: `Guest ${mobile.slice(-4)}`, email: syntheticEmail, role: 'customer' });
            await user.save();
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });
        res.json({ token, userName: user.name, userRole: user.role });
    } catch (error) {
        console.error('Phone login error:', error);
        res.status(500).json({ message: 'Phone login failed' });
    }
});


// Customer Routes (Protected)
app.post('/api/orders', authMiddleware, limiter({ limit: 30, windowMs: 60_000 }), async (req, res) => {
    try {
        const body = req.body || {};
        const items = Array.isArray(body.items) ? body.items : [];
        if (items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item.' });
        }

        // Prices come from the DATABASE, never the client. Look up every referenced
        // menu item and derive priceAtOrder from its stored price for the chosen
        // variant. A forged/absent menuItemId or a tampered priceAtOrder is therefore
        // impossible to honor — this is what actually stops "pay ₹1 for a ₹250 dish".
        const reqIds = items
            .map((it) => it.menuItemId)
            .filter((id) => mongoose.Types.ObjectId.isValid(id));
        const menuDocs = reqIds.length ? await MenuItem.find({ _id: { $in: reqIds } }) : [];
        const menuById = new Map(menuDocs.map((m) => [m._id.toString(), m]));

        const cleanItems = items.map((it) => {
            const variant = it.variant === 'half' ? 'half' : 'full';
            const qty = parseInt(it.quantity, 10);
            if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
                throw Object.assign(new Error('Invalid item quantity'), { status: 400 });
            }
            const menuItem = it.menuItemId && menuById.get(String(it.menuItemId));
            if (!menuItem) {
                throw Object.assign(new Error('One or more items are no longer available. Please refresh the menu and try again.'), { status: 400 });
            }
            const dbPrice = variant === 'half' ? menuItem.price?.half : menuItem.price?.full;
            if (!Number.isFinite(dbPrice) || dbPrice < 0) {
                throw Object.assign(new Error(`"${menuItem.name}" is not available in the selected size.`), { status: 400 });
            }
            return {
                menuItemId: menuItem._id,
                itemName: menuItem.name,
                quantity: qty,
                variant,
                priceAtOrder: dbPrice,
                instructions: sanitize(it.instructions, 200),
            };
        });

        const subtotal = cleanItems.reduce((s, it) => s + it.priceAtOrder * it.quantity, 0);
        const delivery = subtotal >= 250 ? 0 : 40;

        // Validate coupon server-side if one was applied.
        let appliedCoupon, discountAmount = 0;
        if (body.appliedCoupon?.code) {
            const coupon = await Coupon.findOne({
                code: String(body.appliedCoupon.code).toUpperCase(),
                isActive: true,
            });
            if (!coupon) return res.status(400).json({ message: 'Coupon is invalid or expired.' });
            discountAmount = coupon.discountType === 'percentage'
                ? (subtotal * coupon.discountValue) / 100
                : coupon.discountValue;
            // Discount is clamped to [0, subtotal] — a negative discountValue (admin
            // typo) must never INCREASE the total, and it can't exceed the subtotal.
            discountAmount = Math.max(0, Math.min(discountAmount, subtotal));
            appliedCoupon = {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            };
        }

        const finalPrice = Math.max(0, Math.round(subtotal + delivery - discountAmount));
        // A fully-discounted (₹0) order has nothing to collect, and Razorpay rejects
        // amounts below ₹1 — so confirm it immediately instead of leaving it unpayable.
        const isFree = finalPrice < 1;
        // COD temporarily disabled — re-add 'COD' to re-enable. A stray/unknown
        // method falls back to RAZORPAY so no order can be created that skips payment.
        const allowedMethods = ['UPI', 'RAZORPAY'];
        const paymentMethod = allowedMethods.includes(body.paymentMethod) ? body.paymentMethod : 'RAZORPAY';

        const orderData = {
            user: req.user.userId,
            items: cleanItems,
            totalPrice: subtotal,
            finalPrice,
            appliedCoupon,
            customerName: sanitize(body.customerName, 80) || 'Customer',
            mobile: /^[0-9]{10}$/.test(body.mobile || '') ? body.mobile : '',
            address: sanitize(body.address, 400),
            paymentMethod,
            paymentStatus: isFree ? 'Paid' : 'Pending',
            // COD or a ₹0 order: kitchen starts immediately. Otherwise wait for payment.
            status: (paymentMethod === 'COD' || isFree) ? 'Received' : 'Pending Payment',
            locationCoords: sanitize(body.locationCoords, 60),
            locationLink: sanitize(body.locationLink, 300),
        };

        if (!orderData.address) {
            return res.status(400).json({ message: 'Delivery address is required.' });
        }

        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);

        // Notify admin only for orders that are immediately actionable (COD, or
        // already paid). Online orders stay silent until Razorpay confirms payment,
        // which fires 'order_confirmed' from markRazorpayPaymentSuccessful.
        if (savedOrder.status !== 'Pending Payment') {
            try { sendAdminNotification({ type: 'order_created', order: savedOrder }); } catch (e) { console.warn('notify admin failed', e); }
        }
        // Email customer (only for COD here; Razorpay/UPI emails fire after payment confirmed)
        if (savedOrder.paymentMethod === 'COD') {
            onOrderPlacedNotify(savedOrder).catch(e => console.warn('email failed', e));
        }
    } catch (error) {
        console.error('Order placement error:', error);
        if (error.status === 400) return res.status(400).json({ message: error.message });
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Order validation failed', error: error.message });
        }
        res.status(500).json({ message: 'Error placing order' });
    }
});

// Customer-side order cancellation. Allowed only while status is Pending Payment
// or Received (kitchen hasn't started cooking).
app.patch('/api/orders/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.userId });
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (!['Pending Payment', 'Received'].includes(order.status)) {
            return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}.` });
        }
        // Never relabel a real captured payment as "Failed" (that hides money already
        // taken). Flag a refund and keep paymentStatus 'Paid' so it stays visible to admin.
        order.status = 'Rejected';
        if (order.paymentStatus === 'Paid' && order.razorpayPaymentId) {
            // Auto-refund the captured payment. Keep paymentStatus 'Paid' (money was
            // real); refundStatus records the outcome so admin can see any failures.
            const r = await refundPayment(order.razorpayPaymentId, order.finalPrice, order._id);
            order.refundStatus = r.ok ? 'Refunded' : 'Refund Failed';
            if (r.refundId) order.refundId = r.refundId;
        } else if (order.paymentStatus === 'Paid') {
            order.refundStatus = 'Refund Due'; // paid but no gateway id — refund manually
        } else {
            order.paymentStatus = 'Failed';
        }
        await order.save();
        res.json(order);
        try { sendAdminNotification({ type: 'order_cancelled_by_customer', order }); } catch (e) { console.warn('notify admin failed', e); }
        try { notifyCustomerOrderStatus(order._id, order.status); } catch (e) { console.warn('notify customer failed', e); }
    } catch (error) {
        console.error('Order cancellation error:', error);
        res.status(500).json({ message: 'Error cancelling order.' });
    }
});

// --- NEW ROUTE: To confirm UPI payment with UTR ---
app.patch('/api/orders/:id/confirm-payment', authMiddleware, async (req, res) => {
    try {
        // DISABLED: this flipped an order to Paid/Received from a client-supplied UTR
        // string with zero verification — a free-food exploit. Online payment now goes
        // through Razorpay (/payments/verify) exclusively. Do NOT re-enable without
        // real UPI verification or an admin reconciliation step.
        return res.status(403).json({ message: 'Manual UPI confirmation is disabled. Please pay online.' });
        const { utr } = req.body;
        if (!utr) {
            return res.status(400).json({ message: 'UTR is required.' });
        }

        // Find the order, make sure it belongs to the user and is a UPI payment
        const order = await Order.findOneAndUpdate(
            { 
                _id: req.params.id, 
                user: req.user.userId, 
                paymentMethod: 'UPI',
                status: 'Pending Payment' // Only update if pending
            },
            {
                $set: {
                    utr: utr,
                    status: 'Received', // Payment is now confirmed, ready for kitchen
                    paymentStatus: 'Paid'
                }
            },
            { new: true }
        ).populate('items.menuItemId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found, already confirmed, or not a UPI order.' });
        }

        res.json(order);

        // Notify admin UIs that an order payment was confirmed
        try { sendAdminNotification({ type: 'order_confirmed', order }); } catch(e) { console.warn('notify admin failed', e); }

    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(500).json({ message: 'Error confirming payment', error: error.message });
    }
});
// --- END OF NEW ROUTE ---

// --- Razorpay payment flow ---------------------------------------------------
// 1) Customer creates an order in our DB with paymentMethod='RAZORPAY' (status
//    = 'Pending Payment'). 2) Client calls create-order to get a Razorpay order
//    id. 3) Razorpay checkout opens; on success client posts to /verify which
//    HMACs the response and marks the order Paid + Received. 4) Webhook acts as
//    a safety net if the client never makes it back to /verify.

app.post('/api/payments/create-order', authMiddleware, limiter({ limit: 30, windowMs: 60_000 }), async (req, res) => {
    if (!razorpay) return res.status(503).json({ message: 'Online payments are not configured.' });
    try {
        const { orderId } = req.body || {};
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Valid orderId is required.' });
        }
        const order = await Order.findOne({ _id: orderId, user: req.user.userId });
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.paymentMethod !== 'RAZORPAY') return res.status(400).json({ message: 'Order is not a Razorpay order.' });
        if (order.paymentStatus === 'Paid') return res.status(400).json({ message: 'Order is already paid.' });

        // Razorpay expects the amount in the smallest currency unit (paise).
        const amount = Math.round(order.finalPrice * 100);
        const rOrder = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: order._id.toString(),
            notes: { appOrderId: order._id.toString(), userId: req.user.userId.toString() },
        });

        order.razorpayOrderId = rOrder.id;
        await order.save();

        res.json({
            keyId: process.env.RAZORPAY_KEY_ID,
            razorpayOrderId: rOrder.id,
            amount: rOrder.amount,
            currency: rOrder.currency,
            order: { _id: order._id, finalPrice: order.finalPrice, customerName: order.customerName, mobile: order.mobile },
        });
    } catch (error) {
        console.error('[razorpay] create-order failed:', error);
        res.status(500).json({ message: 'Failed to create payment order.' });
    }
});

const markRazorpayPaymentSuccessful = async (order, paymentId) => {
    // Atomic + idempotent: the guard on paymentStatus:'Pending' means a concurrent
    // /verify and webhook can't BOTH mark Paid and double-notify (only one update
    // matches), and a cancelled ('Failed') order isn't resurrected to 'Received'.
    const updated = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: 'Pending' },
        { $set: { paymentStatus: 'Paid', razorpayPaymentId: paymentId, status: 'Received' } },
        { new: true }
    ).populate('items.menuItemId');
    if (!updated) {
        // Already Paid (idempotent no-op) OR no longer Pending (e.g. cancelled before
        // capture) — surface the latter so a real captured payment gets reconciled/refunded.
        const current = await Order.findById(order._id);
        if (current && current.paymentStatus !== 'Paid') {
            console.warn(`[razorpay] captured payment ${paymentId} for order ${order._id} now in ${current.status}/${current.paymentStatus} — manual refund reconciliation may be needed.`);
        }
        return current || order;
    }
    try { sendAdminNotification({ type: 'order_confirmed', order: updated }); } catch (e) { console.warn('notify admin failed', e); }
    try { notifyCustomerOrderStatus(updated._id, updated.status); } catch (e) { console.warn('notify customer failed', e); }
    try { await onOrderPlacedNotify(updated); } catch (e) { console.warn('email failed', e); }
    return updated;
};

// Issue a real Razorpay refund for a captured payment. Pure gateway call — the
// caller persists refundStatus/refundId on the order. Returns {ok, refundId?, reason?}.
const refundPayment = async (paymentId, amountRupees, orderId) => {
    if (!razorpay || !paymentId) return { ok: false, reason: 'no-gateway-or-payment-id' };
    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: Math.round(amountRupees * 100), // full refund of what was charged, in paise
            notes: { appOrderId: String(orderId), reason: 'order cancelled/rejected' },
        });
        return { ok: true, refundId: refund.id };
    } catch (e) {
        console.error('[razorpay] refund failed for order', String(orderId), '-', e?.error?.description || e.message);
        return { ok: false, reason: e?.error?.description || e.message };
    }
};

app.post('/api/payments/verify', authMiddleware, limiter({ limit: 30, windowMs: 60_000 }), async (req, res) => {
    if (!razorpay) return res.status(503).json({ message: 'Online payments are not configured.' });
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body || {};
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ message: 'Missing payment fields.' });
        }

        // Verify the signature exactly as Razorpay docs prescribe.
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
        if (!ok) return res.status(400).json({ message: 'Invalid payment signature.' });

        const order = await Order.findOne({ _id: orderId, user: req.user.userId, razorpayOrderId: razorpay_order_id });
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        await markRazorpayPaymentSuccessful(order, razorpay_payment_id);
        res.json({ message: 'Payment verified.', order });
    } catch (error) {
        console.error('[razorpay] verify failed:', error);
        res.status(500).json({ message: 'Failed to verify payment.' });
    }
});

// Razorpay → server webhook. Mounted at the top of the file with raw body so
// we can recompute the HMAC over the exact bytes Razorpay signed.
async function handleRazorpayWebhook(req, res) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!razorpay || !secret) return res.status(503).json({ message: 'Webhook not configured.' });
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.body; // Buffer (express.raw)
        const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        if (!signature || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)))) {
            return res.status(400).json({ message: 'Invalid webhook signature.' });
        }
        const event = JSON.parse(rawBody.toString('utf8'));
        // Do the DB work BEFORE acknowledging: if it throws, the catch returns 500 and
        // Razorpay retries. (The webhook is the safety net when the client never reaches
        // /verify — ACKing first would silently drop a captured payment on any hiccup.)
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            const payment = event.payload?.payment?.entity;
            const rOrderId = payment?.order_id;
            if (rOrderId) {
                const order = await Order.findOne({ razorpayOrderId: rOrderId });
                if (order) await markRazorpayPaymentSuccessful(order, payment.id);
            }
        } else if (event.event === 'payment.failed') {
            const payment = event.payload?.payment?.entity;
            const rOrderId = payment?.order_id;
            if (rOrderId) {
                const order = await Order.findOne({ razorpayOrderId: rOrderId, paymentStatus: 'Pending' });
                if (order) {
                    order.paymentStatus = 'Failed';
                    await order.save();
                    try { sendAdminNotification({ type: 'order_payment_failed', order }); } catch (e) { console.warn('notify admin failed', e); }
                }
            }
        }
        res.json({ ok: true });
    } catch (error) {
        console.error('[razorpay] webhook error:', error);
        // Don't echo error details to caller; they'd already get a 200 if we got past signature check.
        if (!res.headersSent) res.status(500).json({ message: 'Webhook processing failed.' });
    }
}

// --- Email + SMS notification helpers ---------------------------------------
const formatItems = (items = []) =>
    items.map(i => `<li>${i.quantity}× ${i.itemName || ''} (${i.variant}) — ₹${i.priceAtOrder * i.quantity}</li>`).join('');

const onOrderPlacedNotify = async (order) => {
    if (!order || !emailEnabled) return;
    const populated = await Order.findById(order._id).populate('user', 'email name');
    const email = populated?.user?.email;
    if (!email) return;
    await sendEmail({
        to: email,
        subject: `Order #${order._id.toString().slice(-6).toUpperCase()} confirmed`,
        html: `
            <h2>Thanks for your order, ${populated.user.name || ''}!</h2>
            <p>We've received your order. Status: <b>${order.status}</b>.</p>
            <ul>${formatItems(order.items)}</ul>
            <p><b>Total: ₹${order.finalPrice}</b></p>
            <p>Delivery to: ${order.address}</p>
        `,
    });
};

const onOrderStatusNotify = async (order) => {
    if (!order || !emailEnabled) return;
    if (!['Out for Delivery', 'Delivered', 'Rejected'].includes(order.status)) return;
    const populated = await Order.findById(order._id).populate('user', 'email name');
    const email = populated?.user?.email;
    if (!email) return;
    const subjects = {
        'Out for Delivery': 'Your order is on the way',
        'Delivered': 'Your order was delivered',
        'Rejected': 'Your order was cancelled',
    };
    await sendEmail({
        to: email,
        subject: `${subjects[order.status]} — #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `<p>Hi ${populated.user.name || ''}, your order status is now <b>${order.status}</b>.</p>`,
    });
};

app.get('/api/my-orders', authMiddleware, async (req, res) => {
    const orders = await Order.find({ user: req.user.userId }).populate('items.menuItemId').sort({ createdAt: -1 });
    res.json(orders);
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.userId });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// Customer SSE — subscribe to real-time status for a specific order
// EventSource can't set headers, so we accept token via query param for this route only
app.get('/api/orders/:id/status-stream', async (req, res) => {
    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    let userId;
    try { userId = jwt.verify(token, jwtSecret).userId; }
    catch { return res.status(401).json({ message: 'Invalid token' }); }

    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`:connected\n\ndata: ${JSON.stringify({ status: order.status })}\n\n`);

    if (!customerSseClients.has(orderId)) customerSseClients.set(orderId, new Set());
    customerSseClients.get(orderId).add(res);

    req.on('close', () => {
        customerSseClients.get(orderId)?.delete(res);
        res.end();
    });
});
app.post('/api/complaints', authMiddleware, limiter({ limit: 10, windowMs: 60_000 }), async (req, res) => {
    try {
        const message = sanitize(req.body?.message, 1000);
        if (!message) return res.status(400).json({ message: 'Complaint message is required.' });
        const orderId = req.body?.orderId;
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Valid orderId is required.' });
        }
        // Customer must own the order they're complaining about.
        const order = await Order.findOne({ _id: orderId, user: req.user.userId });
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        const complaint = new Complaint({ user: req.user.userId, orderId, message });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ message: 'Failed to create complaint.' });
    }
});
app.get('/api/my-complaints', authMiddleware, async (req, res) => {
    const complaints = await Complaint.find({ user: req.user.userId }).populate('orderId').sort({ createdAt: -1 });
    res.json(complaints);
});


// --- Admin Router ---
const adminRouter = express.Router();
app.use('/api/admin', authMiddleware, adminMiddleware, adminRouter);

// SSE Notifications endpoint for admins
adminRouter.get('/notifications', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    adminSseClients.add(res);

    res.write(':connected\n\n');

    req.on('close', () => {
        adminSseClients.delete(res);
        res.end();
    });
});

adminRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Admin user with this email already exists' });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword, role: 'admin' });
        await newUser.save();
        res.status(201).json({ message: 'Admin user registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering admin user' });
    }
});

adminRouter.get('/orders', async (req, res) => {
    // Only surface actionable orders: online orders once Razorpay confirms payment
    // (paymentStatus 'Paid'), and COD orders immediately (COD currently disabled
    // client-side). Never-paid / abandoned online orders stay hidden from admin
    // until payment succeeds.
    const orders = await Order.find({ $or: [{ paymentStatus: 'Paid' }, { paymentMethod: 'COD' }] })
        .populate('items.menuItemId').populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
});

adminRouter.patch('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending Payment', 'Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status update.' });
        }

        const existing = await Order.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Order not found' });

        // Reject illegal transitions (e.g. Delivered → Preparing, or skipping Out for Delivery).
        if (!isValidStatusTransition(existing.status, status)) {
            return res.status(400).json({
                message: `Cannot transition from "${existing.status}" to "${status}".`,
            });
        }

        // An unpaid online order must never be pushed into the kitchen queue.
        if (existing.status === 'Pending Payment' && status === 'Received'
            && existing.paymentStatus !== 'Paid' && existing.paymentMethod !== 'COD') {
            return res.status(400).json({ message: 'Cannot mark an unpaid order as Received.' });
        }

        const updatePayload = { status };

        // Payment status follows real-world events:
        //  - COD orders become Paid only when actually Delivered.
        //  - Rejecting an UNPAID order marks payment Failed; rejecting a PAID order
        //    must NOT hide the captured payment — flag a refund instead.
        if (status === 'Delivered') {
            updatePayload.paymentStatus = 'Paid';
        } else if (status === 'Rejected') {
            if (existing.paymentStatus === 'Paid' && existing.razorpayPaymentId) {
                // Auto-refund the captured payment; keep paymentStatus 'Paid' (money was real).
                const r = await refundPayment(existing.razorpayPaymentId, existing.finalPrice, existing._id);
                updatePayload.refundStatus = r.ok ? 'Refunded' : 'Refund Failed';
                if (r.refundId) updatePayload.refundId = r.refundId;
            } else if (existing.paymentStatus === 'Paid') {
                updatePayload.refundStatus = 'Refund Due';
            } else {
                updatePayload.paymentStatus = 'Failed';
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true }
        ).populate('items.menuItemId').populate('user', 'name email');

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);

        try { sendAdminNotification({ type: 'order_status_updated', order: updatedOrder }); } catch(e) { console.warn('notify admin failed', e); }
        try { notifyCustomerOrderStatus(req.params.id, updatedOrder.status); } catch(e) { console.warn('notify customer failed', e); }
        onOrderStatusNotify(updatedOrder).catch(e => console.warn('email failed', e));
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

adminRouter.patch('/orders/:id/acknowledge', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { isAcknowledged: true }, 
            { new: true }
        ).populate('items.menuItemId').populate('user', 'name email');
        
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error acknowledging order' });
    }
});

const ensureCategoryExists = async (categoryName) => {
    if (!categoryName) return;
    const existingCategory = await Category.findOne({ name: categoryName });
    if (!existingCategory) {
        const maxPos = await Category.findOne().sort({ position: -1 });
        const newPosition = maxPos ? maxPos.position + 1 : 0;
        const newCategory = new Category({ name: categoryName, position: newPosition });
        await newCategory.save();
    }
};

adminRouter.post('/menu', imageUpload.single('image'), async (req, res) => {
    try {
        const name = sanitize(req.body.name, 120);
        const description = sanitize(req.body.description, 500);
        const category = sanitize(req.body.category, 60) || 'Uncategorized';
        const priceFull = parseFloat(req.body.priceFull);
        const priceHalf = parseFloat(req.body.priceHalf);
        if (!name || !description) return res.status(400).json({ message: 'Name and description required.' });
        if (!Number.isFinite(priceFull) || priceFull < 0 || priceFull > 100000) {
            return res.status(400).json({ message: 'Full price must be between 0 and 100000.' });
        }
        if (Number.isFinite(priceHalf) && (priceHalf < 0 || priceHalf > priceFull)) {
            return res.status(400).json({ message: 'Half price must be between 0 and the full price.' });
        }

        await ensureCategoryExists(category);
        const lastItem = await MenuItem.findOne({ category }).sort({ position: -1 });
        const newPosition = lastItem ? lastItem.position + 1 : 0;

        const newMenuItem = new MenuItem({
            name,
            description,
            price: {
                half: Number.isFinite(priceHalf) ? priceHalf : undefined,
                full: priceFull,
            },
            imageUrl: req.file ? req.file.path : '',
            category,
            position: newPosition,
        });
        await newMenuItem.save();
        res.status(201).json(newMenuItem);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'A menu item with this name already exists.' });
        res.status(400).json({ message: 'Error creating menu item', error: error.message });
    }
});

adminRouter.patch('/menu/reorder', async (req, res) => {
    try {
        const { category, orderedIds } = req.body;
        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, category: category },
                update: { $set: { position: index } }
            }
        }));
        await MenuItem.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Menu order updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reorder menu items.' });
    }
});

adminRouter.patch('/categories/reorder', async (req, res) => {
    try {
        const { orderedCategoryNames } = req.body;
        const bulkOps = orderedCategoryNames.map((name, index) => ({
            updateOne: {
                filter: { name: name },
                update: { $set: { position: index } }
            }
        }));
        await Category.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Category order updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reorder categories.' });
    }
});

// Create a new category (admin only)
adminRouter.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Category name required' });
        const existing = await Category.findOne({ name: name.trim() });
        if (existing) return res.status(400).json({ message: 'Category already exists' });
        const maxPos = await Category.findOne().sort({ position: -1 });
        const newPosition = maxPos ? maxPos.position + 1 : 0;
        const newCategory = new Category({ name: name.trim(), position: newPosition });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Failed to create category' });
    }
});

adminRouter.patch('/menu/:id', imageUpload.single('image'), async (req, res) => {
    try {
        const name = sanitize(req.body.name, 120);
        const description = sanitize(req.body.description, 500);
        const category = sanitize(req.body.category, 60) || 'Uncategorized';
        const priceFull = parseFloat(req.body.priceFull);
        const priceHalf = parseFloat(req.body.priceHalf);
        if (!name || !description) return res.status(400).json({ message: 'Name and description required.' });
        if (!Number.isFinite(priceFull) || priceFull < 0 || priceFull > 100000) {
            return res.status(400).json({ message: 'Full price must be between 0 and 100000.' });
        }
        if (Number.isFinite(priceHalf) && (priceHalf < 0 || priceHalf > priceFull)) {
            return res.status(400).json({ message: 'Half price must be between 0 and the full price.' });
        }

        await ensureCategoryExists(category);
        const updateData = {
            name,
            description,
            category,
            price: {
                half: Number.isFinite(priceHalf) ? priceHalf : undefined,
                full: priceFull,
            },
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        } else if (typeof req.body.imageUrl === 'string') {
            updateData.imageUrl = req.body.imageUrl;
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json(updatedItem);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'A menu item with this name already exists.' });
        res.status(400).json({ message: 'Error updating menu item', error: error.message });
    }
});

adminRouter.delete('/menu/:id', async (req, res) => {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted' });
});

adminRouter.get('/complaints', async (req, res) => {
    const complaints = await Complaint.find().populate('user', 'name email').populate('orderId', 'createdAt').sort({ createdAt: -1 });
    res.json(complaints);
});

adminRouter.patch('/complaints/:id', async (req, res) => {
    try {
        const validStatuses = ['Pending', 'In Progress', 'Resolved'];
        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid complaint status.' });
        }
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('user', 'name email').populate('orderId', 'createdAt');
        if (!updatedComplaint) return res.status(404).json({ message: 'Complaint not found.' });
        res.json(updatedComplaint);
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ message: 'Error updating complaint.' });
    }
});

adminRouter.post('/menu/upload-csv', csvUpload.single('csvFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No CSV file uploaded.');
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            let updatedCount = 0;
            let createdCount = 0;

            for (const row of results) {
                try {
                    const name = row['Item'];
                    const category = row['Category'] || 'Uncategorized';
                    await ensureCategoryExists(category);
                    const priceFullText = row['Full'] || row['Item Price'];
                    const priceHalfText = row['Half'];

                    if (!name || !priceFullText) continue;
                    
                    const priceFull = parseFloat(priceFullText);
                    if (isNaN(priceFull)) continue;
                    
                    const priceHalf = parseFloat(priceHalfText);
                    
                    const existingItem = await MenuItem.findOne({ name: name });
                    
                    if (existingItem) {
                        const updatePayload = {
                            'price.full': priceFull,
                            category: category,
                        };
                        if (!isNaN(priceHalf)) {
                            updatePayload['price.half'] = priceHalf;
                        } else {
                            await MenuItem.updateOne({ _id: existingItem._id }, { $unset: { 'price.half': "" } });
                        }
                        await MenuItem.updateOne({ _id: existingItem._id }, { $set: updatePayload });
                        updatedCount++;
                    } else {
                        const lastItem = await MenuItem.findOne({ category }).sort({ position: -1 });
                        const newPosition = lastItem ? lastItem.position + 1 : 0;
                        
                        const newItemData = {
                            name,
                            description: 'Description to be added.',
                            imageUrl: '',
                            category,
                            position: newPosition,
                            price: {
                                full: priceFull,
                            }
                        };
                        if (!isNaN(priceHalf)) {
                            newItemData.price.half = priceHalf;
                        }
                        const newItem = new MenuItem(newItemData);
                        await newItem.save();
                        createdCount++;
                    }
                } catch (e) {
                    console.error(`Could not process row for item: ${row['Item'] || 'UNKNOWN'}`, e);
                }
            }
            res.status(200).json({ 
                message: 'CSV processed successfully.',
                updated: updatedCount,
                created: createdCount,
            });
        });
});

adminRouter.get('/coupons', async (req, res) => {
    const coupons = await Coupon.find();
    res.json(coupons);
});

adminRouter.post('/coupons', async (req, res) => {
    try {
        const newCoupon = new Coupon({ ...req.body, code: req.body.code.toUpperCase() });
        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (error) {
        res.status(400).json({ message: 'Error creating coupon', error: error.message });
    }
});

adminRouter.patch('/coupons/:id', async (req, res) => {
    const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCoupon);
});

// --- Server Start ---
// Global error handler — last line of defense. Express 5 auto-forwards rejected
// async handlers here (e.g. a malformed :id → Mongoose CastError). Never leak the
// stack/internal message to the client; CORS rejections surface as a clean 403.
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err && err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'Origin not allowed.' });
    }
    console.error('[unhandled]', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

app.listen(port, () => console.log(`Server running on port ${port}`));

// Seed initial admin user. Only runs when SEED_ADMIN=true. Credentials must come
// from env so we never bake real secrets into source.
const seedAdminUser = async () => {
    try {
        const seedEmail = process.env.SEED_ADMIN_EMAIL;
        const seedPassword = process.env.SEED_ADMIN_PASSWORD;
        if (!seedEmail || !seedPassword) {
            console.warn('SEED_ADMIN=true but SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set. Skipping seed.');
            return;
        }
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(seedPassword, 12);
            const admin = new User({
                name: process.env.SEED_ADMIN_NAME || 'Admin',
                email: seedEmail,
                password: hashedPassword,
                role: 'admin',
            });
            await admin.save();
            console.log(`Default admin user created: ${seedEmail}`);
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};