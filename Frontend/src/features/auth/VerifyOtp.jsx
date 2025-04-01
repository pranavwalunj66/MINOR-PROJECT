import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { setCredentials } from './authSlice';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [attempts, setAttempts] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < 5) {
      const nextInput = element.parentElement.nextElementSibling?.querySelector('input');
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (attempts >= 5) {
      toast.error('Maximum attempts reached. Please try registering again.');
      navigate('/register');
      return;
    }

    if (timeLeft === 0) {
      toast.error('OTP has expired. Please try registering again.');
      navigate('/register');
      return;
    }

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a complete OTP');
      return;
    }

    try {
      const response = await authService.verifyOtp({ email, otp: otpString });
      dispatch(setCredentials(response));
      toast.success('OTP verified successfully!');
      
      // Redirect based on user role
      if (response.user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (error) {
      setAttempts(prev => prev + 1);
      toast.error(error.response?.data?.message || 'Invalid OTP');
      // Clear OTP fields on error
      setOtp(['', '', '', '', '', '']);
      // Focus first input
      document.querySelector('input[name="otp-0"]')?.focus();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-medium text-gray-900 text-center mb-6">
        Verify Your Email
      </h3>
      
      <p className="text-sm text-gray-600 text-center mb-8">
        We've sent a 6-digit OTP to<br />
        <span className="font-medium text-gray-900">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <div key={index} className="w-12">
              <input
                name={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-full h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Time remaining: <span className="font-medium">{formatTime(timeLeft)}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Attempts remaining: <span className="font-medium">{5 - attempts}</span>
          </p>
        </div>

        <div>
          <button
            type="submit"
            className="w-full btn btn-primary"
            disabled={timeLeft === 0 || attempts >= 5}
          >
            Verify OTP
          </button>
        </div>
      </form>

      {timeLeft === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600">OTP has expired</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-2 text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            Try registering again
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyOtp;
