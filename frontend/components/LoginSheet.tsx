"use client";

import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Flame, X, MessageSquare } from 'lucide-react';

export default function LoginSheet() {
  const { loginSheetOpen, setLoginSheetOpen, loginWithOtp, loginWithGoogle } = useAuth();
  const [step, setStep] = useState<'options' | 'phone' | 'otp' | 'google-mock'>('options');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loginSheetOpen) return null;

  const resetState = () => {
    setStep('options');
    setPhone('');
    setOtpCode('');
    setGoogleEmail('');
    setGoogleName('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    setLoginSheetOpen(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Mock request to send OTP
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (!response.ok) throw new Error('Failed to send OTP');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithOtp(phone, otpCode);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Invalid code. Use 123456 for developer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleName) {
      setError('Please enter both name and email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const avatar = `https://images.unsplash.com/photo-${googleEmail.includes('priya') ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?w=150`;
      await loginWithGoogle(googleEmail, googleName, avatar);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const selectPreSetGoogleAccount = async (name: string, email: string) => {
    setError('');
    setLoading(true);
    try {
      const avatar = email.includes('priya') 
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
      await loginWithGoogle(email, name, avatar);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2C1810]/40 backdrop-blur-sm transition-opacity duration-300">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      {/* Drawer Body */}
      <div className="relative z-10 w-full max-w-md bg-background border-t border-border rounded-t-[24px] shadow-2xl p-6 transition-transform duration-300 transform translate-y-0 max-h-[85vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-border/30 text-muted-text hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Chaska Icon & Branding */}
        <div className="flex flex-col items-center text-center gap-2 mt-2 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Flame size={28} fill="currentColor" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold text-foreground tracking-wide">Chaska</h2>
          <p className="text-muted-text text-sm max-w-[260px]">
            Login to review local stalls, vote on reviews, and help the community.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-status-closed text-xs rounded-xl font-semibold text-center">
            {error}
          </div>
        )}

        {/* STEP 1: Main Login Options */}
        {step === 'options' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStep('phone')}
              className="w-full h-12 bg-primary hover:bg-orange-600 text-white font-bold rounded-btn transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Continue with Phone OTP
            </button>

            <button
              onClick={() => setStep('google-mock')}
              className="w-full h-12 bg-card hover:bg-orange-50 border border-border text-foreground font-bold rounded-btn transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-5.29-4.53z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button 
              onClick={handleClose}
              className="w-full py-3 text-xs text-muted-text hover:text-foreground font-bold transition-colors text-center mt-2 underline"
            >
              Skip / Cancel
            </button>
          </div>
        )}

        {/* STEP 2: Phone Input */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Phone Number</label>
              <div className="flex gap-2">
                <span className="h-11 bg-card border border-border rounded-xl px-3 flex items-center justify-center font-bold text-sm text-foreground">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  className="flex-1 h-11 bg-card border border-border rounded-xl px-3 text-sm text-foreground focus:outline-none focus:border-primary font-semibold"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className={`w-full h-11 bg-primary text-white font-bold rounded-btn transition-colors shadow-md flex items-center justify-center ${
                (loading || phone.length < 10) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-orange-600'
              }`}
            >
              {loading ? 'Sending Code...' : 'Send Verification OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('options')}
              className="w-full py-2 text-xs text-muted-text hover:text-foreground font-bold text-center underline"
            >
              Back to Options
            </button>
          </form>
        )}

        {/* STEP 3: OTP Code Verify */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-center">
              <label className="text-xs font-bold text-foreground">Enter 6-digit Code sent to +91 {phone}</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="w-full text-center h-12 bg-card border border-border rounded-xl tracking-[0.5em] text-lg text-foreground focus:outline-none focus:border-primary font-bold"
                autoFocus
              />
              <span className="text-[10px] text-muted-text">
                (Mock OTP is active: type <span className="font-bold text-primary">123456</span>)
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className={`w-full h-11 bg-primary text-white font-bold rounded-btn transition-colors shadow-md flex items-center justify-center ${
                (loading || otpCode.length < 6) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-orange-600'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify Code & Login'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full py-2 text-xs text-muted-text hover:text-foreground font-bold text-center underline"
            >
              Change Phone Number
            </button>
          </form>
        )}

        {/* STEP 4: Google Simulation */}
        {step === 'google-mock' && (
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-foreground text-center">Select Google Account (Mock Mode)</h4>
            
            {/* Quick selectors */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => selectPreSetGoogleAccount('Aman Sahu', 'aman.sahu@chaska.in')}
                className="flex items-center gap-3 p-3 bg-card hover:bg-orange-50 border border-border rounded-xl text-left transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" 
                  alt="Aman" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div>
                  <p className="text-xs font-bold text-foreground">Aman Sahu (Certified चटोर)</p>
                  <p className="text-[10px] text-muted-text">aman.sahu@chaska.in</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectPreSetGoogleAccount('Priya Dewangan', 'priya.d@chaska.in')}
                className="flex items-center gap-3 p-3 bg-card hover:bg-orange-50 border border-border rounded-xl text-left transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                  alt="Priya" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div>
                  <p className="text-xs font-bold text-foreground">Priya Dewangan</p>
                  <p className="text-[10px] text-muted-text">priya.d@chaska.in</p>
                </div>
              </button>
            </div>

            <div className="relative py-2 text-center">
              <span className="absolute inset-x-0 top-1/2 border-t border-border -z-10"></span>
              <span className="bg-background px-3 text-[10px] font-bold text-muted-text uppercase">Or enter custom</span>
            </div>

            {/* Custom Google account inputs */}
            <form onSubmit={handleMockGoogleLogin} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="h-10 bg-card border border-border rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-primary font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <input
                  type="email"
                  placeholder="Google Email Address"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="h-10 bg-card border border-border rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-primary font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !googleEmail || !googleName}
                className="w-full h-11 bg-primary text-white font-bold rounded-btn transition-colors hover:bg-orange-600 shadow-md text-xs"
              >
                {loading ? 'Authenticating...' : 'Sign in as Custom User'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setStep('options')}
              className="w-full py-1 text-xs text-muted-text hover:text-foreground font-bold text-center underline"
            >
              Back to Options
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <p className="text-[10px] text-muted-text">
            By signing in, you agree to Chaska&apos;s Terms of Service and Privacy Policy. Built with local pride for Rajnandgaon ❤️
          </p>
        </div>

      </div>
    </div>
  );
}
