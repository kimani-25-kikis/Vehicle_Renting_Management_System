// Contact.tsx - Updated with Google Maps integration
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  MessageSquare,
  Headphones,
  FileText,
  Car,
  Shield,
  Users,
  Calendar,
  Sparkles,
  Navigation,
  ExternalLink
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Your Google Maps API Key (store in .env file in production)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE'; // Move to .env file

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Our locations in Nairobi
  const locations = [
    {
      id: 1,
      name: 'Uhuru Avenue Main Office',
      address: 'Uhuru Avenue, Nairobi CBD, Nairobi, Kenya',
      lat: -1.2833,
      lng: 36.8167,
      phone: '+254 797 390 822',
      hours: 'Mon-Sun: 7:00 AM - 10:00 PM',
      type: 'main'
    },
    {
      id: 2,
      name: 'JKIA Airport Branch',
      address: 'Jomo Kenyatta International Airport, Nairobi, Kenya',
      lat: -1.3191,
      lng: 36.9273,
      phone: '+254 732 270 830',
      hours: '24/7 Operation',
      type: 'airport'
    },
    {
      id: 3,
      name: 'Westlands Branch',
      address: 'Westlands Business Center, Westlands, Nairobi',
      lat: -1.2659,
      lng: 36.8060,
      phone: '+254 797 390 822',
      hours: 'Mon-Sat: 8:00 AM - 8:00 PM',
      type: 'branch'
    },
    {
      id: 4,
      name: 'Karen Branch',
      address: 'Karen Shopping Centre, Karen, Nairobi',
      lat: -1.3195,
      lng: 36.7073,
      phone: '+254 732 270 830',
      hours: 'Mon-Sat: 8:00 AM - 7:00 PM',
      type: 'branch'
    }
  ];

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google && !mapLoaded) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else if (window.google && mapRef.current && !mapLoaded) {
      initializeMap();
    }

    return () => {
      // Cleanup if needed
    };
  }, [mapLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -1.2833, lng: 36.8167 }, // Nairobi Uhuru Avenue coordinates
      zoom: 12,
      styles: [
        {
          featureType: 'poi.business',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Add markers for each location
    locations.forEach(location => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: getMarkerIcon(location.type),
        animation: window.google.maps.Animation.DROP,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-lg text-gray-900 mb-1">${location.name}</h3>
            <p class="text-gray-600 text-sm mb-2">${location.address}</p>
            <p class="text-gray-700 mb-1"><strong>Phone:</strong> ${location.phone}</p>
            <p class="text-gray-700"><strong>Hours:</strong> ${location.hours}</p>
            <div class="mt-2">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}" 
                 target="_blank" 
                 class="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                Get Directions
              </a>
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        map.setCenter(marker.getPosition());
        map.setZoom(15);
      });
    });

    // Add info window for main location
    const mainLocation = locations.find(loc => loc.type === 'main');
    if (mainLocation) {
      const mainMarker = new window.google.maps.Marker({
        position: { lat: mainLocation.lat, lng: mainLocation.lng },
        map: map,
        title: mainLocation.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        animation: window.google.maps.Animation.BOUNCE,
      });

      const mainInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <h3 class="font-bold text-lg text-gray-900">Main Office</h3>
            </div>
            <p class="text-gray-600 text-sm mb-2">${mainLocation.address}</p>
            <p class="text-gray-700 mb-1"><strong>Phone:</strong> ${mainLocation.phone}</p>
            <p class="text-gray-700 mb-3"><strong>Hours:</strong> ${mainLocation.hours}</p>
            <div class="flex gap-2">
              <a href="tel:${mainLocation.phone}" 
                 class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700 transition-colors">
                Call Now
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${mainLocation.lat},${mainLocation.lng}" 
                 target="_blank"
                 class="flex-1 bg-orange-500 text-white px-3 py-2 rounded text-sm text-center hover:bg-orange-600 transition-colors">
                Directions
              </a>
            </div>
          </div>
        `,
      });

      mainInfoWindow.open(map, mainMarker);
    }

    setMapLoaded(true);
  };

  const getMarkerIcon = (type: string) => {
    let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    
    switch(type) {
      case 'main':
        iconUrl = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
        break;
      case 'airport':
        iconUrl = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        break;
      case 'branch':
        iconUrl = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        break;
    }
    
    return {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(32, 32),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Contact form submitted:', formData);
    setIsSubmitted(true);
    setIsLoading(false);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        subject: '', 
        message: '' 
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'subject') setSelectedSubject(value);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      details: ['+254 797 390 822', '+254 732 270 830'],
      description: 'Available daily from 7:00 AM - 10:00 PM',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      details: ['support@rentwheels.com', 'bookings@rentwheels.com'],
      description: 'We reply within 2 hours during business hours',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Main Office',
      details: ['Uhuru Avenue, Nairobi CBD', 'Nairobi, Kenya'],
      description: 'By appointment only',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Working Hours',
      details: ['Monday - Sunday: 7:00 AM - 10:00 PM', '24/7 Emergency Support'],
      description: 'Roadside assistance always available',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const contactOptions = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Live Chat',
      description: 'Instant assistance through our chat system',
      action: 'Start Chat',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      link: '#',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      action: 'Call Now',
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      link: 'tel:+254797390822',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'FAQ Section',
      description: 'Find answers to common questions',
      action: 'Browse FAQs',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      link: '/faq',
    },
  ];

  const subjects = [
    'General Inquiry',
    'Booking Assistance',
    'Vehicle Support',
    'Account Issues',
    'Payment Questions',
    'Emergency Assistance',
    'Feedback & Suggestions',
    'Business Partnership',
  ];

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative py-20 text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Us at 
              <span className="text-orange-500"> Uhuru Avenue</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Visit our main office in Nairobi CBD or any of our conveniently located branches across the city.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <MapPin className="text-orange-400" size={16} />
              <span className="text-sm">Main Office: Uhuru Avenue, Nairobi CBD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <a
                key={index}
                href={option.link}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-center group"
              >
                <div className={`${option.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">
                    {option.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                <span className="inline-block font-semibold text-blue-600 group-hover:text-orange-500 transition-colors">
                  {option.action} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-xl">
                    <Send className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
                    <p className="text-gray-600">Fill out the form below and we'll get back to you promptly</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Thank you for contacting RentWheels. Our team will get back to you within 2 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="+254 700 000 000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                          <option value="">Select a subject</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedSubject === 'Booking Assistance' && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="text-blue-600" size={20} />
                          <span className="font-semibold text-blue-900">Booking Help</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          For booking assistance, please include your booking reference number if you have one.
                        </p>
                      </div>
                    )}

                    {selectedSubject === 'Vehicle Support' && (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Car className="text-orange-600" size={20} />
                          <span className="font-semibold text-orange-900">Vehicle Support</span>
                        </div>
                        <p className="text-sm text-orange-700">
                          Please provide your vehicle details and describe the issue you're experiencing.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        placeholder="Please describe your inquiry in detail..."
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                      
                      <div className="text-sm text-gray-500">
                        <Shield className="inline w-4 h-4 mr-1" />
                        Your information is secure and private
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-8">
              {/* Contact Information Cards */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="text-blue-600" size={24} />
                  Contact Information
                </h2>
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`${item.color} p-3 rounded-lg`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        {item.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-700">{detail}</p>
                        ))}
                        <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Directions */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Navigation className="text-orange-600" size={20} />
                  Quick Directions
                </h2>
                <ul className="space-y-3">
                  <li className="text-sm text-gray-700">
                    <strong>From JKIA Airport:</strong> Take Mombasa Road → Uhuru Highway → Exit at Uhuru Avenue
                  </li>
                  <li className="text-sm text-gray-700">
                    <strong>From Westlands:</strong> Take Waiyaki Way → Uhuru Highway → Exit at Uhuru Avenue
                  </li>
                  <li className="text-sm text-gray-700">
                    <strong>Parking:</strong> Secure parking available at the adjacent City Square parking
                  </li>
                </ul>
                <button
                  onClick={() => openGoogleMaps(-1.2833, 36.8167)}
                  className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  Open in Google Maps
                </button>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Locations</h2>
                  <p className="text-gray-600">
                    Visit our main office at Uhuru Avenue or any of our branches across Nairobi
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-600">Main Office</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Airport</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Branch</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Google Map Container */}
            <div className="relative">
              <div 
                ref={mapRef}
                className="h-96 w-full"
              />
              
              {/* Loading state */}
              {!mapLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Map...</h3>
                  <p className="text-gray-600 max-w-md text-center">
                    Displaying our locations at Uhuru Avenue and other branches in Nairobi
                  </p>
                </div>
              )}
            </div>
            
            {/* Location Details */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {locations.map((location) => (
                  <div key={location.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        location.type === 'main' ? 'bg-blue-100 text-blue-600' :
                        location.type === 'airport' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{location.name}</h4>
                        <p className="text-gray-600 text-sm mb-2">{location.address}</p>
                        <p className="text-gray-700 text-sm mb-1">
                          <strong>Phone:</strong> {location.phone}
                        </p>
                        <p className="text-gray-700 text-sm">
                          <strong>Hours:</strong> {location.hours}
                        </p>
                        <button
                          onClick={() => openGoogleMaps(location.lat, location.lng)}
                          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1"
                        >
                          <Navigation size={12} />
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-900 mb-2">4</div>
              <div className="text-sm text-blue-700 font-semibold">Locations</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
              <div className="text-3xl font-bold text-orange-900 mb-2">24/7</div>
              <div className="text-sm text-orange-700 font-semibold">Airport Support</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
              <div className="text-3xl font-bold text-green-900 mb-2">15min</div>
              <div className="text-sm text-green-700 font-semibold">Avg Response Time</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-900 mb-2">Free</div>
              <div className="text-sm text-purple-700 font-semibold">Parking Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Visit Our Uhuru Avenue Office
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Experience premium service at our main office in the heart of Nairobi's CBD
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=-1.2833,36.8167"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center justify-center gap-3"
            >
              <Navigation size={20} />
              Get Directions to Uhuru Avenue
            </a>
            <Link 
              to="/vehicles"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Book a Vehicle
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

// Add Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

export default Contact;