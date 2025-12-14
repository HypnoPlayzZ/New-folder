import React from 'react';

export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;600&display=swap');
    
    :root {
        --bg-light-start: #f8f9fb;
        --bg-light-end: #e8f0ff;
        --bg-card: #ffffff;
        --text-dark: #1b1f24;
        --text-muted: #5c6b7a;
        --primary-accent: #ff6b00;
        --primary-hover: #e15d00;
        --surface-strong: rgba(255, 255, 255, 0.9);
        --surface-soft: #f9fafb;
        --border-subtle: #e5e7eb;
        --shadow-soft: 0 10px 40px rgba(0,0,0,0.08);
    }

    :root[data-theme='dark'] {
        --bg-light-start: #0b1320;
        --bg-light-end: #132036;
        --bg-card: #16243a;
        --text-dark: #eaf2ff;
        --text-muted: #a6b3c5;
        --primary-accent: #ff9e3d;
        --primary-hover: #ffb369;
        --surface-strong: rgba(19, 32, 54, 0.92);
        --surface-soft: #1b2a41;
        --border-subtle: #24354f;
        --shadow-soft: 0 10px 40px rgba(0,0,0,0.5);
    }

    body { 
        font-family: 'Poppins', sans-serif; 
        background: linear-gradient(to right, var(--bg-light-start), var(--bg-light-end));
        color: var(--text-dark);
    }

    /* Animations */
    @keyframes fadeIn { 
        from { opacity: 0; transform: translateY(20px); } 
        to { opacity: 1; transform: translateY(0); } 
    }
    
    @keyframes pulse-orange {
        0% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(255, 140, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0); }
    }

    .fade-in { 
        animation: fadeIn 0.6s ease-in-out forwards; 
    }

    /* Header & Navigation */
    .navbar {
        background-color: var(--surface-strong) !important;
        backdrop-filter: blur(10px);
        color: var(--text-dark);
    }
    .navbar-brand .fw-bold { 
        color: var(--primary-accent); 
        font-family: 'Playfair Display', serif;
    }

    .nav-link {
        color: var(--text-dark) !important;
        transition: color 0.3s ease;
    }
    .nav-link:hover, .nav-link.active { 
        color: var(--primary-accent) !important; 
    }

    /* Buttons */
    .btn-danger, .btn-primary {
        background-color: var(--primary-accent);
        border: none;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }
    .btn-danger:hover, .btn-primary:hover {
        background-color: var(--primary-hover);
        transform: scale(1.05);
        animation: pulse-orange 1.5s infinite;
    }
     .btn-outline-danger {
        color: var(--primary-accent);
        border-color: var(--primary-accent);
         transition: all 0.3s ease;
    }
    .btn-outline-danger:hover {
        background-color: var(--primary-accent);
        color: #ffffff;
        border-color: var(--primary-accent);
    }

    /* Hero Section */
    .hero-section { 
        background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop') no-repeat center center; 
        background-size: cover; 
        color: white; 
        padding: 8rem 0; 
        margin-bottom: 4rem; 
        border-radius: 1.5rem; 
        animation: fadeIn 1s ease-in-out; 
    }
    
    .hero-section h1 { 
        font-family: 'Playfair Display', serif;
        font-weight: 700; 
        font-size: 4rem; 
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    /* --- Menu List Styles --- */
    .menu-list-container {
        background-color: var(--surface-strong);
        padding: 2rem 3rem;
        border-radius: 1rem;
        box-shadow: var(--shadow-soft);
    }
    .menu-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background-color: var(--surface-soft);
        border: 1px solid var(--border-subtle);
        animation: fadeIn 0.5s ease-in-out forwards;
        transition: all 0.3s ease-in-out;
        border-radius: 0.75rem;
    }
    .menu-list-item:hover {
        transform: scale(1.03);
        background-color: var(--surface-soft);
        box-shadow: var(--shadow-soft);
    }
    .menu-list-item:last-child {
        border-bottom: none;
    }
    .menu-item-details {
        flex: 1;
        padding-right: 2rem;
    }
    .item-name {
        font-weight: 600;
        color: var(--text-dark);
        font-size: 1.1rem;
    }
    .item-price {
        color: var(--text-muted);
        margin-bottom: 0.5rem;
    }
    .item-description {
        color: var(--text-muted);
        font-size: 0.9rem;
    }
    .menu-item-action {
        width: 150px;
        margin-left: 2rem;
        text-align: center;
    }
    .menu-item-image-container {
        position: relative;
    }
    .menu-item-image-container img {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 0.5rem;
        transition: transform 0.3s ease;
    }
     .menu-list-item:hover .menu-item-image-container img {
        transform: scale(1.1);
    }
    .add-button-container {
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
    }
    .add-button-container .btn {
        background-color: #fff;
        color: var(--primary-accent);
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    }
    .add-button-container .btn:hover {
        transform: scale(1.1) rotate(5deg);
        background-color: var(--primary-accent);
        color: #fff;
    }

    /* --- New, Attractive Coupon Styles --- */
    .coupon-section {
        animation: fadeIn 1s ease-in-out 0.5s;
        animation-fill-mode: both;
    }
    .coupon-scroll-container {
        display: flex;
        overflow-x: auto;
        gap: 1.5rem;
        padding: 1rem;
        scrollbar-width: thin;
        scrollbar-color: var(--primary-accent) #fff;
    }
    .coupon-card {
        flex: 0 0 280px;
        padding: 1.5rem;
        border-radius: 1rem;
        background: var(--bg-card);
        color: var(--text-dark);
        text-align: center;
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        cursor: pointer;
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-soft);
    }
    .coupon-card:hover {
        transform: translateY(-8px) scale(1.03);
        box-shadow: 0 15px 30px rgba(0,0,0,0.25);
        border-color: var(--primary-accent);
    }
    /* Creates the "ticket" cutout effect */
    .coupon-card::before, .coupon-card::after {
        content: '';
        position: absolute;
        width: 30px;
        height: 30px;
        background: var(--surface-soft);
        border-radius: 50%;
    }
    .coupon-card::before {
        top: 50%;
        left: -15px;
        transform: translateY(-50%);
    }
    .coupon-card::after {
        top: 50%;
        right: -15px;
        transform: translateY(-50%);
    }
    .coupon-code {
        font-weight: 700;
        font-family: 'Playfair Display', serif;
        margin-bottom: 0.5rem;
        font-size: 1.25rem;
        border: 2px dashed rgba(255, 107, 0, 0.35);
        padding: 0.5rem;
        border-radius: 0.5rem;
        color: var(--text-dark);
    }
    .coupon-description {
        font-size: 0.9rem;
        opacity: 0.8;
        color: var(--text-muted);
    }

    /* Category nav buttons */
    .category-nav {
        position: sticky;
        top: 72px;
        z-index: 10;
        padding: 0.35rem 0.5rem;
        background: linear-gradient(90deg, rgba(255,255,255,0.65), rgba(255,255,255,0.4));
        backdrop-filter: blur(10px);
        border-radius: 14px;
        margin-bottom: 1rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    }
    :root[data-theme='dark'] .category-nav {
        background: linear-gradient(90deg, rgba(22,36,58,0.9), rgba(17,30,48,0.82));
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .category-nav-inner {
        display: flex;
        gap: 0.6rem;
        overflow-x: auto;
        padding: 0.1rem;
        scrollbar-width: thin;
    }
    .category-nav-button {
        border: 1px solid var(--border-subtle);
        background: var(--bg-card);
        color: var(--text-dark);
        padding: 0.55rem 1.1rem;
        border-radius: 999px;
        font-weight: 600;
        letter-spacing: 0.01em;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
        white-space: nowrap;
    }
    .category-nav-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        border-color: var(--primary-accent);
    }
    .category-nav-button.active {
        background: linear-gradient(120deg, var(--primary-accent), var(--primary-hover));
        color: #fff;
        border-color: transparent;
        box-shadow: 0 12px 30px rgba(255,107,0,0.25);
        transform: translateY(-1px);
    }
    .category-nav-button:active {
        transform: translateY(0);
        box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }

    /* Glass overlay for logged-in welcome */
    .glass-overlay {
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at 20% 20%, rgba(255,107,0,0.12), transparent 40%),
                    radial-gradient(circle at 80% 80%, rgba(0,150,255,0.12), transparent 40%),
                    rgba(5,10,20,0.75);
        backdrop-filter: blur(16px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        z-index: 1300;
        animation: overlay-fade-in 0.5s ease;
    }
    @keyframes overlay-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .glass-card {
        position: relative;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        border: none;
        box-shadow: none;
        backdrop-filter: blur(24px);
        border-radius: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-dark);
        overflow: hidden;
    }
    .promo-bubble-container {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
        0%, 100% { transform: translate(-50%, 0); }
        50% { transform: translate(-50%, -20px); }
    }
    .promo-bubble {
        position: relative;
        padding: 2rem 3.5rem;
        background: linear-gradient(135deg, rgba(255,107,0,0.95), rgba(255,158,61,0.9));
        border-radius: 50px;
        box-shadow: 0 20px 60px rgba(255,107,0,0.5),
                    0 0 80px rgba(255,158,61,0.3),
                    inset 0 -2px 20px rgba(255,255,255,0.3);
        animation: pulse-glow 2s ease-in-out infinite;
        border: 3px solid rgba(255,255,255,0.4);
    }
    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 20px 60px rgba(255,107,0,0.5), 0 0 80px rgba(255,158,61,0.3), inset 0 -2px 20px rgba(255,255,255,0.3); }
        50% { box-shadow: 0 25px 80px rgba(255,107,0,0.7), 0 0 120px rgba(255,158,61,0.5), inset 0 -2px 20px rgba(255,255,255,0.4); }
    }
    .promo-bubble-text {
        font-size: clamp(1.25rem, 3vw, 2rem);
        font-weight: 800;
        color: #fff;
        text-align: center;
        text-shadow: 0 4px 20px rgba(0,0,0,0.4),
                     0 2px 8px rgba(0,0,0,0.3);
        letter-spacing: 0.5px;
        line-height: 1.3;
        text-transform: uppercase;
    }
    .overlay-content {
        display: flex;
        gap: 4rem;
        align-items: center;
        justify-content: center;
        max-width: 1400px;
        padding: 2rem;
        margin-top: 8rem;
        flex-wrap: wrap;
    }
    .overlay-main {
        flex: 1;
        min-width: 300px;
        text-align: center;
    }
    .overlay-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(2.5rem, 5vw, 4rem);
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 1rem;
        color: #fff;
        text-shadow: 0 6px 30px rgba(0,0,0,0.5);
    }
    .overlay-subtitle {
        font-size: clamp(1.1rem, 2.5vw, 1.6rem);
        line-height: 1.6;
        color: rgba(255,255,255,0.85);
        text-shadow: 0 3px 15px rgba(0,0,0,0.4);
        margin-bottom: 0;
    }
    .reviews-panel {
        flex: 1;
        min-width: 340px;
        max-width: 420px;
    }
    .reviews-title {
        font-weight: 700;
        font-size: clamp(1.1rem, 2vw, 1.4rem);
        margin-bottom: 1rem;
        color: #fff;
        text-shadow: 0 3px 15px rgba(0,0,0,0.4);
        text-align: center;
    }
    .reviews-window {
        height: 400px;
        overflow: hidden;
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.3));
        padding: 1rem;
        position: relative;
        backdrop-filter: blur(12px);
        box-shadow: 0 15px 50px rgba(0,0,0,0.4),
                    inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .reviews-track {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        animation: reviews-scroll 25s linear infinite;
    }
    .reviews-track:hover {
        animation-play-state: paused;
    }
    .review-item {
        padding: 1.1rem 1.3rem;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
        color: #fff;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.15);
        transition: transform 0.2s ease;
    }
    .review-item:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08));
    }
    .review-rating {
        font-size: 1.1rem;
        letter-spacing: 2px;
        margin-bottom: 8px;
        color: #ffd700;
        text-shadow: 0 2px 8px rgba(255,215,0,0.5);
    }
    .review-text {
        font-size: 1.05rem;
        line-height: 1.6;
        margin-bottom: 8px;
        font-style: italic;
    }
    .review-name {
        font-size: 0.95rem;
        color: rgba(255,255,255,0.65);
        font-weight: 600;
        text-align: right;
    }
    @keyframes reviews-scroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(-50%); }
    }
    .overlay-close {
        position: absolute;
        top: 2rem;
        right: 2rem;
        background: rgba(255,255,255,0.12);
        color: #fff;
        border: none;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 1.75rem;
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;
        backdrop-filter: blur(8px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    .overlay-close:hover {
        transform: scale(1.1);
        background: rgba(255,255,255,0.2);
    }
    .coupon-input-group {
        display: flex;
        gap: 0.5rem;
    }

    /* Forms and Modals */
    .card, .modal-content {
        background-color: var(--bg-card);
        color: var(--text-dark);
        border: none;
        box-shadow: var(--shadow-soft);
    }
    .form-control {
        background-color: var(--surface-soft);
        border-color: var(--border-subtle);
        color: var(--text-dark);
    }
    .form-control:focus {
        background-color: var(--bg-card);
        border-color: var(--primary-accent);
        color: var(--text-dark);
        box-shadow: 0 0 0 0.25rem rgba(255, 140, 0, 0.25);
    }

    .list-group-item {
        background-color: transparent;
        border-color: var(--border-subtle);
    }

    .nav-tabs .nav-link.active { 
        background-color: var(--bg-card);
        color: var(--primary-accent); 
        border-color: var(--border-subtle) var(--border-subtle) var(--bg-card); 
    }

    footer {
        background-color: var(--bg-card) !important;
        color: var(--text-muted);
    }
    /* Server wake-up toast */
    .server-toast {
        position: fixed;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        z-index: 2000;
        pointer-events: none;
        animation: overlay-fade-in 0.25s ease;
    }
    .server-toast-inner {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: rgba(20, 28, 40, 0.85);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 14px;
        padding: 0.75rem 1rem;
        box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        backdrop-filter: blur(8px);
    }
    :root[data-theme='light'] .server-toast-inner {
        background: rgba(255,255,255,0.9);
        color: #111827;
        border-color: rgba(0,0,0,0.08);
    }
    .server-toast-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ff9e3d;
        animation: pulse-dot 1s ease-in-out infinite;
        box-shadow: 0 0 0 0 rgba(255,158,61,0.6);
    }
    @keyframes pulse-dot {
        0% { box-shadow: 0 0 0 0 rgba(255,158,61,0.6); }
        70% { box-shadow: 0 0 0 10px rgba(255,158,61,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,158,61,0); }
    }

    footer a {
        color: var(--primary-accent) !important;
    }

    /* Home Page Styles */
    .home-page {
        min-height: calc(100vh - 200px);
        padding: 0;
        margin: -2rem -15px 0;
    }
    .home-hero {
        display: grid;
        grid-template-columns: 1fr 0.9fr;
        gap: 3rem;
        align-items: center;
        padding: 5rem 4rem;
        max-width: 1600px;
        margin: 0 auto;
        background: linear-gradient(135deg, 
            var(--bg-light-start) 0%, 
            var(--bg-light-end) 50%,
            var(--bg-light-start) 100%);
        position: relative;
        overflow: hidden;
    }
    .home-hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -20%;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(255,107,0,0.15), transparent 70%);
        border-radius: 50%;
        animation: float 8s ease-in-out infinite;
    }
    .hero-content {
        position: relative;
        z-index: 2;
        text-align: left;
        max-width: 650px;
        padding-right: 2rem;
    }
    .hero-badge {
        display: inline-block;
        padding: 0.5rem 1.5rem;
        background: linear-gradient(120deg, #ffd700, #ffed4e);
        color: #000;
        font-weight: 700;
        border-radius: 50px;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        animation: pulse-orange 2s infinite;
    }
    .hero-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(3rem, 6vw, 4.5rem);
        font-weight: 700;
        color: var(--primary-accent);
        margin-bottom: 1.2rem;
        line-height: 1.15;
        text-shadow: 2px 4px 8px rgba(0,0,0,0.1);
        letter-spacing: -0.5px;
    }
    .hero-subtitle {
        font-size: clamp(1.15rem, 2vw, 1.5rem);
        color: var(--text-muted);
        margin-bottom: 2.5rem;
        font-weight: 400;
        line-height: 1.6;
    }
    .promo-banner {
        background: linear-gradient(120deg, rgba(255,107,0,0.95), rgba(255,158,61,0.9));
        padding: 1.75rem 2.5rem;
        border-radius: 20px;
        margin-bottom: 3rem;
        box-shadow: 0 15px 50px rgba(255,107,0,0.3);
        animation: pulse-glow 2s ease-in-out infinite;
        max-width: 600px;
    }
    .promo-text {
        font-size: clamp(1.2rem, 2.5vw, 1.8rem);
        font-weight: 700;
        color: #fff;
        text-align: center;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        letter-spacing: 0.5px;
    }
    .order-now-btn {
        padding: 1rem 3rem !important;
        font-size: 1.3rem !important;
        font-weight: 700 !important;
        border-radius: 50px !important;
        background: linear-gradient(120deg, #dc3545, #c82333) !important;
        border: none !important;
        box-shadow: 0 10px 30px rgba(220, 53, 69, 0.4) !important;
        transition: all 0.3s ease !important;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .order-now-btn:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 15px 40px rgba(220, 53, 69, 0.5) !important;
        background: linear-gradient(120deg, #c82333, #dc3545) !important;
    }
    .hero-image-container {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 100%;
        margin: 0;
    }
    .image-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,107,0,0.3), transparent 70%);
        border-radius: 50%;
        animation: pulse 3s ease-in-out infinite;
        z-index: 0;
    }
    @keyframes pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
    }
    .hero-image {
        width: 100%;
        max-width: 550px;
        height: auto;
        border-radius: 30px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.25);
        position: relative;
        z-index: 1;
        animation: float 6s ease-in-out infinite;
        display: block;
        object-fit: cover;
    }
    .home-reviews-section {
        padding: 5rem 4rem;
        background: var(--bg-card);
        position: relative;
        z-index: 10;
        overflow: hidden;
        max-width: 1600px;
        margin: 0 auto;
    }
    .reviews-section-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 700;
        text-align: center;
        color: var(--text-dark);
        margin-bottom: 3rem;
    }
    .reviews-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }
    .reviews-column {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        animation: scroll-up 30s linear infinite;
    }
    .reviews-column:nth-child(2) {
        animation: scroll-down 30s linear infinite;
    }
    @keyframes scroll-up {
        0% { transform: translateY(0); }
        100% { transform: translateY(-50%); }
    }
    @keyframes scroll-down {
        0% { transform: translateY(-50%); }
        100% { transform: translateY(0); }
    }
    .home-review-card {
        background: linear-gradient(135deg, var(--surface-soft), var(--bg-card));
        padding: 1.5rem;
        border-radius: 16px;
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-soft);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .home-review-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 50px rgba(0,0,0,0.15);
    }
    .home-review-rating {
        font-size: 1.2rem;
        letter-spacing: 2px;
        margin-bottom: 0.75rem;
        color: #ffd700;
        text-shadow: 0 2px 8px rgba(255,215,0,0.3);
    }
    .home-review-text {
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--text-dark);
        margin-bottom: 0.75rem;
        font-style: italic;
    }
    .home-review-name {
        font-size: 0.95rem;
        color: var(--text-muted);
        font-weight: 600;
        text-align: right;
    }

    @media (max-width: 992px) {
        .home-hero {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding: 3rem 2rem;
        }
        .hero-content {
            text-align: center;
            max-width: 100%;
            padding-right: 0;
        }
        .hero-badge {
            margin-left: auto;
            margin-right: auto;
        }
        .promo-banner {
            max-width: 100%;
        }
        .hero-image-container {
            justify-content: center;
        }
        .hero-image {
            max-width: 450px;
        }
        .reviews-grid {
            grid-template-columns: 1fr;
        }
        .reviews-column:nth-child(2) {
            animation: scroll-up 30s linear infinite;
        }
        .home-reviews-section {
            padding: 3rem 2rem;
        }
    }
  `}</style>
);

