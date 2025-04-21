import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../components/SignInForm';
import { useAuth } from '../hooks/useAuth';
import '../styles/signin.css';

const SignIn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <div className="flex flex-col justify-center items-center flex-grow translate-y-[10vh]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignInForm />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
