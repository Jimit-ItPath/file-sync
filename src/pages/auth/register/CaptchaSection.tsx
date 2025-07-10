import { Checkbox, Box, Group, rem } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface CaptchaSectionProps {
  isVerified: boolean;
  onChange: (verified: boolean) => void;
}

export const CaptchaSection: React.FC<CaptchaSectionProps> = ({
  isVerified,
  onChange,
}) => {
  return (
    <Box
      p="md"
      mb={5}
      bg="gray.0"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: rem(8),
      }}
    >
      <Group justify="space-between" align="center">
        <Checkbox
          label="I'm not a robot"
          checked={isVerified}
          onChange={e => onChange(e.currentTarget.checked)}
          size="sm"
        />
        <ICONS.IconInfoSquareRounded size={18} color="#64748b" />
      </Group>
    </Box>
  );
};
