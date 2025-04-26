
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { userType } = useParams<{ userType: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine the user role from URL params
  let role: UserRole = null;
  let pageTitle = '';
  
  switch (userType) {
    case 'super-admin':
      role = 'SUPER_ADMIN';
      pageTitle = 'Super Admin Login';
      break;
    case 'org-admin':
      role = 'ORG_ADMIN';
      pageTitle = 'Organization Admin Login';
      break;
    case 'individual':
      role = 'INDIVIDUAL';
      pageTitle = 'Individual Login';
      break;
    default:
      // If no valid user type, navigate to landing page
      navigate('/');
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (!role) {
      toast.error('Invalid user type');
      return;
    }

    setIsLoading(true);
    try {
      await login(data.email, data.password, role);
      // Redirecting is handled inside the login function
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-4">
            <Link to="/" className="text-gray-500 hover:text-brand-blue mr-4">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-brand-blue">Nandha</span>
              <span className="text-xl font-semibold text-brand-black">Garments</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">{pageTitle}</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                        disabled={isLoading}
                        className="input-field"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          {...field}
                          disabled={isLoading}
                          className="input-field pr-10"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-brand-blue hover:bg-brand-dark"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {userType === 'individual' && (
            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account?</span>{' '}
              <Link to="/signup" className="text-brand-blue hover:underline font-medium">
                Sign up
              </Link>
            </div>
          )}
          {role === 'SUPER_ADMIN' && (
            <div className="text-center text-xs text-gray-500 mt-4">
              <p>Initial super admin credentials:</p>
              <p>Email: mk@admin.com, Password: mk@admin</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
