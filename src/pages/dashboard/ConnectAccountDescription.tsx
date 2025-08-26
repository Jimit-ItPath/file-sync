import { Text } from '@mantine/core';
import useResponsive from '../../hooks/use-responsive';

const ConnectAccountDescription = () => {
  const { isXs } = useResponsive();
  return (
    <Text size="sm" c="dimmed" lh={1.6}>
      <Text size="sm" fw={600}>
        Why you can trust All Cloud Hub:
      </Text>
      <ul
        style={{
          paddingLeft: 16,
          margin: 0,
          fontSize: isXs ? 12 : 14,
          color: '#6b7280',
          lineHeight: 1.6,
        }}
      >
        <li>🔒 We never store, read, or misuse your files or personal data.</li>
        <li>
          ✅ All connections are secured using industry-standard OAuth with your
          explicit permission.
        </li>
        <li>
          🗂️ Your files always remain in your connected cloud accounts — we do
          not duplicate or move them.
        </li>
        <li>
          📁 All Cloud Hub simply unifies your Google Drive, Dropbox, and
          OneDrive accounts into one smart dashboard.
        </li>
        <li>
          ✨ Our goal is to help you manage everything in one place — securely
          and efficiently.
        </li>
      </ul>
    </Text>
  );
};

export default ConnectAccountDescription;
