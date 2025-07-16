import { Card, Group, Avatar, Text, Grid, ActionIcon } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import type { FileType } from '../use-dashboard';
import { Menu } from '../../../components';

type FileGridProps = {
  files: FileType[];
};

const getIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return <ICONS.IconFolder size={32} color="#38bdf8" />;
    case 'pdf':
      return <ICONS.IconFileTypePdf size={32} color="#ef4444" />;
    // Add more types as needed
    default:
      return <ICONS.IconFile size={32} color="#64748b" />;
  }
};

const MENU_ITEMS = [{ id: 'delete', label: 'Delete', icon: ICONS.IconTrash }];

const FileGrid: React.FC<FileGridProps> = ({ files }) => (
  <Grid gutter={20}>
    {files.map(file => (
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
        <Card
          radius="md"
          shadow="sm"
          p="lg"
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#f6faff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Group justify="space-between" mb={12}>
            {getIcon(file.icon)}
            <Menu items={MENU_ITEMS} onItemClick={() => {}}>
              <ActionIcon variant="subtle" color="gray">
                <ICONS.IconDotsVertical size={18} />
              </ActionIcon>
            </Menu>
          </Group>
          <Text fw={600} fz="sm" mb={4} truncate>
            {file.name}
          </Text>
          <Group gap={8} mt={8}>
            <Avatar src={file.owner.avatar} radius="xl" size="sm" color="blue">
              {file.owner.initials}
            </Avatar>
            <Text size="sm" truncate>
              {file.owner.name}
            </Text>
          </Group>
          <Group justify="space-between" mt={8}>
            <Text size="xs" c="gray.6">
              {file.lastModified}
            </Text>
            <Text size="xs" c="gray.6">
              {file.size}
            </Text>
          </Group>
        </Card>
      </Grid.Col>
    ))}
  </Grid>
);

export default FileGrid;
