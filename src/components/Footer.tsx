import React from 'react'
import { Link } from 'react-router'
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Shield, Award, Clock } from 'lucide-react'

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#1A233A] text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="bg-orange-500 text-white p-2 rounded-lg">
                                <Car size={28} />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Rent<span className="text-orange-500">Wheels</span>
                            </span>
                        </Link>
                        <p className="text-blue-200 mb-6 text-sm leading-relaxed">
                            Your trusted partner for premium car rentals. Experience luxury, reliability, 
                            and exceptional service with every journey.
                        </p>
                        
                        {/* Social Media Links */}
                        <div className="mb-6">
                            <h4 className="text-white text-sm font-semibold mb-3">Follow Our Journey</h4>
                            <div className="flex space-x-3">
                                <a 
                                    href="https://facebook.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-800 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                    aria-label="Follow us on Facebook"
                                >
                                    <Facebook size={18} />
                                </a>
                                <a 
                                    href="https://twitter.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-800 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                    aria-label="Follow us on Twitter"
                                >
                                    <Twitter size={18} />
                                </a>
                                <a 
                                    href="https://instagram.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-800 hover:bg-pink-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                    aria-label="Follow us on Instagram"
                                >
                                    <Instagram size={18} />
                                </a>
                                <a 
                                    href="https://youtube.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-800 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                    aria-label="Subscribe to our YouTube channel"
                                >
                                    <Youtube size={18} />
                                </a>
                                <a 
                                    href="https://linkedin.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-800 hover:bg-blue-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                    aria-label="Connect with us on LinkedIn"
                                >
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-blue-200">
                                <Shield size={16} className="text-orange-500" />
                                <span className="text-sm">Fully Insured Vehicles</span>
                            </div>
                            <div className="flex items-center space-x-2 text-blue-200">
                                <Award size={16} className="text-orange-500" />
                                <span className="text-sm">Award Winning Service</span>
                            </div>
                            <div className="flex items-center space-x-2 text-blue-200">
                                <Clock size={16} className="text-orange-500" />
                                <span className="text-sm">24/7 Customer Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white border-b border-orange-500 pb-2">
                            Quick Links
                        </h3>
                        <div className="space-y-3">
                            <Link to="/vehicles" className="block text-blue-200 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 transform duration-200">
                                Vehicles in Stock
                            </Link>
                            <Link to="/incoming" className="block text-blue-200 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 transform duration-200">
                                Incoming Cars
                            </Link>
                            <Link to="/finance" className="block text-blue-200 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 transform duration-200">
                                Finance Application
                            </Link>
                            <Link to="/about" className="block text-blue-200 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 transform duration-200">
                                About Us
                            </Link>
                            <Link to="/contact" className="block text-blue-200 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 transform duration-200">
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white border-b border-orange-500 pb-2">
                            Our Services
                        </h3>
                        <div className="space-y-3">
                            <a className="block text-blue-200 hover:text-orange-400 transition-colors text-sm cursor-pointer hover:translate-x-1 transform duration-200">
                                Short Term Rentals
                            </a>
                            <a className="block text-blue-200 hover:text-orange-400 transition-colors text-sm cursor-pointer hover:translate-x-1 transform duration-200">
                                Long Term Leasing
                            </a>
                            <a className="block text-blue-200 hover:text-orange-400 transition-colors text-sm cursor-pointer hover:translate-x-1 transform duration-200">
                                Corporate Fleet
                            </a>
                            <a className="block text-blue-200 hover:text-orange-400 transition-colors text-sm cursor-pointer hover:translate-x-1 transform duration-200">
                                Luxury Vehicles
                            </a>
                            <a className="block text-blue-200 hover:text-orange-400 transition-colors text-sm cursor-pointer hover:translate-x-1 transform duration-200">
                                Insurance Services
                            </a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white border-b border-orange-500 pb-2">
                            Contact Info
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin size={16} className="text-orange-500 mt-1 shrink-0" />
                                <span className="text-blue-200 text-sm">
                                    123 Drive Street<br />
                                    Automotive City, AC 12345
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone size={16} className="text-orange-500 shrink-0" />
                                <a href="tel:+15551234567" className="text-blue-200 text-sm hover:text-orange-400 transition-colors">
                                    +1 (555) 123-4567
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail size={16} className="text-orange-500 shrink-0" />
                                <a href="mailto:info@rentwheels.com" className="text-blue-200 text-sm hover:text-orange-400 transition-colors">
                                    info@rentwheels.com
                                </a>
                            </div>
                            
                            {/* Business Hours */}
                            <div className="pt-2">
                                <h4 className="text-white text-sm font-semibold mb-2">Business Hours</h4>
                                <div className="text-blue-200 text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>Mon - Fri:</span>
                                        <span>8:00 AM - 8:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday:</span>
                                        <span>9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday:</span>
                                        <span>10:00 AM - 4:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-blue-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-blue-300 text-sm">
                            © {new Date().getFullYear()} RentWheels. All rights reserved.
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <Link to="/privacy" className="text-blue-300 hover:text-orange-400 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-blue-300 hover:text-orange-400 transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/cookies" className="text-blue-300 hover:text-orange-400 transition-colors">
                                Cookie Policy
                            </Link>
                            <a href="#" className="text-blue-300 hover:text-orange-400 transition-colors">
                                Sitemap
                            </a>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-blue-300 text-sm">
                            <span>Designed with</span>
                            <span className="text-orange-500">❤️</span>
                            <span>for car enthusiasts</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer