import React, { useState } from 'react';
// Changed 'react-router' to 'react-router-dom' - assuming this is correct for modern React Router setup
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../features/slice/AuthSlice';
import { ChevronDown, LogOut, Car, Menu, X, Phone, DollarSign, Calendar, Users, Info, Home } from 'lucide-react';

const Navbar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const { isAuthenticated, user } = useSelector((state: RootState) => state.authSlice);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        dispatch(clearCredentials());
        setShowLogoutModal(false);
        navigate("/login");
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    const navLinks = [
        { path: '/', label: 'Home', icon: <Home size={16} className="text-blue-900" /> }, 
        { path: '/vehicles', label: 'Vehicles in Stock', icon: <Car size={16} className="text-blue-900" /> },
        { path: '/incoming', label: 'Incoming Cars', icon: <Calendar size={16} className="text-blue-900" /> },
        { path: '/finance', label: 'Finance Application', icon: <DollarSign size={16} className="text-blue-900" /> },
        { path: '/contact', label: 'Contact Us', icon: <Phone size={16} className="text-blue-900" /> },
        { path: '/about', label: 'About Us', icon: <Info size={16} className="text-blue-900" /> },
    ];

    const isActiveLink = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-blue-100 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="bg-blue-900 text-white p-2 rounded-lg">
                                    <Car size={24} />
                                </div>
                                <span className="text-xl font-bold text-blue-900">
                                    Rent<span className="text-orange-500">Wheels</span>
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`inline-flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                                            isActiveLink(link.path)
                                                ? 'bg-blue-900 text-white shadow-md'
                                                : 'text-gray-800 hover:text-blue-900 hover:bg-blue-50'
                                        }`}
                                    >
                                        {link.icon}
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Auth Section */}
                        <div className="hidden md:flex items-center space-x-4">
                            {!isAuthenticated ? (
                                <>
                                    {/* Removed Sign In Link */}
                                    <Link
                                        to="/register"
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            ) : (
                                <div className="dropdown dropdown-end">
                                    <button className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
                                        <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                                        </div>
                                        <span className="text-gray-800 font-semibold">
                                            Hi, {user?.first_name}
                                        </span>
                                        <ChevronDown size={16} className="text-blue-900" />
                                    </button>
                                    <ul className="dropdown-content bg-white rounded-lg z-50 mt-2 w-48 p-2 shadow-xl border border-gray-200">
                                        <li className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                                            {user?.email}
                                        </li>
                                        <li>
                                            {
                                                user?.user_type === "admin" ? (
                                                    <Link
                                                to="/admin"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 rounded-md transition-colors font-semibold"
                                            >
                                                <Users size={16} className="text-blue-900" />
                                                <span>Dashboard</span>
                                            </Link>
                                                ): user?.user_type === "customer" ? (
                                                 <Link
                                                to="/dashboard"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 rounded-md transition-colors font-semibold"
                                            >
                                                <Users size={16} className="text-blue-900" />
                                                <span>Dashboard</span>
                                            </Link>
                                                ): null
                                            }
                                        </li>
                                        <li>
                                            <button
                                                onClick={handleLogoutClick}
                                                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-semibold"
                                            >
                                                <LogOut size={16} /> 
                                                <span>Logout</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-blue-100 shadow-xl">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-md text-base font-semibold transition-all duration-200 ${
                                        isActiveLink(link.path)
                                            ? 'bg-blue-900 text-white shadow-md'
                                            : 'text-gray-800 hover:text-blue-900 hover:bg-blue-50'
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                            
                            {/* Mobile Auth Section */}
                            <div className="border-t border-gray-200 pt-3 mt-3">
                                {!isAuthenticated ? (
                                    <div className="space-y-2">
                                        {/* Removed Sign In Link */}
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-bold text-base transition-all duration-300"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="px-3 py-2 text-sm text-gray-600">
                                            Welcome, {user?.first_name} {user?.last_name}
                                        </div>
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center space-x-2 px-3 py-2 text-gray-800 hover:bg-blue-50 rounded-md transition-colors font-semibold"
                                        >
                                            <Users size={16} className="text-blue-900" />
                                            <span>Dashboard</span>
                                        </Link>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="flex items-center space-x-2 w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-semibold"
                                        >
                                            <LogOut size={16} /> 
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Modal - remains unchanged */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Blur Background */}
                    <div 
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCancelLogout}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200">
                        <div className="text-center">
                            {/* Warning Icon */}
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <LogOut size={32} className="text-red-600" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Confirm Logout
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to log out of your account?
                            </p>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelLogout}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmLogout}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;