import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, User, Eye, EyeOff, Shield, AlertCircle, Building2 } from 'lucide-react';

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });

  // 检查本地存储是否有记住的邮箱
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // 计算密码强度
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: '弱', color: 'bg-red-500' },
      { strength: 2, label: '较弱', color: 'bg-orange-500' },
      { strength: 3, label: '中等', color: 'bg-yellow-500' },
      { strength: 4, label: '强', color: 'bg-green-400' },
      { strength: 5, label: '很强', color: 'bg-green-600' }
    ];

    return levels[strength - 1] || { strength, label: '', color: '' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = '请输入姓名';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = '姓名至少需要2个字符';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = '为了账户安全，密码建议至少8个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        // 处理记住我
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
      } else {
        await register(formData.name, formData.email, formData.password, formData.department);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
      setError('');
      setErrors({});
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div
        className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 transition-all duration-300 ${
          isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-200">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task Mind
          </h1>
          <p className="text-gray-600 mt-2 font-medium">{isLogin ? '欢迎回来，继续高效工作' : '创建账户，开启智能任务管理'}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 flex items-center gap-2 animate-pulse">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          {!isLogin && (
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                姓名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 text-gray-800 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                    errors.name
                      ? 'border-red-400 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300'
                  }`}
                  placeholder="请输入您的姓名"
                  autoComplete="name"
                />
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  errors.name ? 'text-red-400' : 'text-gray-400'
                }`} />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              邮箱 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 text-gray-800 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300'
                }`}
                placeholder="请输入邮箱地址"
                autoComplete={isLogin ? 'username' : 'email'}
              />
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                errors.email ? 'text-red-400' : 'text-gray-400'
              }`} />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className={`transition-all duration:300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              密码 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 text-gray-800 border-2 rounded-xl focus:outline-none transition transition-all duration-200 ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300'
                }`}
                placeholder={isLogin ? '请输入密码' : '请输入密码（建议8位以上）'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                errors.password ? 'text-red-400' : 'text-gray-400'
              }`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}

            {/* Password Strength Indicator */}
            {!isLogin && formData.password && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.strength <= 2 ? 'text-red-500' :
                    passwordStrength.strength <= 3 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                {passwordStrength.strength < 4 && (
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    建议包含大小写字母、数字和特殊字符
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Department Field */}
          {!isLogin && (
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                部门 <span className="text-gray-400 font-normal">(可选)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300 transition-all duration-200"
                  placeholder="请输入部门名称"
                  autoComplete="organization"
                />
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Remember Me */}
          {isLogin && (
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">记住我</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transform hover:-translate-y-0.5 disabled:hover:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                处理中...
              </span>
            ) : isLogin ? '登录' : '创建账户'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-3">
            {isLogin ? '还没有账户？' : '已有账户？'}
          </p>
          <button
            onClick={toggleMode}
            disabled={isAnimating}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold hover:from-blue-700 hover:to-purple-700 text-base transition-all disabled:opacity-50"
          >
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Task Mind © 2024 · 智能任务管理系统
          </p>
        </div>
      </div>
    </div>
  );
};
