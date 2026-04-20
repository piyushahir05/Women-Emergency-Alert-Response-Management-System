import { Link } from "react-router-dom";

const stats = [
  { value: "10,000+", label: "Lives Protected" },
  { value: "< 3 min", label: "Avg Response Time" },
  { value: "500+", label: "Response Officers" },
  { value: "24/7", label: "Active Monitoring" },
];

const features = [
  {
    title: "One-Tap SOS Alert",
    desc: "Send instant emergency alerts with automatic location sharing. Discreet, fast, and reliable.",
    icon: "🚨",
  },
  {
    title: "Real-Time Tracking",
    desc: "Authorities track your location in real-time as help arrives. Stay informed at every step.",
    icon: "📍",
  },
  {
    title: "Smart Case Management",
    desc: "Response teams assign, manage, and close cases efficiently through a centralized dashboard.",
    icon: "⚡",
  },
];

const steps = [
  { number: "01", title: "Send Alert", desc: "Tap SOS button — location & ID sent instantly" },
  { number: "02", title: "Response Dispatched", desc: "Nearest available officer is notified" },
  { number: "03", title: "Track Progress", desc: "Real-time updates until resolution" },
  { number: "04", title: "Case Resolved", desc: "Incident documented for future reference" },
];

export default function Home() {
  return (
    <div className="bg-primary min-h-screen">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container-responsive">
          <div className="flex-between py-4">
            <Link to="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-display font-bold text-xl">WEARMS</span>
              <span className="text-xs text-tertiary hidden sm:inline">Response System</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-secondary hover:text-brand transition">Features</Link>
              <Link to="/how-it-works" className="text-secondary hover:text-brand transition">How It Works</Link>
              <Link to="/about" className="text-secondary hover:text-brand transition">About</Link>
              <div className="w-px h-5 bg-border-light"></div>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-light/30 to-transparent pointer-events-none"></div>
        
        <div className="container-responsive relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand text-sm font-semibold mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              Live Emergency Network
            </div>
            
            <h1 className="mb-6 animate-slide-up">
              Emergency Help When{" "}
              <span className="text-brand">Every Second Counts</span>
            </h1>
            
            <p className="text-tertiary text-lg max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              WEARMS connects women in distress to rapid response teams. 
              A single tap sends your location and starts a documented rescue operation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/register" className="btn-sos">
                🚨 Send SOS Alert
              </Link>
              <Link to="/vigilance/login" className="btn btn-outline btn-lg">
                Officer Portal
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-tertiary animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                End-to-end Encrypted
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Real-time GPS Tracking
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 border-y border-light bg-secondary">
        <div className="container-responsive">
          <div className="grid-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge badge-danger mb-4">Capabilities</span>
            <h2 className="mb-4">Comprehensive Safety Ecosystem</h2>
            <p className="text-tertiary">
              Built for speed, reliability, and accountability — WEARMS ensures no emergency goes unanswered.
            </p>
          </div>
          
          <div className="grid-cards">
            {features.map((feature, idx) => (
              <div key={idx} className="card hover-lift">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-tertiary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-tertiary">
        <div className="container-responsive">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge badge-info mb-4">Simple Process</span>
            <h2 className="mb-4">How WEARMS Works</h2>
            <p className="text-tertiary">
              From alert to resolution — a streamlined process designed for emergencies
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand text-brand font-bold text-xl shadow-sm">
                  {step.number}
                </div>
                <h4 className="font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-tertiary">{step.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block text-2xl text-tertiary mt-4">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="bg-brand-light border border-brand/20 rounded-2xl p-12 text-center">
            <h2 className="text-2xl md:text-3xl mb-3">Ready to stay protected?</h2>
            <p className="text-tertiary mb-6">Join thousands of women who trust WEARMS for their safety</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/learn-more" className="btn btn-secondary btn-lg">Learn More →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-light py-12">
        <div className="container-responsive">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="font-display font-bold text-lg">WEARMS</span>
              </div>
              <p className="text-sm text-tertiary">
                Women Emergency Alert & Response Management System — protecting lives with technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-tertiary">
                <li><Link to="/features" className="hover:text-brand">Features</Link></li>
                <li><Link to="/how-it-works" className="hover:text-brand">How It Works</Link></li>
                <li><Link to="/safety-tips" className="hover:text-brand">Safety Tips</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Access</h4>
              <ul className="space-y-2 text-sm text-tertiary">
                <li><Link to="/login" className="hover:text-brand">User Login</Link></li>
                <li><Link to="/vigilance/login" className="hover:text-brand">Officer Portal</Link></li>
                <li><Link to="/admin" className="hover:text-brand">Admin Access</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-tertiary">
                <li><Link to="/contact" className="hover:text-brand">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-brand">Help Center</Link></li>
                <li><Link to="/emergency-numbers" className="hover:text-brand">Emergency Numbers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-tertiary">
            <p>© {new Date().getFullYear()} WEARMS Response System. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-brand">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-brand">Terms of Service</Link>
              <Link to="/compliance" className="hover:text-brand">Compliance</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}