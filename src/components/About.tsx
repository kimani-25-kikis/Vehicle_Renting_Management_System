// About.tsx
import React from 'react';
import { Link } from 'react-router';
import { 
  Car, 
  Shield, 
  Users, 
  Award, 
  Target, 
  Heart, 
  TrendingUp, 
  Globe,
  Clock,
  Star,
  Zap,
  CheckCircle,
  MapPin,
  Calendar,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  Car as CarIcon,
  Fuel,
  Settings
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'James Kariuki',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: '15+ years in automotive industry',
      social: ['linkedin', 'twitter']
    },
    {
      id: 2,
      name: 'Sarah Mwende',
      role: 'Operations Director',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Former logistics manager at major airline',
      social: ['linkedin']
    },
    {
      id: 3,
      name: 'David Ochieng',
      role: 'Head of Fleet',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Automotive engineer with 12 years experience',
      social: ['linkedin', 'twitter']
    },
    {
      id: 4,
      name: 'Fatima Hassan',
      role: 'Customer Experience Lead',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Hospitality industry veteran',
      social: ['linkedin', 'instagram']
    }
  ];

  const milestones = [
    { year: '2015', title: 'Founded', description: 'Started with 5 vehicles in Nairobi' },
    { year: '2017', title: 'First Expansion', description: 'Opened Westlands branch' },
    { year: '2019', title: 'Fleet Growth', description: 'Reached 100+ vehicles' },
    { year: '2021', title: 'Digital Platform', description: 'Launched online booking system' },
    { year: '2023', title: 'National Presence', description: 'Expanded to 4 major cities' },
    { year: '2024', title: 'Electric Fleet', description: 'Introduced eco-friendly vehicles' }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safety First',
      description: 'Every vehicle undergoes rigorous safety checks and maintenance'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Customer Centric',
      description: 'We prioritize customer satisfaction above all else'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Constantly improving our services with technology'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and vehicles'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'Supporting local businesses and communities'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Excellence',
      description: 'Striving for excellence in everything we do'
    }
  ];

  const stats = [
    { number: '5,000+', label: 'Happy Customers', icon: <Users className="w-6 h-6" /> },
    { number: '200+', label: 'Vehicle Fleet', icon: <Car className="w-6 h-6" /> },
    { number: '4.9', label: 'Average Rating', icon: <Star className="w-6 h-6" /> },
    { number: '98%', label: 'Satisfaction Rate', icon: <ThumbsUp className="w-6 h-6" /> },
    { number: '24/7', label: 'Support', icon: <Clock className="w-6 h-6" /> },
    { number: '6', label: 'Cities Served', icon: <MapPin className="w-6 h-6" /> }
  ];

  const fleetCategories = [
    { icon: <CarIcon size={24} />, name: 'Economy', count: '45 Vehicles', color: 'text-blue-500' },
    { icon: <CarIcon size={24} />, name: 'SUV', count: '38 Vehicles', color: 'text-green-500' },
    { icon: <CarIcon size={24} />, name: 'Luxury', count: '25 Vehicles', color: 'text-purple-500' },
    { icon: <Fuel size={24} />, name: 'Electric', count: '18 Vehicles', color: 'text-orange-500' },
    { icon: <Settings size={24} />, name: 'Vans', count: '12 Vehicles', color: 'text-indigo-500' },
    { icon: <CarIcon size={24} />, name: 'Premium', count: '15 Vehicles', color: 'text-red-500' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative py-24 text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-orange-500/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Car className="text-white" size={16} />
              </div>
              <span className="text-lg">Since 2015</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Driving 
              <span className="text-orange-500"> Excellence</span> 
              Across Kenya
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              RentWheels is more than just a car rental service. We're your trusted mobility partner, 
              committed to providing exceptional vehicles and unparalleled service to power your journeys.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/vehicles"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center gap-3"
              >
                <Car size={20} />
                Browse Our Fleet
              </Link>
              <Link 
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center gap-3"
              >
                <Users size={20} />
                Join Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                  <Target className="text-white" size={24} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-blue-900">
                  Our Story & Mission
                </h2>
              </div>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Founded in 2015 with just 5 vehicles, RentWheels began with a simple vision: to make premium 
                  vehicle rental accessible, reliable, and hassle-free for everyone in Kenya.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  What started as a small operation in Nairobi has grown into one of Kenya's leading car rental 
                  services, serving thousands of satisfied customers across multiple cities.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-3">
                    <Sparkles className="text-orange-500" size={20} />
                    Our Mission
                  </h3>
                  <p className="text-gray-700">
                    To revolutionize mobility in East Africa by providing exceptional rental experiences 
                    through innovative technology, premium vehicles, and customer-centric service.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="RentWheels Team" 
                  className="w-full h-96 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Our First Office</h3>
                      <p className="text-gray-600">Nairobi CBD, 2015</p>
                    </div>
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Humble Beginnings
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Where our journey began with passion, determination, and a commitment to excellence.
                  </p>
                </div>
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200 max-w-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Award className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">6 Awards</div>
                    <div className="text-sm text-gray-600">Industry Recognition</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Recognized for excellence in customer service and innovation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-blue-900">
                Our Core Values
              </h2>
            </div>
            <p className="text-lg text-blue-900 max-w-2xl mx-auto">
              These principles guide every decision we make and every interaction we have
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100"
              >
                <div className="text-blue-600 mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Diversity */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-6">
              Our Diverse Fleet
            </h2>
            <p className="text-lg text-blue-900 max-w-2xl mx-auto">
              From economical city cars to premium SUVs, we have the perfect vehicle for every need
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {fleetCategories.map((category, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 text-center"
              >
                <div className={`${category.color} mb-4`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.count}
                </p>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-8 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  Quality Assurance Promise
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <span>Regular maintenance and safety checks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <span>Full insurance coverage on all vehicles</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <span>24/7 roadside assistance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <span>Regular fleet upgrades and modernization</span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-5xl font-bold mb-2">100%</div>
                  <div className="text-lg">Safety Record</div>
                  <div className="text-sm text-blue-200 mt-2">Zero major incidents since 2015</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-blue-900">
                Our Journey
              </h2>
            </div>
            <p className="text-lg text-blue-900 max-w-2xl mx-auto">
              Milestones that shaped RentWheels into what it is today
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-orange-500 hidden lg:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`relative flex flex-col lg:flex-row items-center ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* Year Card */}
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <div className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-200 max-w-md ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                      <div className="text-4xl font-bold text-blue-900 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full border-4 border-white shadow-lg z-10 hidden lg:block"></div>
                  
                  {/* Empty Space for opposite side */}
                  <div className="lg:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-6">
              Meet Our Leadership Team
            </h2>
            <p className="text-lg text-blue-900 max-w-2xl mx-auto">
              The passionate individuals driving RentWheels forward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Social Icons */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {member.social.map((platform) => (
                      <div key={platform} className="bg-white p-2 rounded-full">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <div className="text-orange-500 font-semibold mb-2">{member.role}</div>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/careers"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg"
            >
              View Open Positions
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Community & Sustainability */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Beyond Business: 
                <span className="text-orange-300"> Our Impact</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-lg text-blue-200 leading-relaxed">
                  At RentWheels, we believe in giving back to the communities that support us and protecting 
                  the environment we all share.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-3xl font-bold mb-2">500+</div>
                    <div className="text-sm text-blue-200">Trees Planted</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-3xl font-bold mb-2">18</div>
                    <div className="text-sm text-blue-200">Electric Vehicles</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-3xl font-bold mb-2">10+</div>
                    <div className="text-sm text-blue-200">Local Partnerships</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-sm text-blue-200">Carbon Offset</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="text-orange-300" size={24} />
                Our Sustainability Goals
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <Zap className="text-green-300" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Electric Fleet Expansion</h4>
                    <p className="text-blue-200 text-sm">
                      Target: 50% electric vehicles by 2026
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <Users className="text-blue-300" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Community Programs</h4>
                    <p className="text-blue-200 text-sm">
                      Supporting local driver training initiatives
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <TrendingUp className="text-purple-300" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Green Operations</h4>
                    <p className="text-blue-200 text-sm">
                      Paperless booking and solar-powered offices
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-3xl p-12 border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="text-white" size={32} />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-6">
              Ready to Experience Excellence?
            </h2>
            
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust RentWheels for their mobility needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/vehicles"
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center gap-3"
              >
                <Car size={20} />
                Book Your Vehicle
              </Link>
              <Link 
                to="/contact"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center gap-3"
              >
                <Users size={20} />
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;