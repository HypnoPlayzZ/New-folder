import React from 'react';

export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Saira:wght@300;400;500;600;700;800&display=swap');

    :root {
        /* Steamy Bites brand — warm cream ground, deep momo-green accent */
        --bg-light-start: #f7eedd;
        --bg-light-end:   #ede4d1;
        --bg-card:        #ffffff;
        --text-dark:      #2b2620;   /* matches the logo outline ink */
        --text-muted:     #7a7266;
        --primary-accent: #1e4636;   /* momo green */
        --primary-hover:  #2f6f52;
    }

    body {
        font-family: 'Saira', system-ui, sans-serif;
        background: linear-gradient(to right, var(--bg-light-start), var(--bg-light-end));
        color: var(--text-dark);
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: 'Saira', system-ui, sans-serif;
        font-weight: 600;
        color: var(--text-dark);
    }

    /* Brand wordmark — Anton, matching the site logo */
    .sb-brand-word {
        font-family: 'Anton', sans-serif;
        letter-spacing: 0.04em;
        color: var(--primary-accent);
        line-height: 1;
    }
    .sb-brand-logo { display: block; }

    /* Animations */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-green {
        0% { box-shadow: 0 0 0 0 rgba(30, 70, 54, 0.6); }
        70% { box-shadow: 0 0 0 10px rgba(30, 70, 54, 0); }
        100% { box-shadow: 0 0 0 0 rgba(30, 70, 54, 0); }
    }
    .fade-in { animation: fadeIn 0.6s ease-in-out forwards; }

    /* Header & Navigation */
    .navbar {
        background-color: rgba(255, 255, 255, 0.8) !important;
        backdrop-filter: blur(10px);
    }
    .navbar-brand .fw-bold {
        color: var(--primary-accent);
        font-family: 'Anton', sans-serif;
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
        animation: pulse-green 1.5s infinite;
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
        font-family: 'Anton', sans-serif;
        font-weight: 400;
        font-size: 4rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    /* --- Menu List Styles --- */
    .menu-list-container {
        background-color: var(--bg-card);
        padding: 2rem 3rem;
        border-radius: 1rem;
        box-shadow: 0 10px 40px rgba(43, 38, 32, 0.08);
    }
    .menu-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e7e0d3;
        animation: fadeIn 0.5s ease-in-out forwards;
        transition: all 0.3s ease-in-out;
        border-radius: 0.75rem;
    }
    .menu-list-item:hover {
        transform: scale(1.03);
        background-color: #f7eedd;
        box-shadow: 0 8px 25px rgba(43, 38, 32, 0.1);
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
        box-shadow: 0 4px 15px rgba(43, 38, 32, 0.2);
        transition: all 0.3s ease;
    }
    .add-button-container .btn:hover {
        transform: scale(1.1) rotate(5deg);
        background-color: var(--primary-accent);
        color: #fff;
    }

    /* --- Coupon Styles --- */
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
        background: var(--primary-accent);
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
    }
    .coupon-card:hover {
        transform: translateY(-10px) scale(1.05);
        box-shadow: 0 15px 30px rgba(30, 70, 54, 0.4);
    }
    .coupon-card::before, .coupon-card::after {
        content: '';
        position: absolute;
        width: 30px;
        height: 30px;
        background: var(--bg-light-end);
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
        font-weight: 400;
        font-family: 'Anton', sans-serif;
        letter-spacing: 0.03em;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
        border: 2px dashed rgba(255,255,255,0.7);
        padding: 0.5rem;
        border-radius: 0.5rem;
    }
    .coupon-description {
        font-size: 0.9rem;
        opacity: 0.9;
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
    }
    .form-control {
        background-color: #faf8f2;
        border-color: #e7e0d3;
        color: var(--text-dark);
    }
    .form-control:focus {
        background-color: #fff;
        border-color: var(--primary-accent);
        color: var(--text-dark);
        box-shadow: 0 0 0 0.25rem rgba(30, 70, 54, 0.22);
    }

    .list-group-item {
        background-color: transparent;
        border-color: #e7e0d3;
    }

    .nav-tabs .nav-link.active {
        background-color: var(--bg-card);
        color: var(--primary-accent);
        border-color: #e7e0d3 #e7e0d3 var(--bg-card);
    }

    /* Bootstrap primary badges → brand green (Razorpay/UPI tags etc.) */
    .badge.bg-primary { background-color: var(--primary-accent) !important; }

    footer {
        background-color: var(--bg-card) !important;
    }
    footer a {
        color: var(--primary-accent) !important;
    }
  `}</style>
);
