import { useState } from 'react';
import { TextInput, Text, Group, ActionIcon, Progress } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const getPasswordStrength = (password: string) => {
  if (password.length === 0) {
    return { text: '', color: '', percent: 0 };
  }
  if (password.length < 6) {
    return { text: 'Weak', color: 'red', percent: 33 };
  }
  if (password.length < 10) {
    return { text: 'Medium', color: 'yellow', percent: 66 };
  }
  return { text: 'Strong', color: 'green', percent: 100 };
};

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = getPasswordStrength(value);

  return (
    <div>
      <TextInput
        id="password"
        label="Password"
        placeholder="Create a password"
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.currentTarget.value)}
        radius="md"
        size="md"
        rightSection={
          <ActionIcon
            variant="subtle"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <ICONS.IconEyeOff size={18} color="#000" />
            ) : (
              <ICONS.IconEye size={18} color="#000" />
            )}
          </ActionIcon>
        }
        autoComplete="new-password"
      />
      <Group gap={8} mt={4} align="center">
        <Text size="xs" c="dimmed">
          Password strength:
        </Text>
        <Text size="xs" c={strength.color}>
          {strength.text}
        </Text>
      </Group>
      <Progress
        value={strength.percent}
        color={strength.color}
        size="xs"
        radius="md"
        mt={4}
        aria-label="Password strength"
      />
    </div>
  );
};
