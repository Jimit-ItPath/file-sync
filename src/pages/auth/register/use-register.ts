import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../../api';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { notifications } from '@mantine/notifications';
import { NAME_REGEX, passwordRequirements } from '../../../utils/constants';
import ReCAPTCHA from 'react-google-recaptcha';
import { AUTH_ROUTES } from '../../../routing/routes';
import { useNavigate } from 'react-router';

// Define Zod schema for form validation
const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(20, 'First name must be less than 20 characters')
    .regex(
      NAME_REGEX,
      'First name must contain only letters, spaces, hyphens, and apostrophes'
    ),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be less than 20 characters')
    .regex(
      NAME_REGEX,
      'Last name must contain only letters, spaces, hyphens, and apostrophes'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .trim()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .refine(val => passwordRequirements.every(req => req.re.test(val)), {
      message:
        'Password must include uppercase, lowercase, number, and special symbol',
    }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  newsletterSubscribed: z.boolean().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const useRegister = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      termsAccepted: false as any,
      newsletterSubscribed: false,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  const termsAccepted = watch('termsAccepted');
  useEffect(() => {
    if (termsAccepted) {
      setValue('newsletterSubscribed', true);
    }
  }, [termsAccepted, setValue]);

  const toggleRegisterForm = useCallback(() => {
    setShowRegisterForm(prev => !prev);
  }, []);

  const onCaptchaChange = useCallback((token: string | null) => {
    if (token) {
      setCaptchaToken(token);
    } else {
      setCaptchaToken('');
    }
  }, []);

  const [onSubmit, loading] = useAsyncOperation(
    async (data: RegisterFormData) => {
      if (!captchaToken) {
        notifications.show({
          message: 'Please verify that you are not a robot',
          color: 'red',
        });
        return;
      }
      const response = await api.auth.register({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
          captcha_token: captchaToken,
        },
      });

      if (response?.data?.success || response?.status === 201) {
        setRegistrationSuccess(true);
        notifications.show({
          message: response?.data?.message || 'Your account has been created!',
          color: 'green',
        });
        reset();
        setCaptchaToken('');
        recaptchaRef.current?.reset();
      }
    }
  );

  const backToRegistrationForm = useCallback(() => {
    setRegistrationSuccess(false);
    navigate(AUTH_ROUTES.LOGIN.url);
  }, []);

  const getRegisterFormData = useCallback(
    () => [
      {
        id: 'firstName',
        name: 'firstName',
        placeholder: 'Enter first name',
        type: 'text',
        label: 'First name',
        isRequired: true,
        error: errors.firstName?.message,
      },
      {
        id: 'lastName',
        name: 'lastName',
        placeholder: 'Enter last name',
        type: 'text',
        label: 'Last name',
        isRequired: true,
        error: errors.lastName?.message,
      },
      {
        id: 'email',
        name: 'email',
        placeholder: 'Enter email',
        type: 'email',
        label: 'Email address',
        isRequired: true,
        error: errors.email?.message,
      },
      {
        id: 'password',
        name: 'password',
        placeholder: 'Enter password',
        label: 'Password',
        type: 'password-input',
        showIcon: true,
        isRequired: true,
        error: errors.password?.message,
        strengthMeter: true,
      },
      // {
      //   id: 'captchaVerified',
      //   name: 'captchaVerified',
      //   type: 'checkbox',
      //   label: 'Verify you are human',
      //   isRequired: true,
      //   error: errors.captchaVerified?.message,
      // },
      {
        id: 'termsAccepted',
        name: 'termsAccepted',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        isRequired: true,
        error: errors.termsAccepted?.message,
      },
      {
        id: 'newsletterSubscribed',
        name: 'newsletterSubscribed',
        type: 'checkbox',
        label: 'Subscribe to our newsletter',
        isRequired: false,
      },
    ],
    [errors]
  );

  return {
    registerFormData: getRegisterFormData(),
    handleRegisterSubmit: handleSubmit(onSubmit),
    isLoading: loading,
    methods,
    recaptchaRef,
    onCaptchaChange,
    toggleRegisterForm,
    showRegisterForm,
    registrationSuccess,
    backToRegistrationForm,
    navigate,
  };
};

export default useRegister;
