import {
  Breadcrumbs as MantineBreadcrumbs,
  Anchor,
  Group,
  Text,
} from '@mantine/core';
import { ICONS } from '../../assets/icons';

interface BreadcrumbItem {
  id?: string | null;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId?: string | null) => void;
}

export const Breadcrumbs = ({ items, onNavigate }: BreadcrumbsProps) => {
  return (
    <Group align="center" style={{ userSelect: 'none' }}>
      <MantineBreadcrumbs
        separator={<ICONS.IconChevronRight size={16} color="#868e96" />}
        styles={{
          root: {
            padding: '6px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
          },
          separator: { margin: '0 6px' },
        }}
      >
        {[{ id: null, name: 'All Files' }, ...items].map((item, index) => {
          const isLast = index === items.length;
          return (
            <Anchor
              onClick={() => {
                window.getSelection()?.removeAllRanges();
                if (isLast) return;
                onNavigate(item?.id);
              }}
              key={index}
              style={{
                cursor: isLast ? 'not-allowed' : 'pointer',
                fontWeight: isLast ? 700 : 500,
                color: isLast ? '#212529' : '#495057',
                whiteSpace: 'nowrap',
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1c7ed6')}
              onMouseLeave={e =>
                (e.currentTarget.style.color = isLast ? '#212529' : '#495057')
              }
            >
              <Text size="sm" fw={isLast ? 700 : 500} lineClamp={1}>
                {item.name}
              </Text>
            </Anchor>
          );
        })}
      </MantineBreadcrumbs>
    </Group>
  );
};
