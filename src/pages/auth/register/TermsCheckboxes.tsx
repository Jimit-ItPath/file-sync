import { Checkbox, Stack, Text } from '@mantine/core';

interface TermsCheckboxesProps {
  termsAccepted: boolean;
  newsletterSubscribed: boolean;
  onTermsChange: (accepted: boolean) => void;
  onNewsletterChange: (subscribed: boolean) => void;
}

export const TermsCheckboxes: React.FC<TermsCheckboxesProps> = ({
  termsAccepted,
  newsletterSubscribed,
  onTermsChange,
  onNewsletterChange,
}) => {
  return (
    <Stack gap={8} mb={6}>
      <Checkbox
        checked={termsAccepted}
        onChange={e => onTermsChange(e.currentTarget.checked)}
        size="sm"
        label={
          <Text span fz="sm" c="gray.7">
            I agree to the{' '}
            <Text span c="blue" component="a" href="#">
              Terms & Conditions
            </Text>
          </Text>
        }
      />
      <Checkbox
        checked={newsletterSubscribed}
        onChange={e => onNewsletterChange(e.currentTarget.checked)}
        size="sm"
        label={
          <Text span fz="sm" c="gray.7">
            Subscribe to our newsletter
          </Text>
        }
      />
    </Stack>
  );
};
