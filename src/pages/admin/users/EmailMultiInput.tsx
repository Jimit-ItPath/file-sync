import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { EMAIL_REGEX } from '../../../utils/constants';
import { MultiSelect, Stack, Text } from '@mantine/core';

interface EmailMultiInputProps {
  inviteUserMethods: UseFormReturn<
    {
      emails: string[];
    },
    any,
    {
      emails: string[];
    }
  >;
  inviteUserLoading: boolean;
}

const EmailMultiInput: React.FC<EmailMultiInputProps> = ({
  inviteUserLoading = false,
  inviteUserMethods,
}) => {
  const [inputValue, setInputValue] = useState('');

  const emails = inviteUserMethods.watch('emails') || [];

  const addEmail = (email: string) => {
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) return;

    if (!emails.includes(trimmed)) {
      inviteUserMethods.setValue('emails', [...emails, trimmed], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (EMAIL_REGEX.test(inputValue.trim())) {
        addEmail(inputValue);
        setInputValue('');
      }
    }
  };

  return (
    <Stack gap="xs">
      <MultiSelect
        label="User Emails"
        placeholder={
          !emails?.length ? 'Type email and press Enter or Comma' : ''
        }
        data={[]}
        value={emails}
        searchable
        clearable
        withAsterisk
        error={inviteUserMethods.formState.errors.emails?.message}
        onChange={values => inviteUserMethods.setValue('emails', values)}
        onKeyDown={handleKeyDown}
        searchValue={inputValue}
        onSearchChange={setInputValue}
        disabled={inviteUserLoading}
        maxValues={100}
        // nothingFoundMessage="Type a valid email and press Enter"
        styles={{
          input: { minHeight: '40px' },
        }}
      />

      <Text size="xs" c="dimmed">
        You can invite multiple users. Type an email and press comma or enter.
      </Text>
    </Stack>
  );
};

export default EmailMultiInput;
