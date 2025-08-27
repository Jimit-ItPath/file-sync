import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NAME_REGEX, PHONE_REGEX } from '../../../utils/constants';
import { contactUs } from '../../../store/slices/auth.slice';
import { useAppDispatch } from '../../../store';
import { notifications } from '@mantine/notifications';
import { useCallback, useRef, useState } from 'react';
import type ReCAPTCHA from 'react-google-recaptcha';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(20, 'Name must be less than 20 characters')
    .regex(
      NAME_REGEX,
      'Name must contain only letters, spaces, hyphens, and apostrophes'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
  contact_number: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || PHONE_REGEX.test(val), {
      message: 'Invalid contact number format',
    }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

const defaultValues: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
  contact_number: '',
};

const useContact = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const dispatch = useAppDispatch();
  const methods = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onCaptchaChange = useCallback((token: string | null) => {
    if (token) {
      setCaptchaToken(token);
    } else {
      setCaptchaToken('');
    }
  }, []);

  const handleContactSubmit = async (data: ContactFormValues) => {
    try {
      const response: any = await dispatch(
        contactUs({ ...data, captcha_token: captchaToken })
      ).unwrap();
      if (response?.success === 1) {
        notifications.show({
          message: response?.message || 'Message sent successfully',
          color: 'green',
        });
        methods.reset();
        setCaptchaToken('');
        recaptchaRef.current?.reset();
      } else {
        notifications.show({
          message: response?.message || 'Failed to send message',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        message: error || error?.message || 'Failed to send message',
        color: 'red',
      });
    }
  };

  const contactFormData = [
    {
      id: 'name',
      label: 'Your Name',
      placeholder: 'Enter your full name',
      type: 'text',
      name: 'name',
      isRequired: true,
    },
    {
      id: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      type: 'email',
      name: 'email',
      isRequired: true,
    },
    {
      id: 'contact_number',
      label: 'Contact Number',
      placeholder: 'Enter your contact number',
      type: 'phone-number',
      name: 'contact_number',
      isRequired: false,
    },
    {
      id: 'subject',
      label: 'Subject',
      placeholder: 'Enter subject',
      type: 'text',
      name: 'subject',
      isRequired: true,
    },
    {
      id: 'message',
      label: 'Message',
      placeholder: 'Write your message...',
      type: 'textarea',
      name: 'message',
      isRequired: true,
    },
  ];

  return {
    methods,
    handleContactSubmit: methods.handleSubmit(handleContactSubmit),
    contactFormData,
    recaptchaRef,
    onCaptchaChange,
  };
};

export default useContact;
