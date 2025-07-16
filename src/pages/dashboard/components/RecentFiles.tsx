import { Group, Box, Text, Grid } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { Button, Card } from '../../../components';

const recentFiles = [
  {
    icon: ICONS.IconFileTypePdf,
    iconColor: '#ef4444',
    name: 'Project_Report.pdf',
    modified: 'Modified 2 hours ago',
    size: '4.2 MB',
  },
  {
    icon: ICONS.IconFileTypeXls,
    iconColor: '#22c55e',
    name: 'Financial_Data.xlsx',
    modified: 'Modified yesterday',
    size: '2.8 MB',
  },
  {
    icon: ICONS.IconPhoto,
    iconColor: '#a78bfa',
    name: 'Design_Mockup.png',
    modified: 'Modified 3 days ago',
    size: '8.5 MB',
  },
  {
    icon: ICONS.IconFileTypeDoc,
    iconColor: '#3b82f6',
    name: 'Meeting_Notes.docx',
    modified: 'Modified 5 days ago',
    size: '1.2 MB',
  },
];

const CARD_HEIGHT = 140;

const RecentFiles = () => (
  <Box mb={32}>
    <Group justify="space-between" mb={16}>
      <Text fw={600} fz="lg" c="gray.9">
        Recent Files
      </Text>
      <Button
        variant="subtle"
        color="blue"
        size="xs"
        style={{ fontWeight: 500 }}
      >
        View All
      </Button>
    </Group>
    <Grid gutter={16}>
      {recentFiles.map(file => (
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={file.name}>
          <Card
            // shadow={false}
            radius={16}
            p={0}
            style={{
              height: CARD_HEIGHT,
              background: '#f6faff',
              border: '1px solid #e5e7eb',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px 0 rgba(60,72,88,0.04)',
              transition: 'box-shadow 0.15s',
              overflow: 'hidden',
            }}
          >
            <Box px={20} pt={20} pb={0} style={{ flex: 1 }}>
              <Group justify="flex-start" mb={16}>
                <file.icon size={40} color={file.iconColor} />
              </Group>
              <Text fw={500} fz="sm" mb={2} truncate="end">
                {file.name}
              </Text>
            </Box>
            <Group
              justify="space-between"
              align="center"
              px={20}
              pb={12}
              style={{ background: 'transparent' }}
            >
              <Text
                fz="xs"
                c="gray.6"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {file.modified} • {file.size}
              </Text>
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                pos="absolute"
                right={10}
                style={{
                  padding: 0,
                  minWidth: 0,
                  width: 28,
                  height: 28,
                }}
                aria-label={`More options for ${file.name}`}
              >
                <ICONS.IconDotsVertical size={18} color="#94a3b8" />
              </Button>
            </Group>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  </Box>
);

export default RecentFiles;
