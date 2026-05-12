import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  XCircleIcon,
  PhoneIcon,
  SparklesIcon,
  BeakerIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import TOTPLogin from '../components/TOTPLogin';

// Ensure API URL always ends with /api
const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

/* ════════════════════════════════════════════════════════════════
   FLOATING PARTICLE BACKGROUND
   ════════════════════════════════════════════════════════════════ */
const FloatingParticles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 
              ? 'rgba(34, 211, 238, 0.6)' 
              : p.id % 3 === 1 
                ? 'rgba(168, 85, 247, 0.5)' 
                : 'rgba(52, 211, 153, 0.5)',
            boxShadow: `0 0 ${p.size * 3}px ${p.id % 3 === 0 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(168, 85, 247, 0.3)'}`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   DNA HELIX ANIMATION (LEFT SIDE)
   ════════════════════════════════════════════════════════════════ */
const DNAHelix = () => {
  const strands = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
  
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      <svg viewBox="0 0 200 400" className="w-64 h-auto">
        {strands.map((i) => {
          const y = i * 35;
          const offset = i * 30;
          return (
            <g key={i}>
              <motion.circle
                cx="60"
                cy={y + 20}
                r="8"
                fill="#22d3ee"
                animate={{ cx: [60, 140, 60], cy: [y + 20, y + 20, y + 20] }}
                transition={{ duration: 3, repeat: Infinity, delay: offset / 100, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="140"
                cy={y + 20}
                r="8"
                fill="#a855f7"
                animate={{ cx: [140, 60, 140], cy: [y + 20, y + 20, y + 20] }}
                transition={{ duration: 3, repeat: Infinity, delay: offset / 100, ease: 'easeInOut' }}
              />
              <motion.line
                x1="60"
                y1={y + 20}
                x2="140"
                y2={y + 20}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, delay: offset / 100 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   GLOWING ORB BACKGROUND
   ════════════════════════════════════════════════════════════════ */
const GlowingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
        top: '-10%',
        right: '-10%',
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
        bottom: '-20%',
        left: '-15%',
      }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%)',
        top: '40%',
        left: '30%',
      }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
  </div>
);

/* ════════════════════════════════════════════════════════════════
   STAT CARD COMPONENT
   ════════════════════════════════════════════════════════════════ */
const StatCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
  >
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
      <Icon className="w-5 h-5 text-cyan-400" />
    </div>
    <div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════
   TRUST BADGE
   ════════════════════════════════════════════════════════════════ */
const TrustBadge = ({ children }) => (
  <div className="flex items-center gap-2 text-xs text-gray-400">
    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
    <span>{children}</span>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   INPUT FIELD COMPONENT
   ════════════════════════════════════════════════════════════════ */
const InputField = ({ icon: Icon, suffix, error, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative group"
  >
    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300">
      <Icon className="w-5 h-5" />
    </div>
    <input
      {...props}
      className={`w-full bg-gray-900/50 border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 
        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
        transition-all duration-300 backdrop-blur-sm
        ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700/50 hover:border-gray-600'}`}
    />
    {suffix && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>
    )}
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════
   PASSWORD REQUIREMENTS
   ════════════════════════════════════════════════════════════════ */
const PasswordRequirements = ({ validation, confirmPassword }) => {
  const requirements = [
    { key: 'minLength', label: '8+ characters', valid: validation.minLength },
    { key: 'hasUppercase', label: 'Uppercase (A-Z)', valid: validation.hasUppercase },
    { key: 'hasLowercase', label: 'Lowercase (a-z)', valid: validation.hasLowercase },
    { key: 'hasNumber', label: 'Number (0-9)', valid: validation.hasNumber },
    { key: 'hasSpecialChar', label: 'Special (!@#$)', valid: validation.hasSpecialChar },
  ];

  const validCount = requirements.filter(r => r.valid).length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">Password strength</span>
        <span className={`text-xs font-medium ${
          validCount <= 2 ? 'text-red-400' : validCount <= 4 ? 'text-yellow-400' : 'text-emerald-400'
        }`}>
          {validCount <= 2 ? 'Weak' : validCount <= 4 ? 'Medium' : 'Strong'}
        </span>
      </div>
      
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-4">
        <motion.div
          className={`h-full rounded-full ${
            validCount <= 2 ? 'bg-red-500' : validCount <= 4 ? 'bg-yellow-500' : 'bg-emerald-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${(validCount / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
              req.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'
            }`}>
              {req.valid ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
            </div>
            <span className={`text-xs ${req.valid ? 'text-emerald-400' : 'text-gray-500'}`}>
              {req.label}
            </span>
          </div>
        ))}
        {confirmPassword && (
          <div className="flex items-center gap-2 col-span-2 mt-1">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
              validation.passwordsMatch ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'
            }`}>
              {validation.passwordsMatch ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
            </div>
            <span className={`text-xs ${validation.passwordsMatch ? 'text-emerald-400' : 'text-gray-500'}`}>
              Passwords match
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
   ════════════════════════════════════════════════════════════════ */
const Auth = () => {
  const [authMode, setAuthMode] = useState('unified');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [inputType, setInputType] = useState('email');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('userData');
    
    if (token && user) {
      try {
        const tokenPayload = jwtDecode(token);
        if (tokenPayload.exp * 1000 > Date.now()) {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, [navigate, location]);

  const sendOtp = async (phone) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        mobileNumber: formattedPhone,
      });
      if (response.data.success) {
        toast.success("OTP sent successfully!");
        setShowOtpField(true);
      } else {
        toast.error(response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    }
  };

  const verifyOtp = async (phone, otpCode) => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const payload = { mobileNumber: formattedPhone, code: otpCode };
      if (!isLogin && formData.fullName) {
        payload.fullName = formData.fullName;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, payload);

      if (response.data.success && response.data.data) {
        toast.success("OTP verified!");
        const { token, user, refreshToken } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.fullName);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        setShowOtpField(false);
        navigate(location.state?.from?.pathname || '/', { replace: true });
      } else {
        toast.error("Invalid OTP.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed.");
    }
  };

  const detectInputType = useCallback((value) => {
    const cleanValue = value.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const isPhone = phoneRegex.test(cleanValue) || (cleanValue.length >= 6 && /^\d+$/.test(cleanValue));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) return 'email';
    if (isPhone) return 'phone';
    return value.includes('@') ? 'email' : 'phone';
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'emailOrPhone') {
      setInputType(detectInputType(value));
    }
    
    if (name === 'password' || name === 'confirmPassword') {
      const pwd = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordValidation({
        minLength: pwd.length >= 8,
        hasUppercase: /[A-Z]/.test(pwd),
        hasLowercase: /[a-z]/.test(pwd),
        hasNumber: /\d/.test(pwd),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
        passwordsMatch: pwd === confirm && pwd.length > 0
      });
    }
  }, [detectInputType, formData.password, formData.confirmPassword]);

  const isPasswordValid = useCallback(() => {
    return Object.values(passwordValidation).every(v => v);
  }, [passwordValidation]);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password, rememberMe });
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.fullName);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        toast.success(`Welcome back, ${user.fullName}!`);
        navigate(location.state?.from?.pathname || '/', { replace: true });
      }
    } catch (error) {
      if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
        toast.error('Account locked. Try again later.');
      } else if (error.response?.data?.code === 'USE_TOTP_AUTH') {
        toast.info('2FA enabled. Switching to TOTP login...');
        setAuthMode('totp');
        setFormData(prev => ({ ...prev, email: error.response.data.data?.email || '', password: '' }));
      } else {
        toast.error(error.response?.data?.message || 'Login failed.');
      }
    }
  };

  const handleSignup = async (fullName, email, password, confirmPassword) => {
    if (!fullName || !email || !password || !isPasswordValid()) {
      toast.error('Please fill all fields correctly.');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, { fullName, email, password, confirmPassword });
      if (response.data.success) {
        toast.success('Account created! Check your email to verify.', { duration: 6000 });
        setIsLogin(true);
        setFormData(prev => ({ ...prev, email, password: '', confirmPassword: '', fullName: '' }));
      }
    } catch (error) {
      if (error.response?.data?.code === 'USER_EXISTS') {
        toast.error('Account exists. Please sign in.');
        setIsLogin(true);
      } else {
        toast.error(error.response?.data?.message || 'Signup failed.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (inputType === "phone") {
        await sendOtp(formData.emailOrPhone);
      } else {
        if (isLogin) {
          await handleLogin(formData.emailOrPhone, formData.password);
        } else {
          await handleSignup(formData.fullName, formData.emailOrPhone, formData.password, formData.confirmPassword);
        }
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        credential: credentialResponse.credential
      });
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.fullName);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        toast.success(`Welcome, ${user.fullName}!`);
        navigate(location.state?.from?.pathname || '/', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google auth failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed.');
    setIsLoading(false);
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      {/* ═══════════════ LEFT SIDE - BRANDING ═══════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0f0f1a] via-[#0a0a0f] to-[#0d0d15]">
        <GlowingOrbs />
        <DNAHelix />
        <FloatingParticles />
        
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <BeakerIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-cyan-400">CRISPR</span>
                <span className="text-white"> BERT</span>
              </h1>
              <p className="text-xs text-gray-500">Gene Editing Intelligence</p>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl font-bold leading-tight mb-6">
              <span className="text-white">Predict CRISPR</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Off-Target Effects
              </span>
              <br />
              <span className="text-white">with AI Precision</span>
            </h2>
            
            <p className="text-gray-400 text-lg max-w-md mb-10">
              Leverage state-of-the-art deep learning to analyze sgRNA-DNA interactions 
              and ensure safer gene editing outcomes.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <StatCard icon={ChartBarIcon} value="94.2%" label="Model Accuracy" delay={0.3} />
            <StatCard icon={SparklesIcon} value="0.89" label="AUC-ROC Score" delay={0.4} />
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6"
          >
            <TrustBadge>Research-grade predictions</TrustBadge>
            <TrustBadge>256-bit encryption</TrustBadge>
            <TrustBadge>HIPAA compliant</TrustBadge>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════ RIGHT SIDE - AUTH FORM ═══════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <FloatingParticles />
        <GlowingOrbs />
        
        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">
            {authMode === 'totp' ? (
              <motion.div
                key="totp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TOTPLogin
                  onBack={() => setAuthMode('unified')}
                  prefillData={{
                    fullName: formData.fullName || '',
                    email: formData.email || formData.emailOrPhone || '',
                    password: formData.password || ''
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <BeakerIcon className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold">
                    <span className="text-cyan-400">CRISPR</span>
                    <span className="text-white"> BERT</span>
                  </h1>
                </div>

                {/* Auth Card */}
                <motion.div
                  className="bg-gray-900/40 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <h2 className="text-3xl font-bold mb-2">
                          {isLogin ? 'Welcome back' : 'Get started'}
                        </h2>
                        <p className="text-gray-400">
                          {isLogin 
                            ? 'Sign in to continue your research' 
                            : 'Create your account in seconds'}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isLogin ? 'login-fields' : 'signup-fields'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {!isLogin && (
                          <InputField
                            name="fullName"
                            type="text"
                            placeholder="Full Name"
                            icon={UserIcon}
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        )}

                        <div className="relative">
                          <InputField
                            name="emailOrPhone"
                            type={inputType === 'email' ? 'email' : 'tel'}
                            placeholder="Email or Phone"
                            icon={inputType === 'email' ? EnvelopeIcon : PhoneIcon}
                            value={formData.emailOrPhone}
                            onChange={handleInputChange}
                            required
                          />
                          <motion.div
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            key={inputType}
                          >
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                              inputType === 'email'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {inputType === 'email' ? 'EMAIL' : 'PHONE'}
                            </span>
                          </motion.div>
                        </div>

                        <InputField
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          icon={LockClosedIcon}
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          suffix={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-500 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                          }
                        />

                        {!isLogin && (
                          <>
                            <InputField
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm Password"
                              icon={LockClosedIcon}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                              suffix={
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="text-gray-500 hover:text-white transition-colors"
                                >
                                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                              }
                            />
                            
                            {formData.password && (
                              <PasswordRequirements
                                validation={passwordValidation}
                                confirmPassword={formData.confirmPassword}
                              />
                            )}
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Remember Me & Forgot */}
                    {isLogin && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500/50"
                          />
                          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                            Remember me
                          </span>
                        </label>
                        <button type="button" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || (!isLogin && !isPasswordValid())}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2
                        ${isLoading || (!isLogin && !isPasswordValid())
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-purple-500/25'
                        }`}
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                          <ArrowRightIcon className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>

                    {/* OTP Field */}
                    <AnimatePresence>
                      {showOtpField && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <InputField
                            name="otp"
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            icon={ShieldCheckIcon}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                          />
                          <motion.button
                            type="button"
                            onClick={() => {
                              setIsLoading(true);
                              verifyOtp(formData.emailOrPhone, otp).finally(() => setIsLoading(false));
                            }}
                            disabled={isLoading || otp.length < 6}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full py-4 rounded-xl font-semibold transition-all ${
                              isLoading || otp.length < 6
                                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                            }`}
                          >
                            {isLoading ? (
                              <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            ) : 'Verify OTP'}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700/50" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-gray-900/40 text-gray-500 text-sm">or continue with</span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        text={isLogin ? "signin_with" : "signup_with"}
                        shape="pill"
                        logo_alignment="center"
                        width="320"
                        ux_mode="popup"
                      />
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setAuthMode('totp');
                        if (inputType === 'email' && formData.emailOrPhone) {
                          setFormData(prev => ({ ...prev, email: formData.emailOrPhone }));
                        }
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/30 
                        text-white font-medium transition-all flex items-center justify-center gap-3"
                    >
                      <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                      <span>Authenticator App (TOTP)</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Toggle Mode */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-8"
                >
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({ emailOrPhone: '', email: '', password: '', confirmPassword: '', fullName: '' });
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span className="text-cyan-400 font-semibold hover:underline">
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </span>
                  </button>
                </motion.div>

                {/* Footer Trust */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-4 mt-8 text-xs text-gray-500"
                >
                  <span className="flex items-center gap-1">
                    <LockClosedIcon className="w-3 h-3" /> Secure login
                  </span>
                  <span>•</span>
                  <span>256-bit SSL</span>
                  <span>•</span>
                  <span>Privacy protected</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
