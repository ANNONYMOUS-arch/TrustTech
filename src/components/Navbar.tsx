import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  Bell, 
  ChevronDown, 
  Coins, 
  Layers, 
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Laptop,
  Wallet,
} from 'lucide-react';
import { User, AccountType, NotificationItem } from '../types';
import { store } from '../services/store';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  availableCredits: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  notifications,
  availableCredits,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read && n.recipientUid === currentUser.uid).length;
  const userNotifications = notifications.filter(n => n.recipientUid === currentUser.uid);

  const switchAccount = (uid: string) => {
    store.switchUser(uid);
    setShowRoleMenu(false);
  };

  const markAllRead = () => {
    store.markAllNotificationsAsRead(currentUser.uid);
  };

  const navItems = [
    { id: 'marketplace', label: 'Marketplace', icon: Briefcase },
    { id: 'financial-centre', label: 'Financial Centre', icon: Wallet },
    { id: 'verification', label: 'Developer Verification', icon: UserCheck },
    { id: 'coding-studio', label: 'Coding Studio', icon: Laptop, isProBadge: true },
    { id: 'how-it-works', label: 'How It Works', icon: Layers },
  ];


  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-heading tracking-tight text-white flex items-center gap-1.5">
                  TrustTech
                  <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    Verified
                  </span>
                </span>
                <span className="hidden sm:block text-[11px] text-slate-400 -mt-1 font-medium">
                  Trusted People. Better Technology.
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'text-teal-400 bg-teal-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === item.id
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                  {item.isProBadge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Quick Dashboard link based on role */}
            {currentUser.accountType === 'client' && (
              <button
                onClick={() => setActiveTab('dashboard-business')}
                className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-all ${
                  activeTab === 'dashboard-business'
                    ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                Client Dashboard
              </button>
            )}

            {currentUser.accountType === 'developer' && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Credits: <strong className="text-white">{availableCredits}</strong>/15</span>
                </span>
                <button
                  onClick={() => setActiveTab('dashboard-developer')}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-all ${
                    activeTab === 'dashboard-developer'
                      ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  Dev Dashboard
                </button>
              </div>
            )}

            {currentUser.accountType === 'admin' && (
              <button
                onClick={() => setActiveTab('dashboard-admin')}
                className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-all ${
                  activeTab === 'dashboard-admin'
                    ? 'border-red-500 bg-red-500/20 text-red-300'
                    : 'border-red-900/60 bg-red-950/40 text-red-300 hover:bg-red-900/50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Admin Console
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-teal-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121824] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-teal-400" />
                      In-App Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-teal-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            store.markNotificationAsRead(n.id);
                            if (n.linkTab) setActiveTab(n.linkTab);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-xs cursor-pointer transition-colors ${
                            n.read ? 'bg-transparent text-slate-400' : 'bg-teal-500/5 text-slate-200'
                          } hover:bg-slate-800/80`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                            )}
                          </div>
                          <p className="text-slate-400 leading-relaxed text-[11px]">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persona / Unified Account Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
                aria-label="Account switcher"
              >
                <div className="w-7 h-7 rounded-md bg-slate-700 flex items-center justify-center text-xs font-bold text-teal-300">
                  {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    {currentUser.fullName}
                    {currentUser.isVerifiedDeveloper && (
                      <span title="Verified Developer">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400 inline" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {currentUser.accountType === 'client' ? 'Business Client' : currentUser.accountType === 'developer' ? 'Developer' : 'Administrator'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#121824] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Active Account Persona
                    </span>
                    <p className="text-slate-200 font-medium truncate">{currentUser.email}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 px-3 pt-1">
                      Switch Persona (For Testing):
                    </div>
                    <button
                      onClick={() => switchAccount('user-client-1')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                        currentUser.uid === 'user-client-1' ? 'bg-teal-500/15 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div>Kolawole Adeleke</div>
                        <div className="text-[10px] text-slate-400">Business Client (PayFlow Africa)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Client</span>
                    </button>

                    <button
                      onClick={() => switchAccount('user-dev-verified')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                        currentUser.uid === 'user-dev-verified' ? 'bg-teal-500/15 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1">
                          Chidinma Okafor
                          <ShieldCheck className="w-3 h-3 text-teal-400" />
                        </div>
                        <div className="text-[10px] text-slate-400">UI/UX & Webflow (Verified)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800/40">Verified</span>
                    </button>

                    <button
                      onClick={() => switchAccount('user-dev-pending')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                        currentUser.uid === 'user-dev-pending' ? 'bg-teal-500/15 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div>Tunde Bakare</div>
                        <div className="text-[10px] text-slate-400">Technical Writer (Pending Review)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">Pending</span>
                    </button>

                    <button
                      onClick={() => switchAccount('user-admin-1')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                        currentUser.uid === 'user-admin-1' ? 'bg-red-500/15 text-red-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div>TrustTech Operations</div>
                        <div className="text-[10px] text-slate-400">Admin Authorization</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">Admin</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-800 mt-2 pt-2">
                    <button
                      onClick={() => {
                        store.resetToFactorySeeds();
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    >
                      Reset Marketplace Seed Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 px-2 space-y-1 bg-[#0b0f17]">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-md"
            >
              Home
            </button>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-md flex items-center gap-2"
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                {item.label}
              </button>
            ))}
            <div className="border-t border-slate-800 pt-2">
              {currentUser.accountType === 'client' && (
                <button
                  onClick={() => { setActiveTab('dashboard-business'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-teal-400 hover:bg-slate-800 rounded-md"
                >
                  Client Dashboard
                </button>
              )}
              {currentUser.accountType === 'developer' && (
                <button
                  onClick={() => { setActiveTab('dashboard-developer'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-teal-400 hover:bg-slate-800 rounded-md"
                >
                  Developer Dashboard ({availableCredits}/15 Credits)
                </button>
              )}
              {currentUser.accountType === 'admin' && (
                <button
                  onClick={() => { setActiveTab('dashboard-admin'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-red-400 hover:bg-slate-800 rounded-md"
                >
                  Admin Console
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
