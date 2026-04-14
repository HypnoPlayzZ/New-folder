import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ShoppingCart, User, Sun, Moon, Menu as MenuIcon, X,
  Star, Clock, Truck, Check, Plus, Minus, Search,
  Zap, Leaf, MapPin, ArrowRight, Package, Flame,
  ChevronRight, Bike, Instagram, Facebook, Twitter,
  ChefHat, Sparkles, BadgePercent, Phone, Mail,
  UtensilsCrossed,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import './App.css';
import { api } from './api';

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────
const MENU_DATA = [
  { id: 1, name: "Steamed Veg Momos", category: "Momos", halfPrice: 79, fullPrice: 139, description: "Delicate steamed dumplings stuffed with fresh vegetables and aromatic spices", rating: 4.8, prepTime: "15 min", tag: "Bestseller", available: true },
  { id: 2, name: "Paneer Momos", category: "Momos", halfPrice: 99, fullPrice: 169, description: "Soft momos filled with spiced cottage cheese and fresh herbs", rating: 4.9, prepTime: "18 min", tag: "Spicy", available: true },
  { id: 3, name: "Paneer Tikka Momos", category: "Momos", halfPrice: 109, fullPrice: 189, description: "Smoky paneer tikka stuffing wrapped in silky dough", rating: 4.7, prepTime: "20 min", tag: "Chef's Pick", available: true },
  { id: 4, name: "Fried Cheese Momos", category: "Momos", halfPrice: 119, fullPrice: 199, description: "Crispy fried momos with gooey cheese filling", rating: 4.6, prepTime: "22 min", tag: "Crispy", available: true },
  { id: 5, name: "Margherita Pizza", category: "Italian", halfPrice: 149, fullPrice: 249, description: "Classic tomato, fresh mozzarella, and fragrant basil on a crispy base", rating: 4.7, prepTime: "25 min", tag: "Classic", available: true },
  { id: 6, name: "Penne Arrabbiata", category: "Italian", halfPrice: 129, fullPrice: 219, description: "Spicy tomato sauce with garlic and Italian herbs over al dente penne", rating: 4.5, prepTime: "20 min", tag: "Spicy", available: true },
  { id: 7, name: "Garlic Bread Bruschetta", category: "Italian", halfPrice: 89, fullPrice: 149, description: "Toasted ciabatta with fresh tomato, garlic, and basil drizzle", rating: 4.4, prepTime: "12 min", tag: "Quick", available: true },
  { id: 8, name: "Veg Hakka Noodles", category: "Chowmein", halfPrice: 89, fullPrice: 149, description: "Stir-fried noodles with fresh veggies in soy-ginger sauce", rating: 4.6, prepTime: "15 min", tag: "Popular", available: true },
  { id: 9, name: "Paneer Chowmein", category: "Chowmein", halfPrice: 109, fullPrice: 179, description: "Wok-tossed noodles with golden paneer cubes and crispy vegetables", rating: 4.8, prepTime: "18 min", tag: "Bestseller", available: true },
  { id: 10, name: "Schezwan Noodles", category: "Chowmein", halfPrice: 99, fullPrice: 169, description: "Fiery Schezwan sauce noodles packed with bold flavors", rating: 4.7, prepTime: "15 min", tag: "Extra Spicy", available: true },
  { id: 11, name: "Smoky BBQ Veg Burger", category: "Burgers", halfPrice: null, fullPrice: 169, description: "Crispy veg patty with smoky BBQ sauce, jalapeños and crispy onions", rating: 4.8, prepTime: "20 min", tag: "Loaded", available: true },
  { id: 12, name: "Paneer Tikka Burger", category: "Burgers", halfPrice: null, fullPrice: 159, description: "Grilled paneer tikka patty with mint chutney and coleslaw", rating: 4.7, prepTime: "18 min", tag: "Crispy", available: true },
  { id: 13, name: "Masala Fries", category: "Sides", halfPrice: null, fullPrice: 99, description: "Golden fries tossed with Indian masala and chaat powder", rating: 4.5, prepTime: "10 min", tag: "Crunchy", available: true },
  { id: 14, name: "Mango Lassi", category: "Drinks", halfPrice: null, fullPrice: 89, description: "Thick, creamy mango yogurt drink with a hint of cardamom", rating: 4.9, prepTime: "5 min", tag: "Refreshing", available: true },
  { id: 15, name: "Cold Coffee", category: "Drinks", halfPrice: null, fullPrice: 99, description: "Creamy blended coffee with vanilla ice cream", rating: 4.6, prepTime: "5 min", tag: "Chilled", available: true },
];

const CATEGORIES = ["All", "Momos", "Italian", "Chowmein", "Burgers", "Sides", "Drinks"];
const COUPONS = { "GRABTHEDEAL": 0.20, "FIRST50": 0.15, "STEAM10": 0.10 };
const ORDER_STEPS = ["Order Received", "Preparing", "Out for Delivery", "Delivered"];

// Real food photos (Unsplash)
const FOOD_IMAGES = {
  Momos:    "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=480&h=320&fit=crop&q=75",
  Italian:  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=480&h=320&fit=crop&q=75",
  Chowmein: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=480&h=320&fit=crop&q=75",
  Burgers:  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&q=75",
  Sides:    "https://images.unsplash.com/photo-1573080496219-bb964701c394?w=480&h=320&fit=crop&q=75",
  Drinks:   "https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=480&h=320&fit=crop&q=75",
  Default:  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=480&h=320&fit=crop&q=75",
};

const REVIEWS = [
  { name: "Ananya S.", text: "Super quick delivery and piping hot momos! Best in town without doubt.", rating: 5, initial: "A", color: "#FF8C00" },
  { name: "Rohit M.", text: "Loved the spicy chutney. Ordering again tonight. Highly recommend!", rating: 5, initial: "R", color: "#9333EA" },
  { name: "Priya K.", text: "Free delivery + 10% discount. Great portions and amazing quality.", rating: 5, initial: "P", color: "#0EA5E9" },
  { name: "Kabir T.", text: "Soft inside, crispy outside. Perfect momos every single time!", rating: 4, initial: "K", color: "#10B981" },
  { name: "Meera J.", text: "Best momos in town! Absolutely fresh and delicious every order.", rating: 5, initial: "M", color: "#F59E0B" },
  { name: "Sanjay P.", text: "The garlic sauce is absolutely addictive. A must try dish!", rating: 5, initial: "S", color: "#EF4444" },
  { name: "Nikita R.", text: "Generous portions and fair prices. Love everything on the menu.", rating: 4, initial: "N", color: "#6366F1" },
  { name: "Arjun D.", text: "Delivery in under 20 minutes! Amazing service and amazing food!", rating: 5, initial: "A", color: "#EC4899" },
];

const STATS = [
  { value: "2,000+", label: "Orders Delivered", icon: Package },
  { value: "4.8★", label: "Average Rating", icon: Star },
  { value: "30 min", label: "Avg. Delivery", icon: Clock },
  { value: "100%", label: "Pure Vegetarian", icon: Leaf },
];

const HOW_STEPS = [
  { icon: Search, title: "Browse Menu", desc: "Explore our freshly-crafted selection of momos, pasta, noodles & more.", step: "01" },
  { icon: ShoppingCart, title: "Place Order", desc: "Add to cart, choose your portion size, and confirm in seconds.", step: "02" },
  { icon: Truck, title: "Fast Delivery", desc: "Hot food delivered to your door in 30 minutes or less, guaranteed.", step: "03" },
];

// ─────────────────────────────────────────────
// THEME VARS
// ─────────────────────────────────────────────
const themes = {
  dark: {
    bg: "#060608", surface: "#0e0e12", card: "rgba(255,255,255,0.035)",
    border: "rgba(255,255,255,0.07)", text: "#f2f2f5", muted: "#7a7a88", faint: "#404050",
    inputBg: "rgba(255,255,255,0.05)", navBg: "rgba(6,6,8,0.85)",
  },
  light: {
    bg: "#faf9f7", surface: "#ffffff", card: "rgba(0,0,0,0.028)",
    border: "rgba(0,0,0,0.08)", text: "#18181b", muted: "#5c5c6e", faint: "#b0b0bc",
    inputBg: "rgba(0,0,0,0.04)", navBg: "rgba(250,249,247,0.92)",
  }
};

// ─────────────────────────────────────────────
// FRAMER MOTION VARIANTS
// ─────────────────────────────────────────────
const ease = [0.2, 0.9, 0.2, 1];
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const cardAnim = { hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease } } };
const slideRight = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } } };
const slideLeft = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } } };

// ─────────────────────────────────────────────
// SVG CATEGORY ICONS
// ─────────────────────────────────────────────
const CategoryIcons = {
  Momos: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <ellipse cx="24" cy="30" rx="18" ry="10" fill="currentColor" opacity="0.15"/>
      <path d="M8 28 Q14 16 24 14 Q34 16 40 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M8 28 Q16 36 24 36 Q32 36 40 28" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M16 26 Q20 22 24 22 Q28 22 32 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M22 14 Q24 10 26 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Italian: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M8 36 L24 10 L40 36 Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" strokeLinejoin="round"/>
      <circle cx="20" cy="26" r="3" fill="currentColor" opacity="0.6"/>
      <circle cx="28" cy="30" r="2.5" fill="currentColor" opacity="0.5"/>
      <circle cx="24" cy="22" r="2" fill="currentColor" opacity="0.4"/>
      <path d="M8 36 Q24 40 40 36" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  Chowmein: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="10" y="28" width="28" height="12" rx="4" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 28 Q18 18 20 22 Q22 26 24 20 Q26 14 28 18 Q30 22 32 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M13 28 Q15 16 17 20 Q19 24 21 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <line x1="20" y1="12" x2="20" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="12" x2="28" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Burgers: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M10 20 Q10 12 24 12 Q38 12 38 20 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <rect x="8" y="20" width="32" height="5" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="8" y="25" width="32" height="5" rx="1" fill="currentColor" opacity="0.5"/>
      <path d="M8 30 Q8 38 24 38 Q40 38 40 30 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 22 Q18 24 24 22 Q30 20 38 22" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    </svg>
  ),
  Sides: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="14" y="18" width="20" height="22" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
      <rect x="16" y="14" width="16" height="6" rx="2" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/>
      <rect x="18" y="22" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="22.5" y="22" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="27" y="22" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  Drinks: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M16 14 L14 38 Q14 40 24 40 Q34 40 32 38 L30 14 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M30 14 L36 20 Q38 24 34 26 L30 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M16 22 Q20 26 28 22" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
      <line x1="22" y1="10" x2="22" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="8" x2="27" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────
// FOOD ILLUSTRATION SVGS (used in cart & hero)
// ─────────────────────────────────────────────
const FoodIllustrations = {
  Momos: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <ellipse cx="40" cy="55" rx="28" ry="14" fill="#FF8C00" opacity="0.15"/>
      <path d="M14 48 Q20 28 40 24 Q60 28 66 48" stroke="#FF8C00" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M14 48 Q26 62 40 62 Q54 62 66 48" stroke="#FF8C00" strokeWidth="3" fill="none"/>
      <path d="M25 44 Q32 36 40 36 Q48 36 55 44" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M38 24 Q40 18 42 22" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="40" cy="43" r="3" fill="#FF8C00" opacity="0.4"/>
    </svg>
  ),
  Italian: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <path d="M12 60 L40 16 L68 60 Z" stroke="#FF8C00" strokeWidth="2.5" fill="#FF8C00" fillOpacity="0.08" strokeLinejoin="round"/>
      <circle cx="34" cy="44" r="5" fill="#FF8C00" opacity="0.5"/>
      <circle cx="46" cy="50" r="4" fill="#FF8C00" opacity="0.4"/>
      <circle cx="40" cy="36" r="3" fill="#FF8C00" opacity="0.3"/>
      <circle cx="28" cy="54" r="3" fill="#FF8C00" opacity="0.3"/>
      <path d="M12 60 Q40 66 68 60" stroke="#FF8C00" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  Chowmein: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="16" y="46" width="48" height="20" rx="6" fill="#FF8C00" opacity="0.12" stroke="#FF8C00" strokeWidth="2.5"/>
      <path d="M26 46 Q30 26 34 34 Q38 42 40 30 Q42 18 46 26 Q50 34 54 46" stroke="#FF8C00" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M20 46 Q24 24 28 30 Q32 36 34 22" stroke="#FF8C00" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <line x1="34" y1="18" x2="34" y2="12" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="46" y1="18" x2="46" y2="12" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Burgers: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <path d="M16 34 Q16 20 40 20 Q64 20 64 34 Z" fill="#FF8C00" opacity="0.2" stroke="#FF8C00" strokeWidth="2.5"/>
      <rect x="12" y="34" width="56" height="9" rx="2" fill="#FF8C00" opacity="0.25"/>
      <rect x="12" y="43" width="56" height="9" rx="2" fill="#FF8C00" opacity="0.4"/>
      <path d="M12 52 Q12 64 40 64 Q68 64 68 52 Z" fill="#FF8C00" opacity="0.2" stroke="#FF8C00" strokeWidth="2.5"/>
      <path d="M16 37 Q30 41 40 37 Q50 33 64 37" stroke="#FF8C00" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round"/>
    </svg>
  ),
  Sides: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="24" y="28" width="32" height="36" rx="5" fill="#FF8C00" opacity="0.12" stroke="#FF8C00" strokeWidth="2.5"/>
      <rect x="26" y="20" width="28" height="10" rx="3" fill="#FF8C00" opacity="0.2" stroke="#FF8C00" strokeWidth="2.5"/>
      <rect x="30" y="34" width="5" height="24" rx="2.5" fill="#FF8C00" opacity="0.5"/>
      <rect x="37.5" y="34" width="5" height="24" rx="2.5" fill="#FF8C00" opacity="0.5"/>
      <rect x="45" y="34" width="5" height="24" rx="2.5" fill="#FF8C00" opacity="0.5"/>
    </svg>
  ),
  Drinks: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <path d="M28 22 L24 62 Q24 66 40 66 Q56 66 52 62 L48 22 Z" fill="#FF8C00" fillOpacity="0.1" stroke="#FF8C00" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M48 22 L58 32 Q62 40 56 44 L48 40" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M28 36 Q34 44 48 36" stroke="#FF8C00" strokeWidth="2.5" fill="#FF8C00" fillOpacity="0.2" strokeLinecap="round"/>
      <line x1="37" y1="16" x2="37" y2="10" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="43" y1="14" x2="44" y2="8" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Default: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <circle cx="40" cy="40" r="24" fill="#FF8C00" opacity="0.1" stroke="#FF8C00" strokeWidth="2"/>
      <path d="M28 36 Q34 28 40 30 Q46 28 52 36" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M28 44 Q34 52 40 50 Q46 52 52 44" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
};

function getFoodIllustration(category) {
  const C = FoodIllustrations[category] || FoodIllustrations.Default;
  return <C />;
}

// Tag color map
const TAG_COLORS = {
  Bestseller:    { bg: "rgba(255,140,0,0.15)", text: "#FF8C00", border: "rgba(255,140,0,0.3)" },
  "Chef's Pick": { bg: "rgba(99,102,241,0.15)", text: "#818cf8", border: "rgba(99,102,241,0.3)" },
  Spicy:         { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.3)" },
  "Extra Spicy": { bg: "rgba(220,38,38,0.15)", text: "#ef4444", border: "rgba(220,38,38,0.3)" },
  Popular:       { bg: "rgba(34,197,94,0.12)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
  Classic:       { bg: "rgba(234,179,8,0.12)", text: "#facc15", border: "rgba(234,179,8,0.25)" },
  Quick:         { bg: "rgba(34,197,94,0.12)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
  Crispy:        { bg: "rgba(255,140,0,0.12)", text: "#fb923c", border: "rgba(255,140,0,0.25)" },
  Loaded:        { bg: "rgba(255,140,0,0.12)", text: "#fb923c", border: "rgba(255,140,0,0.25)" },
  Refreshing:    { bg: "rgba(56,189,248,0.12)", text: "#38bdf8", border: "rgba(56,189,248,0.25)" },
  Chilled:       { bg: "rgba(56,189,248,0.12)", text: "#38bdf8", border: "rgba(56,189,248,0.25)" },
  Crunchy:       { bg: "rgba(255,140,0,0.12)", text: "#fb923c", border: "rgba(255,140,0,0.25)" },
};

// ─────────────────────────────────────────────
// COMPONENT: NAVBAR
// ─────────────────────────────────────────────
function Navbar({ cartCount, setPage, page, setCartOpen, user, setUser, isDark, toggleTheme }) {
  const [mob, setMob] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on page change
  useEffect(() => { setMob(false); }, [page]);

  const navBg = scrolled
    ? (isDark ? "rgba(6,6,8,0.95)" : "rgba(250,249,247,0.97)")
    : t.navBg;

  const navLinks = [["home", "Home"], ["menu", "Menu"], ["orders", "Track Order"]];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        style={{
          background: navBg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: scrolled ? `1px solid ${t.border}` : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
        }}
        className="navbar-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => setPage("home")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5"
          >
            <img
              src="/Logo.png"
              alt="SteamyBites"
              className="h-10 w-auto object-contain"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span style={{ color: "#FF8C00" }} className="font-black text-xl tracking-tight hidden sm:block">
              Steamy Bites
            </span>
          </motion.button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(([p, l]) => (
              <motion.button
                key={p}
                onClick={() => setPage(p)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  color: page === p ? "#FF8C00" : t.muted,
                  background: page === p ? "rgba(255,140,0,0.1)" : "transparent",
                }}
                className={`nav-item-pill ${page === p ? "active" : ""} px-4 py-2 rounded-xl text-sm font-semibold transition-all`}
              >
                {l}
              </motion.button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ rotate: 20, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ background: t.card, border: `1px solid ${t.border}`, color: t.muted }}
              className="theme-btn p-2.5 rounded-xl hover:text-orange-500 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark
                ? <Sun className="w-[18px] h-[18px]" />
                : <Moon className="w-[18px] h-[18px]" />
              }
            </motion.button>

            {/* Auth */}
            {!user ? (
              <motion.button
                onClick={() => setPage("auth")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25"
              >
                <User className="w-4 h-4" />
                Sign In
              </motion.button>
            ) : (
              <div className="hidden md:flex items-center gap-2.5">
                <div
                  style={{ background: "rgba(255,140,0,0.15)", color: "#FF8C00" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                >
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ color: t.muted }} className="text-sm font-semibold hidden lg:block">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={() => setUser(null)}
                  style={{ color: t.faint }}
                  className="text-xs hover:text-orange-500 transition-colors ml-1"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Cart Button */}
            <motion.button
              onClick={() => setCartOpen(true)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              className="cart-btn relative p-2.5 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 rounded-xl text-orange-500 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="cart-count absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md shadow-orange-500/40"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Hamburger */}
            <motion.button
              onClick={() => setMob(!mob)}
              whileTap={{ scale: 0.92 }}
              style={{ color: t.muted }}
              className="md:hidden p-2 rounded-xl hover:text-orange-500 transition-all"
            >
              {mob
                ? <X className="w-6 h-6" />
                : <MenuIcon className="w-6 h-6" />
              }
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mob && (
          <>
            <motion.div
              key="mob-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={() => setMob(false)}
            />
            <motion.div
              key="mob-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{ background: isDark ? "#0e0e12" : "#ffffff", borderLeft: `1px solid ${t.border}` }}
              className="mobile-drawer shadow-2xl"
            >
              <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.border}` }}>
                <span style={{ color: "#FF8C00" }} className="font-black text-lg">Steamy Bites</span>
                <button onClick={() => setMob(false)} style={{ color: t.faint }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map(([p, l]) => (
                  <motion.button
                    key={p}
                    onClick={() => { setPage(p); setMob(false); }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      color: page === p ? "#FF8C00" : t.muted,
                      background: page === p ? "rgba(255,140,0,0.08)" : "transparent",
                    }}
                    className="mobile-nav-item w-full text-left px-4 py-3 rounded-xl text-sm font-semibold"
                  >
                    {l}
                  </motion.button>
                ))}
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
                  {!user ? (
                    <button
                      onClick={() => { setPage("auth"); setMob(false); }}
                      className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold"
                    >
                      Sign In
                    </button>
                  ) : (
                    <div className="flex items-center justify-between px-2">
                      <span style={{ color: t.text }} className="text-sm font-semibold">{user.name}</span>
                      <button onClick={() => setUser(null)} style={{ color: t.faint }} className="text-xs hover:text-orange-500">Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: AUTH PAGE
// ─────────────────────────────────────────────
function AuthPage({ setUser, setPage, isDark }) {
  const [error, setError] = useState("");
  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    const GOOGLE_CLIENT_ID = "414726937830-u8n7mhl0ujipnd6lr9ikku005nu72ec6.apps.googleusercontent.com";
    const buttonDiv = document.getElementById("google-signin-button");

    const initGoogleButton = () => {
      if (window.google?.accounts?.id && buttonDiv) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (googleResponse) => {
            try {
              const res = await api.post('/auth/google', { token: googleResponse.credential });
              const { token, userName } = res.data;
              localStorage.setItem('customer_token', token);
              const payload = JSON.parse(atob(googleResponse.credential.split(".")[1]));
              setUser({ name: userName || payload.name || payload.email, email: payload.email, picture: payload.picture });
              setPage("menu");
            } catch {
              setError("Google Sign-In failed. Please try again.");
            }
          },
        });
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: isDark ? "filled_black" : "outline",
          size: "large",
          width: 280,
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogleButton();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isDark, setUser, setPage]);

  return (
    <div style={{ background: t.bg, minHeight: "100vh" }} className="auth-page-bg flex items-center justify-center px-4 pt-20 pb-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="relative w-full max-w-sm"
      >
        <div
          style={{
            background: isDark ? "rgba(14,14,18,0.95)" : "white",
            border: `1px solid ${t.border}`,
            backdropFilter: "blur(24px)",
          }}
          className="auth-card rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="auth-banner relative h-36 bg-gradient-to-br from-orange-500 to-orange-700 overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-20 flex items-center justify-center gap-8">
              <FoodIllustrations.Momos />
              <FoodIllustrations.Italian />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <img src="/Logo.png" alt="SteamyBites" className="h-14 w-auto object-contain drop-shadow-xl" onError={e => { e.target.style.display = 'none'; }} />
              <p className="text-white/80 text-xs font-bold tracking-widest uppercase mt-1">SteamyBites</p>
            </div>
          </div>

          <div className="p-7 flex flex-col items-center">
            <h2 style={{ color: t.text }} className="text-2xl font-black mb-1 text-center">Welcome Back</h2>
            <p style={{ color: t.muted }} className="text-sm mb-7 text-center">Sign in to continue your food journey</p>

            {error && (
              <div className="w-full mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20 text-center">{error}</div>
            )}

            <div id="google-signin-button" className="flex justify-center" />

            <p style={{ color: t.faint }} className="text-xs mt-6 text-center">
              By signing in, you agree to our{" "}
              <span className="text-orange-500 cursor-pointer hover:underline">Terms &amp; Privacy Policy</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: HERO SECTION
// ─────────────────────────────────────────────
function HeroSection({ setPage, isDark }) {
  const t = isDark ? themes.dark : themes.light;
  const [tick, setTick] = useState(0);
  const tags = ["Steamed Momos", "Italian", "Chowmein", "Burgers"];

  useEffect(() => {
    const i = setInterval(() => setTick(p => p + 1), 2400);
    return () => clearInterval(i);
  }, []);

  return (
    <section style={{ background: t.bg }} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        {isDark && <div className="dark-grid absolute inset-0" />}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left: Text */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="live-badge inline-flex items-center gap-2 bg-green-500/12 border border-green-500/25 rounded-full px-4 py-1.5 mb-7">
            <span className="live-dot w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold" style={{ color: isDark ? "#4ade80" : "#16a34a" }}>Live order tracking</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            style={{ color: t.text }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight mb-5"
          >
            Crave it.<br />
            <span className="gradient-text-hero">Order it.</span><br />
            Love it.
          </motion.h1>

          <motion.p variants={fadeUp} style={{ color: t.muted }} className="text-lg mb-8 max-w-md leading-relaxed">
            Fresh momos, sizzling pasta, crispy veg burgers — 100% vegetarian, crafted with care and at your door in 30 minutes.
          </motion.p>

          {/* Animated category tags */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-9">
            {tags.map((tag, i) => (
              <motion.span
                key={tag}
                animate={{
                  background: tick % tags.length === i ? "rgba(255,140,0,0.15)" : (isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.028)"),
                  borderColor: tick % tags.length === i ? "rgba(255,140,0,0.4)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"),
                  color: tick % tags.length === i ? "#FF8C00" : t.faint,
                  scale: tick % tags.length === i ? 1.06 : 1,
                }}
                transition={{ duration: 0.4 }}
                style={{ border: "1px solid" }}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold cursor-default"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
            <motion.button
              onClick={() => setPage("menu")}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="hero-cta flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/30 text-base"
            >
              Order Now
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {["R", "P", "A"].map((l, i) => (
                  <div
                    key={i}
                    style={{ borderColor: t.bg }}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div style={{ color: t.muted }} className="text-sm">
                <span style={{ color: t.text }} className="font-bold">4.8★</span> · 2k+ orders
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="hidden lg:flex items-center justify-center"
        >
          <div className="relative w-80 h-80">
            <div className="hero-ring absolute inset-0 rounded-full border border-orange-500/20"
              style={{ background: "radial-gradient(circle, rgba(255,140,0,0.07) 0%, transparent 70%)" }} />
            <div className="hero-ring-rev absolute inset-6 rounded-full border border-orange-400/10" />

            {/* Center hero food photo */}
            <div className="absolute inset-10 hero-photo-ring">
              <img
                src={FOOD_IMAGES.Momos}
                alt="Steamy Bites food"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating category chips */}
            {[
              { Icon: CategoryIcons.Italian, label: "Italian", pos: { top: "-20px", right: "-20px" } },
              { Icon: CategoryIcons.Chowmein, label: "Noodles", pos: { bottom: "0px", left: "-40px" } },
              { Icon: CategoryIcons.Burgers, label: "Burgers", pos: { top: "50%", right: "-50px" } },
            ].map(({ Icon, label, pos }) => (
              <motion.div
                key={label}
                style={{ ...pos, background: isDark ? "rgba(20,20,26,0.95)" : "white", border: `1px solid ${t.border}`, position: "absolute" }}
                className="hero-chip backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl"
                whileHover={{ y: -6, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-8 h-8 flex items-center justify-center text-orange-500"><Icon /></div>
                <span style={{ color: t.text }} className="text-sm font-semibold">{label}</span>
              </motion.div>
            ))}

            {/* Stats pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{ background: isDark ? "#111" : "white", border: `1px solid ${t.border}` }}
              className="hero-stats absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 flex gap-5 whitespace-nowrap shadow-2xl"
            >
              {[["30 min", "Delivery"], ["₹0", "Over ₹250"], ["4.8★", "Rating"]].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div style={{ color: t.text }} className="font-black text-sm">{v}</div>
                  <div style={{ color: t.faint }} className="text-xs">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span style={{ color: t.faint }} className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 1.5, height: 24, background: `linear-gradient(to bottom, ${t.faint}, transparent)`, borderRadius: 2 }}
        />
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: FOOD CARD
// ─────────────────────────────────────────────
function FoodCard({ item, onAddToCart, isDark }) {
  const [size, setSize] = useState(item.halfPrice ? "half" : "full");
  const [added, setAdded] = useState(false);
  const t = isDark ? themes.dark : themes.light;
  const price = size === "half" ? item.halfPrice : item.fullPrice;
  const tagStyle = TAG_COLORS[item.tag] || TAG_COLORS.Bestseller;
  const imgSrc = FOOD_IMAGES[item.category] || FOOD_IMAGES.Default;

  function handleAdd() {
    setAdded(true);
    onAddToCart({ ...item, selectedSize: size, selectedPrice: price });
    toast.success(`${item.name} added to cart!`, { duration: 1800 });
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <motion.div
      variants={cardAnim}
      style={{ background: t.card, border: `1px solid ${t.border}` }}
      className="food-card rounded-2xl overflow-hidden group"
    >
      {/* Food Image */}
      <div className="food-card-img-wrap">
        <img
          src={imgSrc}
          alt={item.name}
          className="food-card-img"
          onError={e => { e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full" style="background:rgba(255,140,0,0.04)">${document.createElement('div').innerHTML = ''}</div>`; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Tag */}
        {item.tag && (
          <span
            style={{ background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}` }}
            className="food-tag absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm"
          >
            {item.tag}
          </span>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white/80 font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 style={{ color: t.text }} className="font-bold text-base leading-tight mb-1">{item.name}</h3>
        <p style={{ color: t.faint }} className="text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {item.rating}
          </span>
          <span style={{ color: t.faint }} className="flex items-center gap-1 text-xs">
            <Clock className="w-3.5 h-3.5" />
            {item.prepTime}
          </span>
        </div>

        {item.halfPrice && (
          <div
            style={{ background: t.inputBg, border: `1px solid ${t.border}` }}
            className="flex rounded-xl p-1 mb-3"
          >
            {["half", "full"].map(s => (
              <motion.button
                key={s}
                onClick={() => setSize(s)}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: size === s ? "#FF8C00" : "transparent",
                  color: size === s ? "white" : t.faint,
                }}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                {s === "half" ? `Half ₹${item.halfPrice}` : `Full ₹${item.fullPrice}`}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-orange-500 font-black text-xl">₹{price}</span>
          {item.available && (
            <motion.button
              onClick={handleAdd}
              disabled={added}
              whileHover={!added ? { scale: 1.06 } : {}}
              whileTap={!added ? { scale: 0.92 } : {}}
              style={{
                background: added ? "rgba(34,197,94,0.15)" : "#FF8C00",
                color: added ? "#4ade80" : "white",
                border: added ? "1px solid rgba(34,197,94,0.3)" : "none",
              }}
              className="add-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              {added ? (
                <><Check className="w-4 h-4" /> Added</>
              ) : (
                <><Plus className="w-4 h-4" /> Add</>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: MENU PAGE
// ─────────────────────────────────────────────
function MenuPage({ setCart, isDark }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const t = isDark ? themes.dark : themes.light;

  const filtered = MENU_DATA.filter(i =>
    (cat === "All" || i.category === cat) &&
    (i.name.toLowerCase().includes(q.toLowerCase()) || i.category.toLowerCase().includes(q.toLowerCase()))
  );

  function addToCart(item) {
    setCart(prev => {
      const key = `${item.id}-${item.selectedSize}`;
      const ex = prev.find(c => `${c.id}-${c.selectedSize}` === key);
      if (ex) return prev.map(c => `${c.id}-${c.selectedSize}` === key ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  return (
    <div style={{ background: t.bg }} className="page-wrap pt-20 min-h-screen">
      {/* Menu Hero */}
      <div
        style={{ background: isDark ? "linear-gradient(to bottom, #0d0d10, transparent)" : "linear-gradient(to bottom, #eee9de, transparent)" }}
        className="menu-hero py-10 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="section-tag mb-3">
              <UtensilsCrossed className="w-3.5 h-3.5" /> Our Full Menu
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ color: t.text }} className="text-4xl font-black mb-1">
              What's Cooking Today
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: t.muted }} className="mb-6 text-sm">
              Fresh, made-to-order. Every single time.
            </motion.p>

            {/* Search */}
            <motion.div variants={fadeUp} className="relative max-w-md mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: t.faint }}>
                <Search className="w-4 h-4" />
              </div>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search dishes..."
                style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                className="search-bar w-full pl-11 pr-4 py-3 rounded-2xl text-sm placeholder-zinc-500 outline-none transition-all"
              />
            </motion.div>

            {/* Category Pills */}
            <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map(c => (
                <motion.button
                  key={c}
                  onClick={() => setCat(c)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: cat === c ? "#FF8C00" : t.card,
                    border: `1px solid ${cat === c ? "#FF8C00" : t.border}`,
                    color: cat === c ? "white" : t.muted,
                  }}
                  className={`cat-pill ${cat === c ? "active" : ""} px-4 py-2 rounded-xl text-sm font-bold`}
                >
                  {c}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="empty-state text-center py-20" style={{ color: t.faint }}>
            <Search className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-semibold">No items found for "{q}"</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6"
          >
            {filtered.map(item => (
              <FoodCard key={item.id} item={item} onAddToCart={addToCart} isDark={isDark} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: CART MODAL
// ─────────────────────────────────────────────
function CartModal({ cart, setCart, open, setOpen, setPage, isDark, user }) {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponErr, setCouponErr] = useState("");
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const t = isDark ? themes.dark : themes.light;

  const sub = cart.reduce((s, i) => s + i.selectedPrice * i.qty, 0);
  const delivery = sub >= 250 ? 0 : 40;
  const disc = appliedCoupon ? Math.round(sub * COUPONS[appliedCoupon]) : 0;
  const total = sub + delivery - disc;

  function updQty(key, d) {
    setCart(prev =>
      prev.map(c => `${c.id}-${c.selectedSize}` === key ? { ...c, qty: Math.max(0, c.qty + d) } : c)
        .filter(c => c.qty > 0)
    );
  }

  function applyCpn() {
    if (COUPONS[coupon.toUpperCase()]) {
      setAppliedCoupon(coupon.toUpperCase());
      setCouponErr("");
      toast.success(`Coupon "${coupon.toUpperCase()}" applied!`);
    } else {
      setCouponErr("Invalid coupon code");
      setAppliedCoupon(null);
      toast.error("Invalid coupon code");
    }
  }

  async function placeOrder() {
    if (!address.trim()) {
      toast.warning("Please enter a delivery address");
      return;
    }
    setProcessing(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({
          itemName: i.name,
          quantity: i.qty,
          variant: i.selectedSize === 'half' ? 'half' : 'full',
          priceAtOrder: i.selectedPrice,
        })),
        totalPrice: sub,
        finalPrice: total,
        customerName: user?.name || 'Customer',
        address,
        paymentMethod: 'COD',
      });
      setProcessing(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setCart([]);
        setOpen(false);
        setAppliedCoupon(null);
        setCoupon("");
        setAddress("");
        setPage("orders");
      }, 1800);
    } catch (err) {
      setProcessing(false);
      toast.error(err.response?.data?.message || 'Failed to place order. Please sign in and try again.');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            key="cart-panel"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{ background: isDark ? "#0e0e12" : "#ffffff", border: `1px solid ${t.border}`, maxHeight: "92vh" }}
            className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-4 sm:bottom-4 w-full sm:w-[440px] z-[201] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ borderBottom: `1px solid ${t.border}` }} className="px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-500">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ color: t.text }} className="font-black text-lg">Your Cart</h3>
                  <p style={{ color: t.faint }} className="text-xs">{cart.reduce((s, i) => s + i.qty, 0)} items · Est. 30 min</p>
                </div>
              </div>
              <motion.button
                onClick={() => setOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ color: t.faint, background: t.card, border: `1px solid ${t.border}` }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:text-orange-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {done ? (
              <div className="order-success flex-1 flex flex-col items-center justify-center gap-4 py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="success-ring w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-10 h-10">
                    <path className="success-check" d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <div className="text-center">
                  <h3 style={{ color: t.text }} className="font-black text-xl mb-1">Order Placed!</h3>
                  <p style={{ color: t.muted }} className="text-sm">Redirecting to tracking...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <ShoppingCart className="w-16 h-16 opacity-20" style={{ color: t.faint }} />
                      <p style={{ color: t.faint }} className="text-sm font-semibold">Your cart is empty</p>
                      <button onClick={() => setOpen(false)} className="text-orange-500 text-sm font-bold hover:text-orange-400 transition-colors">
                        Browse Menu →
                      </button>
                    </div>
                  ) : (
                    cart.map(item => {
                      const key = `${item.id}-${item.selectedSize}`;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          style={{ background: t.card, border: `1px solid ${t.border}` }}
                          className="cart-item-row flex items-center gap-3 rounded-2xl p-3"
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: "rgba(255,140,0,0.08)" }}>
                            <img
                              src={FOOD_IMAGES[item.category] || FOOD_IMAGES.Default}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ color: t.text }} className="text-sm font-bold truncate">{item.name}</p>
                            <p style={{ color: t.faint }} className="text-xs capitalize">{item.selectedSize} · ₹{item.selectedPrice}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updQty(key, -1)}
                              style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.muted }}
                              className="qty-btn w-7 h-7 rounded-lg flex items-center justify-center hover:text-orange-500"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </motion.button>
                            <span style={{ color: t.text }} className="w-5 text-center text-sm font-black">{item.qty}</span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updQty(key, 1)}
                              className="qty-btn w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-500 flex items-center justify-center hover:bg-orange-500/25"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                          <span className="text-orange-500 font-black text-sm flex-shrink-0">₹{item.selectedPrice * item.qty}</span>
                        </motion.div>
                      );
                    })
                  )}

                  {cart.length > 0 && (
                    <div className="pt-3 space-y-3">
                      {/* Coupon */}
                      <div style={{ background: t.card, border: `1px solid ${t.border}` }} className="rounded-2xl p-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <BadgePercent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500/60" />
                            <input
                              value={coupon}
                              onChange={e => setCoupon(e.target.value)}
                              placeholder="Coupon code"
                              style={{ background: t.inputBg, border: `1px solid ${couponErr ? "rgba(239,68,68,0.4)" : t.border}`, color: t.text }}
                              className="coupon-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                            />
                          </div>
                          <button
                            onClick={applyCpn}
                            className="px-4 py-2.5 bg-orange-500/15 border border-orange-500/25 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-500/25 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {couponErr && <p className="text-red-400 text-xs mt-1.5 ml-1">{couponErr}</p>}
                        {appliedCoupon && (
                          <p className="text-green-400 text-xs mt-1.5 ml-1">
                            ✓ {Math.round(COUPONS[appliedCoupon] * 100)}% discount applied!
                          </p>
                        )}
                      </div>

                      {/* Address */}
                      <div style={{ background: t.card, border: `1px solid ${t.border}` }} className="rounded-2xl p-3">
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-orange-500/60" />
                          <textarea
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="Delivery address..."
                            rows={2}
                            style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                            className="input-field w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                          />
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div style={{ background: t.card, border: `1px solid ${t.border}` }} className="rounded-2xl p-4 space-y-2">
                        {[
                          ["Subtotal", `₹${sub}`],
                          ["Delivery", delivery === 0 ? "FREE" : `₹${delivery}`],
                          ...(disc > 0 ? [["Discount", `-₹${disc}`]] : []),
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span style={{ color: t.muted }}>{label}</span>
                            <span style={{ color: val === "FREE" ? "#4ade80" : val.startsWith("-") ? "#f87171" : t.text }} className="font-semibold">{val}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: `1px solid ${t.border}` }} className="pt-2 flex justify-between">
                          <span style={{ color: t.text }} className="font-black">Total</span>
                          <span className="text-orange-500 font-black text-lg">₹{total}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                {cart.length > 0 && (
                  <div style={{ borderTop: `1px solid ${t.border}` }} className="p-4 flex-shrink-0">
                    <motion.button
                      onClick={placeOrder}
                      disabled={processing}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="order-btn w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <>
                          <Truck className="w-5 h-5" />
                          Confirm Order · ₹{total}
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: ORDERS PAGE
// ─────────────────────────────────────────────
const STATUS_TO_STEP = {
  'Received': 0, 'Pending Payment': 0,
  'Preparing': 1, 'Ready': 1,
  'Out for Delivery': 2,
  'Delivered': 3, 'Rejected': 3,
};

function OrdersPage({ isDark }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = isDark ? themes.dark : themes.light;
  const activeOrder = orders[0] || null;
  const pastOrders = orders.slice(1);
  const step = activeOrder ? (STATUS_TO_STEP[activeOrder.status] ?? 0) : 0;
  const isRejected = activeOrder?.status === 'Rejected';

  const fetchOrders = async () => {
    try {
      const res = await api.get('/my-orders');
      setOrders(res.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (!activeOrder?._id) return;
    const token = localStorage.getItem('customer_token');
    if (!token) return;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://steamybitesbackend.onrender.com/api';
    const es = new EventSource(`${baseURL}/orders/${activeOrder._id}/status-stream?token=${token}`);
    es.onmessage = (e) => {
      try {
        const { status } = JSON.parse(e.data);
        setOrders(prev => prev.map((o, i) => i === 0 ? { ...o, status } : o));
      } catch { }
    };
    return () => es.close();
  }, [activeOrder?._id]);

  const activeItemNames = activeOrder?.items?.map(i => i.itemName || i.menuItemId?.name || 'Item').join(' · ') || '';

  return (
    <div style={{ background: t.bg }} className="page-wrap pt-20 min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.div variants={fadeUp} className="section-tag mb-3">
          <Package className="w-3.5 h-3.5" /> Live Tracking
        </motion.div>
        <motion.h2 variants={fadeUp} style={{ color: t.text }} className="text-4xl font-black mb-1">Track Order</motion.h2>
        <motion.p variants={fadeUp} style={{ color: t.muted }} className="text-sm mb-8">Live status of your active order</motion.p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="w-8 h-8 animate-spin text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
          </svg>
        </div>
      ) : !activeOrder ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: t.card, border: `1px solid ${t.border}` }}
          className="rounded-3xl p-12 flex flex-col items-center justify-center gap-4 mb-8"
        >
          <ShoppingCart className="w-14 h-14 opacity-20" style={{ color: t.faint }} />
          <p style={{ color: t.faint }} className="text-sm font-semibold">No active orders yet</p>
          <p style={{ color: t.faint }} className="text-xs">Place an order to track it here</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: t.card, border: `1px solid ${isRejected ? "rgba(239,68,68,0.3)" : "rgba(255,140,0,0.2)"}` }}
          className="tracking-card rounded-3xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isRejected
                  ? <span className="text-red-400 text-xs font-black uppercase tracking-widest">Rejected</span>
                  : <><span className="live-dot w-2 h-2 rounded-full bg-orange-500" /><span className="text-orange-500 text-xs font-black uppercase tracking-widest">Live</span></>
                }
              </div>
              <h3 style={{ color: t.text }} className="font-black text-xl">Order #{activeOrder._id?.slice(-6).toUpperCase()}</h3>
              <p style={{ color: t.muted }} className="text-xs mt-0.5">{activeItemNames}</p>
              {activeOrder.address && <p style={{ color: t.faint }} className="text-xs mt-0.5 truncate max-w-xs">{activeOrder.address}</p>}
            </div>
            <div className="text-right">
              <p className="text-orange-500 font-black text-2xl">₹{activeOrder.finalPrice ?? activeOrder.totalPrice}</p>
              <p style={{ color: t.muted }} className="text-xs">{activeOrder.status}</p>
            </div>
          </div>

          {!isRejected && (
            <div className="relative py-2">
              <div style={{ background: t.border, position: "absolute", top: "50%", left: "20px", right: "20px", height: "2px", transform: "translateY(-50%)", zIndex: 0 }} />
              <motion.div
                className="stepper-bar"
                style={{ background: "linear-gradient(to right, #FF8C00, #fb923c)", position: "absolute", top: "50%", left: "20px", height: "2px", transform: "translateY(-50%)", zIndex: 0, maxWidth: "calc(100% - 40px)" }}
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 1, ease }}
              />
              <div className="relative flex justify-between z-10">
                {ORDER_STEPS.map((s, i) => (
                  <div key={s} className="flex flex-col items-center gap-2 w-16 sm:w-20">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        background: i <= step ? "#FF8C00" : (isDark ? "#1a1a22" : "#e5e7eb"),
                        border: `2px solid ${i <= step ? "#FF8C00" : t.border}`,
                        color: i <= step ? "white" : t.faint,
                        boxShadow: i <= step ? "0 0 20px rgba(255,140,0,0.45)" : "none",
                      }}
                      className={`step-dot ${i < step ? "done" : ""} ${i === step ? "current" : ""} w-9 h-9 rounded-full flex items-center justify-center text-xs font-black`}
                    >
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </motion.div>
                    <span style={{ color: i <= step ? t.text : t.faint }} className="text-center text-xs font-semibold leading-tight">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step >= 2 && step < 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: t.inputBg, border: `1px solid ${t.border}` }}
              className="mt-6 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                <Bike className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p style={{ color: t.text }} className="font-bold text-sm">Your order is on the way</p>
                <p style={{ color: t.muted }} className="text-xs">Delivery partner is heading to you</p>
              </div>
              <div className="ml-auto text-orange-500 text-xs font-bold animate-pulse">On the way</div>
            </motion.div>
          )}
        </motion.div>
      )}

      {pastOrders.length > 0 && (
        <>
          <h3 style={{ color: t.text }} className="font-black text-xl mb-4">Past Orders</h3>
          {pastOrders.map((o, idx) => {
            const names = o.items?.map(i => i.itemName || i.menuItemId?.name || 'Item').join(' · ') || '';
            const date = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            return (
              <motion.div
                key={o._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                style={{ background: t.card, border: `1px solid ${t.border}` }}
                className="past-order-card rounded-2xl p-4 flex items-center gap-4 mb-3"
              >
                <div style={{ background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.15)" }} className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={FOOD_IMAGES.Momos} alt="" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color: t.text }} className="font-bold text-sm">#{o._id?.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${o.status === 'Rejected' ? 'bg-red-500/12 text-red-400 border-red-500/20' : 'bg-green-500/12 text-green-500 border-green-500/20'}`}>
                      {o.status}
                    </span>
                  </div>
                  <p style={{ color: t.faint }} className="text-xs truncate max-w-xs">{names}</p>
                  <p style={{ color: t.faint }} className="text-xs">{date}</p>
                </div>
                <p className="text-orange-500 font-black">₹{o.finalPrice ?? o.totalPrice}</p>
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: TESTIMONIALS SECTION
// ─────────────────────────────────────────────
function TestimonialsSection({ isDark }) {
  const t = isDark ? themes.dark : themes.light;
  const doubled = [...REVIEWS, ...REVIEWS]; // duplicate for infinite scroll

  function StarRow({ count }) {
    return (
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className="w-3.5 h-3.5"
            style={{ color: i <= count ? "#FF8C00" : t.faint, fill: i <= count ? "#FF8C00" : "none" }}
          />
        ))}
      </div>
    );
  }

  return (
    <section style={{ background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.025)", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }} className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="section-tag mx-auto w-fit mb-4">
            <Star className="w-3.5 h-3.5 fill-current" /> Customer Reviews
          </div>
          <h2 style={{ color: t.text }} className="text-3xl sm:text-4xl font-black mb-3">Loved by thousands</h2>
          <p style={{ color: t.muted }} className="text-sm max-w-md mx-auto">Don't take our word for it — here's what our customers have to say.</p>
        </motion.div>
      </div>

      {/* Row 1: left scroll */}
      <div className="marquee-container mb-4">
        <div className="marquee-track-left">
          {doubled.map((rev, i) => (
            <div
              key={i}
              style={{ background: t.card, border: `1px solid ${t.border}` }}
              className="review-chip"
            >
              <StarRow count={rev.rating} />
              <p style={{ color: t.text }} className="text-sm font-medium leading-relaxed mb-3">"{rev.text}"</p>
              <div className="flex items-center gap-2.5">
                <div
                  style={{ background: `${rev.color}20`, color: rev.color }}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                >
                  {rev.initial}
                </div>
                <span style={{ color: t.muted }} className="text-xs font-semibold">{rev.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: right scroll */}
      <div className="marquee-container">
        <div className="marquee-track-right">
          {[...doubled].reverse().map((rev, i) => (
            <div
              key={i}
              style={{ background: t.card, border: `1px solid ${t.border}` }}
              className="review-chip"
            >
              <StarRow count={rev.rating} />
              <p style={{ color: t.text }} className="text-sm font-medium leading-relaxed mb-3">"{rev.text}"</p>
              <div className="flex items-center gap-2.5">
                <div
                  style={{ background: `${rev.color}20`, color: rev.color }}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                >
                  {rev.initial}
                </div>
                <span style={{ color: t.muted }} className="text-xs font-semibold">{rev.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: STATS SECTION
// ─────────────────────────────────────────────
function StatsSection({ isDark }) {
  const t = isDark ? themes.dark : themes.light;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map(({ value, label, icon: Icon }) => (
            <motion.div
              key={label}
              variants={cardAnim}
              style={{ background: t.card, border: `1px solid ${t.border}` }}
              className="stat-card-inner rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-orange-500" />
              </div>
              <div className="stat-value">{value}</div>
              <p style={{ color: t.faint }} className="text-xs font-semibold mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: HOW IT WORKS
// ─────────────────────────────────────────────
function HowItWorks({ isDark, setPage }) {
  const t = isDark ? themes.dark : themes.light;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderTop: `1px solid ${t.border}` }}
      className="py-20 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="section-tag mx-auto w-fit mb-4">
            <Zap className="w-3.5 h-3.5" /> How It Works
          </div>
          <h2 style={{ color: t.text }} className="text-3xl sm:text-4xl font-black mb-3">Order in 3 easy steps</h2>
          <p style={{ color: t.muted }} className="text-sm">Fast, simple, delicious.</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          {HOW_STEPS.map(({ icon: Icon, title, desc, step }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                whileHover={{ scale: 1.12, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="step-icon-wrap w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-5 shadow-xl shadow-orange-500/30"
              >
                <Icon className="w-7 h-7 text-white" />
              </motion.div>
              <div
                style={{ background: "rgba(255,140,0,0.08)", color: "#FF8C00" }}
                className="text-xs font-black tracking-wider mb-2 px-3 py-1 rounded-full"
              >
                STEP {step}
              </div>
              <h3 style={{ color: t.text }} className="font-black text-lg mb-2">{title}</h3>
              <p style={{ color: t.muted }} className="text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <motion.button
            onClick={() => setPage("menu")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/25 text-sm"
          >
            Start Ordering <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: FOOTER
// ─────────────────────────────────────────────
function Footer({ isDark, setPage }) {
  const t = isDark ? themes.dark : themes.light;

  return (
    <footer style={{ background: isDark ? "#060608" : "#1a1a1a", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)"}` }} className="pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/Logo.png" alt="SteamyBites" className="h-10 w-auto object-contain" onError={e => { e.target.style.display = 'none'; }} />
              <span className="text-white font-black text-lg">Steamy Bites</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              100% vegetarian cloud kitchen crafting momos, Asian fusion, and more. Delivered fresh to your door.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Twitter, label: "Twitter" },
                { icon: Facebook, label: "Facebook" },
              ].map(({ icon: Icon, label }) => (
                <motion.button
                  key={label}
                  whileHover={{ y: -4, scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  className="social-btn w-9 h-9 rounded-xl flex items-center justify-center text-white/50"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">Menu</h4>
            <ul className="space-y-2.5">
              {["Momos", "Italian", "Chowmein", "Burgers", "Sides", "Drinks"].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => setPage("menu")}
                    className="footer-link text-white/50 text-sm hover:text-orange-500 text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2.5">
              {[["home", "Home"], ["menu", "Order Now"], ["orders", "Track Order"], ["auth", "Sign In"]].map(([p, l]) => (
                <li key={p}>
                  <button
                    onClick={() => setPage(p)}
                    className="footer-link text-white/50 text-sm hover:text-orange-500 text-left"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2.5 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                hello@steamybites.in
              </li>
              <li className="flex items-start gap-2.5 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                Cloud Kitchen, Your City
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">© 2025 Steamy Bites · All rights reserved</p>
          <p className="text-white/30 text-xs flex items-center gap-1">
            Crafted with <span className="text-orange-500">♥</span> for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: HOME PAGE
// ─────────────────────────────────────────────
function HomePage({ setPage, setCart, isDark }) {
  const t = isDark ? themes.dark : themes.light;
  const featured = MENU_DATA.filter(i => ["Bestseller", "Chef's Pick"].includes(i.tag)).slice(0, 4);
  const cats = Object.entries(CategoryIcons);

  function addToCart(item) {
    setCart(prev => {
      const key = `${item.id}-${item.selectedSize}`;
      const ex = prev.find(c => `${c.id}-${c.selectedSize}` === key);
      if (ex) return prev.map(c => `${c.id}-${c.selectedSize}` === key ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  return (
    <div style={{ background: t.bg }}>
      <HeroSection setPage={setPage} isDark={isDark} />

      {/* Promo Strip */}
      <div className="promo-strip py-2 overflow-hidden">
        <div className="promo-strip-track">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-white text-xs font-bold whitespace-nowrap px-6 flex items-center gap-3">
              <Sparkles className="w-3.5 h-3.5" />
              Free Delivery Over ₹250
              <span className="opacity-50">·</span>
              10% Off Your First Order
              <span className="opacity-50">·</span>
              Use Code: FIRST50
            </span>
          ))}
        </div>
      </div>

      {/* Browse Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={slideRight} className="section-tag mb-3">
            <UtensilsCrossed className="w-3.5 h-3.5" /> Categories
          </motion.div>
          <motion.h2 variants={slideRight} style={{ color: t.text }} className="text-3xl font-black mb-1">
            Browse Categories
          </motion.h2>
          <motion.p variants={slideRight} style={{ color: t.muted }} className="text-sm mb-8">
            Everything you crave, all in one place.
          </motion.p>
          <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cats.map(([name, IconComp]) => (
              <motion.button
                key={name}
                variants={cardAnim}
                onClick={() => setPage("menu")}
                whileHover={{ y: -8, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{ background: t.card, border: `1px solid ${t.border}`, color: "#FF8C00" }}
                className="cat-card rounded-2xl p-5 flex flex-col items-center gap-2.5"
              >
                <div className="cat-card-icon"><IconComp /></div>
                <span style={{ color: t.muted }} className="text-sm font-bold">{name}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Picks */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <motion.div variants={slideRight} className="section-tag mb-3">
                <Flame className="w-3.5 h-3.5" /> Trending
              </motion.div>
              <motion.h2 variants={slideRight} style={{ color: t.text }} className="text-3xl font-black">
                Featured Picks
              </motion.h2>
              <motion.p variants={slideRight} style={{ color: t.muted }} className="text-sm mt-1">
                Most loved dishes this week
              </motion.p>
            </div>
            <motion.button
              variants={fadeIn}
              onClick={() => setPage("menu")}
              whileHover={{ x: 4 }}
              className="btn-lift text-orange-500 hover:text-orange-400 text-sm font-bold flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
          <motion.div
            variants={stagger}
            className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {featured.map(item => (
              <FoodCard key={item.id} item={item} onAddToCart={addToCart} isDark={isDark} />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <StatsSection isDark={isDark} />

      {/* How it works */}
      <HowItWorks isDark={isDark} setPage={setPage} />

      {/* Why Steamy Bites */}
      <section
        style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.025)", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}
        className="why-us-bg py-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.div variants={fadeUp} className="section-tag mx-auto w-fit mb-4">
              <ChefHat className="w-3.5 h-3.5" /> Our Promise
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ color: t.text }} className="text-3xl font-black">
              Why Steamy Bites?
            </motion.h2>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "30-Min Delivery", desc: "Hot food, always on time. We guarantee it.", icon: Clock, color: "#FF8C00" },
              { label: "Farm Fresh", desc: "Quality-checked every morning, no compromises.", icon: Leaf, color: "#22c55e" },
              { label: "Best Prices", desc: "Great food at honest, fair prices.", icon: BadgePercent, color: "#F59E0B" },
              { label: "Live Tracking", desc: "Know exactly where your order is.", icon: MapPin, color: "#0EA5E9" },
            ].map(({ label, desc, icon: Icon, color }) => (
              <motion.div
                key={label}
                variants={cardAnim}
                whileHover={{ y: -8 }}
                style={{ background: t.card, border: `1px solid ${t.border}` }}
                className="feature-card rounded-2xl p-5 text-center"
              >
                <div
                  style={{ background: `${color}18` }}
                  className="feature-icon w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h4 style={{ color: t.text }} className="font-black mb-1">{label}</h4>
                <p style={{ color: t.faint }} className="text-sm">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection isDark={isDark} />

      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="max-w-2xl mx-auto"
        >
          <div className="section-tag mx-auto w-fit mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Special Offer
          </div>
          <h2 style={{ color: t.text }} className="text-4xl sm:text-5xl font-black mb-4">
            Ready to order?<br />
            <span className="gradient-text-hero">We're always ready.</span>
          </h2>
          <p style={{ color: t.muted }} className="text-base mb-8 max-w-sm mx-auto">
            Get 10% off your first order. Use code <span className="text-orange-500 font-bold">FIRST50</span> at checkout.
          </p>
          <motion.button
            onClick={() => setPage("menu")}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="hero-cta inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-2xl shadow-orange-500/35 text-lg"
          >
            Order Now <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer isDark={isDark} setPage={setPage} />
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? themes.dark : themes.light;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      style={{ background: t.bg, minHeight: "100vh", fontFamily: "'Poppins', 'Inter', system-ui, sans-serif" }}
    >
      {/* Sonner Toast System */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        toastOptions={{
          style: {
            background: isDark ? "#1a1a22" : "#ffffff",
            border: `1px solid ${t.border}`,
            color: t.text,
            fontFamily: "'Poppins', system-ui, sans-serif",
          },
        }}
      />

      <Navbar
        cartCount={cartCount}
        setPage={setPage}
        page={page}
        setCartOpen={setCartOpen}
        user={user}
        setUser={setUser}
        isDark={isDark}
        toggleTheme={() => setIsDark(d => !d)}
      />

      <AnimatePresence mode="wait">
        {page === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <HomePage setPage={setPage} setCart={setCart} isDark={isDark} />
          </motion.div>
        )}
        {page === "menu" && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <MenuPage setCart={setCart} isDark={isDark} />
          </motion.div>
        )}
        {page === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <OrdersPage isDark={isDark} />
          </motion.div>
        )}
        {page === "auth" && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <AuthPage setUser={setUser} setPage={setPage} isDark={isDark} />
          </motion.div>
        )}
      </AnimatePresence>

      <CartModal
        cart={cart}
        setCart={setCart}
        open={cartOpen}
        setOpen={setCartOpen}
        setPage={setPage}
        isDark={isDark}
        user={user}
      />
    </div>
  );
}
