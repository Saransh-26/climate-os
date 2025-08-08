import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import PromotionalVideo from './PromotionalVideo';

// LoginModal Component (Inline to avoid import issues)
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      onLogin({
        email: formData.email,
        name: formData.email.split('@')[0]
      });
      
      setFormData({ email: '', password: '', confirmPassword: '' });
      onClose();
    } else {
      setErrors(newErrors);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
          <button className="login-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="login-modal-body">
          <div className="login-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="login-form-input"
            />
            {errors.email && <div className="login-error-message">{errors.email}</div>}
          </div>
          
          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="login-form-input"
            />
            {errors.password && <div className="login-error-message">{errors.password}</div>}
          </div>
          
          {!isLoginMode && (
            <div className="login-form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="login-form-input"
              />
              {errors.confirmPassword && <div className="login-error-message">{errors.confirmPassword}</div>}
            </div>
          )}
          
          <button className="login-submit-button" onClick={handleSubmit}>
            {isLoginMode ? 'Login' : 'Sign Up'}
          </button>
        </div>
        
        <div className="login-modal-footer">
          <p>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button className="login-toggle-button" onClick={toggleMode}>
              {isLoginMode ? 'Sign Up' : 'Login'}
            </button>
          </p>
          
          {isLoginMode && (
            <button className="login-forgot-password">Forgot Password?</button>
          )}
        </div>
      </div>
    </div>
  );
};

// Updated Header Component with Login Functionality
const Header = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('climateos_user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('climateos_user');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('climateos_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <>
            <header className="header">
                <div className="container navbar">
                    <div className="nav-logo">ClimateOS</div>
                    <ul className="nav-menu">
                        <li><Link to="/business-calculator">For Businesses</Link></li>
                        <li><Link to="/individual-calculator">For Individuals</Link></li>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#resources">Resources</a></li>
                        <li><a href="#contact">Contact Us</a></li>
                    </ul>
                    <div className="nav-cta">
                        {user ? (
                            <div className="user-info">
                                <span>Welcome, {user.name}!</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <a href="#login" onClick={(e) => {
                                e.preventDefault();
                                setIsModalOpen(true);
                            }}>
                                Login/Sign Up
                            </a>
                        )}
                    </div>
                </div>
            </header>
            
            <LoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLogin={handleLogin}
            />
        </>
    );
};

// Hero Component (No changes needed)
const Hero = () => (
    <section className="hero">
        <div className="container">
            <h1>ClimateOS: Your Operating System for a Greener India</h1>
            <p>Empowering businesses and individuals to accurately track, manage, and reduce their carbon footprint.</p>
            <div className="hero-cta-buttons">
                <Link to="/business-calculator" className="btn">For Businesses</Link>
                <Link to="/individual-calculator" className="btn">For Individuals</Link>
            </div>
        </div>
    </section>
);

// Offerings Component (No changes needed)
const Offerings = () => (
    <section id="offerings" className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
            <div className="offerings-grid">
                <div id="b2b" className="offering-card">
                    <h3>For Businesses</h3>
                    <p>Master your corporate footprint with our integrated platform. We offer automated GHG inventory, seamless BRSR compliance, and robust Scope 3 value chain management.</p>
                    <Link to="/business-calculator" className="btn">Explore B2B Solutions</Link>
                </div>
                <div id="b2c" className="offering-card">
                    <h3>For Individuals</h3>
                    <p>Transform your personal impact with our beautifully designed app. Enjoy personal carbon tracking, tailored recommendations, and engaging gamification.</p>
                    <Link to="/individual-calculator" className="btn">Discover the App</Link>
                </div>
            </div>
        </div>
    </section>
);

const DataInsights = () => (
    <section id="data-insights" className="section">
        <div className="container">
            <h5 className="section-title">Data-Driven Insights: The Engine of Change</h5>
            <div className="insights-grid">
                <div className="insight-card">
                    <h4> India's National Grid Factor</h4>
                    <div className="data-point">0.757 kg CO2e/kWh</div>
                    <p>Using the latest Central Electricity Authority (CEA) data for precise Scope 2 emission calculations.</p>
                </div>
                <div className="insight-card">
                    <h4> Transportation (Petrol Car)</h4>
                    <div className="data-point">2.31 kg CO2e/litre</div>
                    <p>We use localized, fuel-based factors for accurate transportation footprint analysis.</p>
                </div>
                 <div className="insight-card">
                    <h4> Steel Industry Benchmark</h4>
                    <div className="data-point">~2.5 T CO2/TCS</div>
                    <p>Sector-specific benchmarks for heavy industries, reflecting the 2020 average.</p>
                </div>
                <div className="insight-card">
                    <h4> Cement Industry Benchmark</h4>
                    <div className="data-point">~0.6 tCO2/tonne</div>
                    <p>Accounting for calcination process emissions, a key factor in industrial footprinting.</p>
                </div>
            </div>
        </div>
    </section>
);

const Testimonials = () => (
    <section className="section">
        <div className="container">
            <h2 className="section-title">Trusted by Leaders</h2>
            <div className="testimonial">
                <p>"ClimateOS has transformed our approach to BRSR compliance. The accuracy and ease of use are unparalleled in the Indian market."</p>
                <span className="testimonial-author">- Sustainability Head, Placeholder Corp</span>
            </div>
            <div className="logos">
                <img src="https://via.placeholder.com/150x40?text=Partner+1" alt="Partner Logo 1" />
                <img src="https://via.placeholder.com/150x40?text=Partner+2" alt="Partner Logo 2" />
                <img src="https://via.placeholder.com/150x40?text=Partner+3" alt="Partner Logo 3" />
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="footer">
        <div className="container footer-grid">
            <div className="footer-col">
                <h4>ClimateOS</h4>
                <p>Your Operating System for a Greener India.</p>
                <p>&copy; 2025 ClimateOS. All Rights Reserved.</p>
            </div>
            <div className="footer-col">
                <h4>Solutions</h4>
                <Link to="/business-calculator">For Businesses</Link>
                <Link to="/individual-calculator">For Individuals</Link>
            </div>
            <div className="footer-col">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#data-insights">Our Data & Methodology</a>
            </div>
            <div className="footer-col">
                <h4>Connect</h4>
                <p>Email: contact@climateos.in</p>
                <p>Phone: +91-1234567890</p>
            </div>
        </div>
    </footer>
);

// Main HomePage Component
const HomePage = () => {
    return (
        <div className="homepage-container">
            <Header />
            <main>
                <Hero />
                <PromotionalVideo />
                <Offerings />
                <DataInsights />
                <Testimonials />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;