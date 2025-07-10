import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../../api';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { passwordRequirements } from '../../../components/inputs/password-input';
import { notifications } from '@mantine/notifications';

// Define Zod schema for form validation
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(20, 'First name must be less than 20 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be less than 20 characters'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(val => passwordRequirements.every(req => req.re.test(val)), {
      message:
        'Password must include uppercase, lowercase, number, and special symbol',
    }),
  captchaVerified: z.literal(true, {
    errorMap: () => ({ message: 'Please verify the captcha' }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  newsletterSubscribed: z.boolean().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const useRegister = () => {
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      captchaVerified: false as any,
      termsAccepted: false as any,
      newsletterSubscribed: false,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const [onSubmit, loading] = useAsyncOperation(
    async (data: RegisterFormData) => {
      const response = await api.auth.register({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
        },
      });

      if (response?.data?.success || response?.status === 201) {
        notifications.show({
          message: response?.data?.message || 'Your account has been created!',
          color: 'green',
        });
        reset();
      }
    }
  );

  const getRegisterFormData = useCallback(
    () => [
      {
        id: 'firstName',
        name: 'firstName',
        placeholder: 'Enter your first name',
        type: 'text',
        label: 'First name',
        isRequired: true,
        error: errors.firstName?.message,
      },
      {
        id: 'lastName',
        name: 'lastName',
        placeholder: 'Enter your last name',
        type: 'text',
        label: 'Last name',
        isRequired: true,
        error: errors.lastName?.message,
      },
      {
        id: 'email',
        name: 'email',
        placeholder: 'Enter your email',
        type: 'email',
        label: 'Email address',
        isRequired: true,
        error: errors.email?.message,
      },
      {
        id: 'password',
        name: 'password',
        placeholder: 'Enter Password',
        label: 'Password',
        type: 'password-input',
        showIcon: true,
        isRequired: true,
        error: errors.password?.message,
        strengthMeter: true,
      },
      {
        id: 'captchaVerified',
        name: 'captchaVerified',
        type: 'checkbox',
        label: 'I am not a robot',
        isRequired: true,
        error: errors.captchaVerified?.message,
      },
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
  };
};

export default useRegister;
