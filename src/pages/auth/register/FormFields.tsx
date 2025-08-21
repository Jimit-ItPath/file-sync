import { Group, Stack, Checkbox } from '@mantine/core';
import { Input } from '../../../components';
import { useMemo } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { AUTH_ROUTES } from '../../../routing/routes';

type FormFieldsProps = {
  methods: any;
  registerFormData: any[];
  recaptchaRef: React.RefObject<ReCAPTCHA | null>;
  onCaptchaChange: (token: string | null) => void;
};

export const FormFields: React.FC<FormFieldsProps> = ({
  methods,
  registerFormData,
  recaptchaRef,
  onCaptchaChange = () => {},
}) => {
  const {
    formState: { errors },
    register,
  } = methods;

  const firstNameField = useMemo(
    () => registerFormData.find(f => f.name === 'firstName'),
    []
  );
  const lastNameField = useMemo(
    () => registerFormData.find(f => f.name === 'lastName'),
    []
  );
  const termsAcceptedField = useMemo(
    () => registerFormData.find(f => f.name === 'termsAccepted'),
    []
  );
  const newsletterSubscribedField = useMemo(
    () => registerFormData.find(f => f.name === 'newsletterSubscribed'),
    []
  );
  const otherFields = useMemo(
    () =>
      registerFormData.filter(
        f =>
          f.name !== 'firstName' &&
          f.name !== 'lastName' &&
          f.name !== 'termsAccepted' &&
          f.name !== 'newsletterSubscribed'
      ),
    []
  );

  return (
    <Stack gap={16} mb={6}>
      <Group gap={12} grow align="flex-start">
        <div style={{ flex: 1 }}>
          <Input
            {...firstNameField}
            error={errors?.firstName?.message || firstNameField?.error}
            radius="md"
            size="md"
            withAsterisk
          />
        </div>

        <div style={{ flex: 1 }}>
          <Input
            {...lastNameField}
            error={errors?.lastName?.message || lastNameField?.error}
            radius="md"
            size="md"
            withAsterisk
          />
        </div>
      </Group>
      {otherFields.map(
        ({
          id,
          label,
          placeholder,
          type,
          error,
          name,
          isRequired,
          ...props
        }) => (
          <Input
            key={id}
            name={name}
            label={label}
            placeholder={placeholder}
            type={type}
            error={errors?.[name]?.message || error}
            radius="md"
            size="md"
            pl={name === 'newsletterSubscribed' ? 30 : 0}
            withAsterisk={isRequired}
            {...props}
          />
        )
      )}
      {termsAcceptedField && (
        <Checkbox
          {...register('termsAccepted')}
          label={
            <Group>
              I agree to the{' '}
              <Stack
                // <Link
                // to={AUTH_ROUTES.TERMS_OF_SERVICE.url}
                style={{ color: '#0284c7', textDecoration: 'none' }}
                onClick={e => {
                  e.stopPropagation();
                  window.open(AUTH_ROUTES.TERMS_OF_SERVICE.url, '_blank');
                }}
                ml={-10}
              >
                Terms and Conditions
                {/* </Link> */}
              </Stack>
            </Group>
          }
          error={
            errors?.[termsAcceptedField.name]?.message ||
            termsAcceptedField.error
          }
          radius="md"
          size="md"
        />
      )}
      {newsletterSubscribedField && (
        <Checkbox
          {...register('newsletterSubscribed')}
          label={newsletterSubscribedField.label}
          error={
            errors?.[newsletterSubscribedField.name]?.message ||
            newsletterSubscribedField.error
          }
          radius="md"
          size="md"
          pl={30}
        />
      )}
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={import.meta.env.VITE_REACT_APP_CAPTCHA_SITE_KEY || ''}
        onChange={onCaptchaChange}
      />
    </Stack>
  );
};
