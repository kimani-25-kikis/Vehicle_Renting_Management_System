// components/admin/AdminSettings.tsx
import React, { useState } from 'react'
import { 
  Settings, Save, RefreshCw, Shield, Bell, 
  CreditCard, Users, Car, Globe, Database,
  Lock, Mail, Phone, MapPin, Upload,
  Download, Trash2, Eye, EyeOff, Key,
  Server, Cpu, HardDrive, Wifi, Calendar
} from 'lucide-react'
import { toast } from 'sonner'

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'billing' | 'system'>('general')
  const [saving, setSaving] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'RentWheels Kenya',
    supportEmail: 'support@rentwheels.co.ke',
    supportPhone: '+254 700 123 456',
    address: '123 Moi Avenue, Nairobi, Kenya',
    timezone: 'Africa/Nairobi',
    currency: 'KES',
    language: 'en',
    businessHours: {
      open: '08:00',
      close: '20:00'
    }
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    ipWhitelist: ['192.168.1.0/24'],
    auditLogRetention: 365
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    newBookingAlerts: true,
    paymentAlerts: true,
    systemAlerts: true,
    maintenanceReminders: true,
    reviewAlerts: true
  })

  // Billing Settings
  const [billingSettings, setBillingSettings] = useState({
    paymentMethods: ['mpesa', 'card', 'cash'],
    taxRate: 16,
    lateFee: 500,
    cleaningFee: 300,
    securityDeposit: 5000,
    cancellationPolicy: 'flexible',
    refundPolicy: 'standard'
  })

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    apiRateLimit: 1000,
    cacheEnabled: true,
    backupFrequency: 'daily',
    logLevel: 'info',
    autoUpdate: true
  })

  const handleSaveSettings = async () => {
    setSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('Settings saved successfully')
    setSaving(false)
  }

  const handleResetSettings = () => {
    toast.success('Settings reset to defaults')
  }

  const handleExportSettings = () => {
    toast.success('Settings exported successfully')
  }

  const handleImportSettings = () => {
    toast.success('Settings imported successfully')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={20} /> },
    { id: 'system', label: 'System', icon: <Server size={20} /> }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure and manage your rental platform settings</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2"
            >
              {saving ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <RefreshCw size={20} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 sticky top-24">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleExportSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Download size={16} />
                  Export Settings
                </button>
                <button 
                  onClick={handleImportSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Upload size={16} />
                  Import Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 size={16} />
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="text-blue-600" />
                  General Settings
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.companyName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Currency
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="KES">Kenyan Shilling (KES)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Business Hours - Open
                    </label>
                    <input
                      type="time"
                      value={generalSettings.businessHours.open}
                      onChange={(e) => setGeneralSettings(prev => ({ 
                        ...prev, 
                        businessHours: { ...prev.businessHours, open: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Business Hours - Close
                    </label>
                    <input
                      type="time"
                      value={generalSettings.businessHours.close}
                      onChange={(e) => setGeneralSettings(prev => ({ 
                        ...prev, 
                        businessHours: { ...prev.businessHours, close: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="text-blue-600" />
                  Security Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-gray-600 text-sm">Require 2FA for all admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="5"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Password Expiry (days)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="30"
                        max="365"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="3"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Audit Log Retention (days)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.auditLogRetention}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, auditLogRetention: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="30"
                        max="730"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      IP Whitelist
                    </label>
                    <textarea
                      value={securitySettings.ipWhitelist.join('\n')}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value.split('\n') }))}
                      placeholder="Enter one IP address or CIDR per line"
                      className="w-full h-32 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-gray-500 text-sm mt-2">Specify IP addresses that are allowed to access the admin panel</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Bell className="text-blue-600" />
                  Notification Settings
                </h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications' },
                    { key: 'newBookingAlerts', label: 'New Booking Alerts', description: 'Get notified for new bookings' },
                    { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Get notified for payments and refunds' },
                    { key: 'systemAlerts', label: 'System Alerts', description: 'Receive system status alerts' },
                    { key: 'maintenanceReminders', label: 'Maintenance Reminders', description: 'Get vehicle maintenance reminders' },
                    { key: 'reviewAlerts', label: 'Review Alerts', description: 'Get notified for new reviews' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="text-blue-600" />
                  Billing & Payment Settings
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={billingSettings.taxRate}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Late Fee (KES)
                    </label>
                    <input
                      type="number"
                      value={billingSettings.lateFee}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, lateFee: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Cleaning Fee (KES)
                    </label>
                    <input
                      type="number"
                      value={billingSettings.cleaningFee}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, cleaningFee: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Security Deposit (KES)
                    </label>
                    <input
                      type="number"
                      value={billingSettings.securityDeposit}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, securityDeposit: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Cancellation Policy
                    </label>
                    <select
                      value={billingSettings.cancellationPolicy}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="moderate">Moderate</option>
                      <option value="strict">Strict</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Refund Policy
                    </label>
                    <select
                      value={billingSettings.refundPolicy}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, refundPolicy: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="generous">Generous</option>
                      <option value="strict">Strict</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Enabled Payment Methods
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['mpesa', 'card', 'cash'].map(method => (
                      <label key={method} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={billingSettings.paymentMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBillingSettings(prev => ({
                                ...prev,
                                paymentMethods: [...prev.paymentMethods, method]
                              }))
                            } else {
                              setBillingSettings(prev => ({
                                ...prev,
                                paymentMethods: prev.paymentMethods.filter(m => m !== method)
                              }))
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Server className="text-blue-600" />
                  System Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Maintenance Mode</h3>
                      <p className="text-gray-600 text-sm">Put the system in maintenance mode</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Auto Updates</h3>
                      <p className="text-gray-600 text-sm">Automatically install system updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.autoUpdate}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, autoUpdate: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Cache Enabled</h3>
                      <p className="text-gray-600 text-sm">Enable system caching for better performance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.cacheEnabled}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, cacheEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        API Rate Limit (requests/hour)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.apiRateLimit}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="100"
                        max="10000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Log Level
                      </label>
                      <select
                        value={systemSettings.logLevel}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="debug">Debug</option>
                        <option value="info">Info</option>
                        <option value="warn">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <Cpu className="mx-auto text-green-600 mb-2" size={24} />
                    <div className="text-lg font-bold text-green-800">Online</div>
                    <div className="text-green-600 text-sm">API Server</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <Database className="mx-auto text-green-600 mb-2" size={24} />
                    <div className="text-lg font-bold text-green-800">Healthy</div>
                    <div className="text-green-600 text-sm">Database</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <Wifi className="mx-auto text-green-600 mb-2" size={24} />
                    <div className="text-lg font-bold text-green-800">Active</div>
                    <div className="text-green-600 text-sm">Network</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <HardDrive className="mx-auto text-blue-600 mb-2" size={24} />
                    <div className="text-lg font-bold text-blue-800">2.3 GB</div>
                    <div className="text-blue-600 text-sm">Storage Used</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings