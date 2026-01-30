import React from 'react';
import { Button } from 'react-bootstrap';

const HomePage = () => {
  const reviews = [
    { name: 'Ananya', text: 'Super quick delivery and piping hot momos!', rating: '★★★★★' },
    { name: 'Rohit', text: 'Loved the spicy chutney. Ordering again tonight.', rating: '★★★★☆' },
    { name: 'Priya', text: 'Free delivery made my day. Great portions too.', rating: '★★★★★' },
    { name: 'Kabir', text: 'Soft inside, crispy outside. Perfect!', rating: '★★★★☆' },
    { name: 'Meera', text: 'Best momos in town! Fresh and delicious.', rating: '★★★★★' },
    { name: 'Sanjay', text: 'The garlic sauce is addictive. Must try!', rating: '★★★★★' },
    { name: 'Nikita', text: 'Generous portions, fair prices. Love it!', rating: '★★★★☆' },
    { name: 'Arjun', text: 'Delivery in 15 minutes! Amazing service.', rating: '★★★★★' },
    { name: 'Ananya', text: 'Super quick delivery and piping hot momos!', rating: '★★★★★' },
    { name: 'Rohit', text: 'Loved the spicy chutney. Ordering again tonight.', rating: '★★★★☆' },
    { name: 'Priya', text: 'Free delivery made my day. Great portions too.', rating: '★★★★★' },
    { name: 'Kabir', text: 'Soft inside, crispy outside. Perfect!', rating: '★★★★☆' },
  ];

  const handleOrderNow = () => {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    if (!isLoggedIn) {
      alert('You need to login before ordering');
      window.location.hash = '#/login';
      return;
    }
    window.location.hash = '#/menu';
  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">🎉 Special Offer 🎉</div>
          <h1 className="hero-title">Steamy Bites</h1>
          <p className="hero-subtitle">Delicious Momos Delivered Fresh & Hot</p>
          
          <div className="promo-banner">
            <div className="promo-text">
              🚚 Free Home Delivery + 10% Instant Discount
            </div>
          </div>

          <Button 
            variant="danger" 
            size="lg" 
            className="order-now-btn"
            onClick={handleOrderNow}
          >
            Order Now
          </Button>
        </div>

        <div className="hero-image-container">
          <div className="image-glow"></div>
          <img 
            src="https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop" 
            alt="Delicious momos" 
            className="hero-image"
          />
        </div>
      </div>

      <div className="home-reviews-section">
        <h2 className="reviews-section-title">What Customers say</h2>

        <div className="reviews-grid">
          <div className="reviews-column">
            {reviews.slice(0, 6).map((rev, idx) => (
              <div key={idx} className="home-review-card">
                <div className="home-review-rating">{rev.rating}</div>
                <div className="home-review-text">"{rev.text}"</div>
                <div className="home-review-name">— {rev.name}</div>
              </div>
            ))}
          </div>
          <div className="reviews-column">
            {reviews.slice(6, 12).map((rev, idx) => (
              <div key={idx} className="home-review-card">
                <div className="home-review-rating">{rev.rating}</div>
                <div className="home-review-text">"{rev.text}"</div>
                <div className="home-review-name">— {rev.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
