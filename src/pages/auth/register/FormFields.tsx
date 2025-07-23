import { Group, Stack } from '@mantine/core';
import { Input } from '../../../components';
import { useMemo } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

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
  } = methods;

  const firstNameField = useMemo(
    () => registerFormData.find(f => f.name === 'firstName'),
    []
  );
  const lastNameField = useMemo(
    () => registerFormData.find(f => f.name === 'lastName'),
    []
  );
  const otherFields = useMemo(
    () =>
      registerFormData.filter(
        f => f.name !== 'firstName' && f.name !== 'lastName'
      ),
    []
  );

  return (
    <Stack gap={16} mb={6}>
      <Group gap={12} grow>
        <Input
          {...firstNameField}
          error={errors?.firstName?.message || firstNameField?.error}
          radius="md"
          size="md"
          withAsterisk
        />
        <Input
          {...lastNameField}
          error={errors?.lastName?.message || lastNameField?.error}
          radius="md"
          size="md"
          withAsterisk
        />
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
            withAsterisk={isRequired}
            {...props}
          />
        )
      )}
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={import.meta.env.VITE_REACT_APP_CAPTCHA_SITE_KEY || ''}
        onChange={onCaptchaChange}
      />
    </Stack>
  );
};
