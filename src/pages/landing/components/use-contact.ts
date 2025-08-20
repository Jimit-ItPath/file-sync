import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NAME_REGEX } from '../../../utils/constants';

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
});

export type ContactFormValues = z.infer<typeof contactSchema>;

const defaultValues: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const useContact = () => {
  const methods = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: 'onChange',
  });

  const handleContactSubmit = (data: ContactFormValues) => {
    // Here you can integrate API call (e.g., send to backend)
    console.log('Contact form submitted:', data);
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
  };
};

export default useContact;
