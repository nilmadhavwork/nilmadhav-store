import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse active route & query parameters accurately
  const searchParams = new URLSearchParams(location.search);
  const currentFabric = searchParams.get('fabric');
  const currentOccasion = searchParams.get('occasion');

  const isHomeActive = location.pathname === '/';
  const isAllCollectionsActive =
    location.pathname === '/products' &&
    !currentFabric &&
    !currentOccasion;
  const isBanarasiActive = location.pathname === '/products' && currentFabric === 'Banarasi';
  const isKanjivaramActive = location.pathname === '/products' && currentFabric === 'Kanjivaram';
  const isChanderiActive = location.pathname === '/products' && currentFabric === 'Chanderi';
  const isBridalActive = location.pathname === '/products' && currentOccasion === 'Bridal';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Top Heritage Announcement Banner */}
      <div className="announcement-bar">
        Complimentary Pan-India Shipping on Orders Above ₹2,000 • 100% Handcrafted Authenticity
      </div>

      <header className="navbar">
        <div className="navbar-inner container">
          {/* Mobile Menu Button */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Luxury Brand Logo */}
          <Link to="/" className="brand-logo">
            <span className="brand-name">Nilmadhav</span>
            <span className="brand-tagline">Heritage Sarees & Silks</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links">
            <Link to="/" className={`nav-link ${isHomeActive ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/products" className={`nav-link ${isAllCollectionsActive ? 'active' : ''}`}>
              All Collections
            </Link>
            <Link to="/products?fabric=Banarasi" className={`nav-link ${isBanarasiActive ? 'active' : ''}`}>
              Banarasi
            </Link>
            <Link to="/products?fabric=Kanjivaram" className={`nav-link ${isKanjivaramActive ? 'active' : ''}`}>
              Kanjivaram
            </Link>
            <Link to="/products?fabric=Chanderi" className={`nav-link ${isChanderiActive ? 'active' : ''}`}>
              Chanderi
            </Link>
            <Link to="/products?occasion=Bridal" className={`nav-link ${isBridalActive ? 'active' : ''}`}>
              Bridal Edit
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="nav-actions">
            {/* Search Trigger */}
            <button
              className="nav-action-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search sarees"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="nav-action-btn" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="nav-badge-count">{wishlistCount}</span>}
            </Link>

            {/* Shopping Bag / Cart Link */}
            <Link to="/cart" className="nav-action-btn" aria-label="Shopping Bag">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="nav-badge-count">{cartCount}</span>}
            </Link>

            {/* Account / User Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              {isAuthenticated ? (
                <>
                  <button
                    className="nav-action-btn"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Account menu"
                  >
                    <User size={20} />
                  </button>

                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <div className="user-dropdown-name">{user?.name || 'Customer'}</div>
                        <div className="user-dropdown-email">{user?.email}</div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="dropdown-item"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ color: 'var(--color-primary)', fontWeight: 600 }}
                        >
                          <ShieldCheck size={16} color="var(--color-gold-dark)" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>My Profile & Addresses</span>
                      </Link>

                      <Link
                        to="/orders"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package size={16} />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/returns"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <RotateCcw size={16} />
                        <span>Returns & Refunds</span>
                      </Link>

                      <div className="dropdown-divider" />

                      <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="btn btn-sm btn-outline-gold" style={{ marginLeft: '0.25rem' }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {searchOpen && (
          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-surface)',
              padding: '1rem 0',
              animation: 'fadeIn 180ms ease-out',
            }}
          >
            <div className="container">
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search
                    size={18}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by saree weave, color, fabric (e.g. Red Banarasi, Kanjivaram Bridal)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  Search
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div className="brand-logo" style={{ alignItems: 'flex-start' }}>
                <span className="brand-name" style={{ fontSize: '1.4rem' }}>Nilmadhav</span>
                <span className="brand-tagline">Heritage Sarees</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <Link to="/" className={`nav-link ${isHomeActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/products" className={`nav-link ${isAllCollectionsActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                All Collections
              </Link>
              <Link to="/products?fabric=Banarasi" className={`nav-link ${isBanarasiActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Banarasi Silk
              </Link>
              <Link to="/products?fabric=Kanjivaram" className={`nav-link ${isKanjivaramActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Kanjivaram Silk
              </Link>
              <Link to="/products?fabric=Chanderi" className={`nav-link ${isChanderiActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Chanderi Weaves
              </Link>
              <Link to="/products?occasion=Bridal" className={`nav-link ${isBridalActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Bridal Edit
              </Link>
              <Link to="/wishlist" className={`nav-link ${location.pathname === '/wishlist' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Wishlist ({wishlistCount})
              </Link>
              <Link to="/cart" className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Shopping Bag ({cartCount})
              </Link>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                    {user?.name}
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="btn btn-sm btn-outline-gold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Portal
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button className="btn btn-sm btn-outline" onClick={handleLogout} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/login" className="btn btn-primary btn-block" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-secondary btn-block" onClick={() => setMobileMenuOpen(false)}>
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
