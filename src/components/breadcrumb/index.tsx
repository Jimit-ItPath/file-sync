import {
  Breadcrumbs as MantineBreadcrumbs,
  Anchor,
  Group,
  Text,
} from '@mantine/core';
import { ICONS } from '../../assets/icons';
import { Tooltip } from '../tooltip';

interface BreadcrumbItem {
  id?: string | null;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  // onNavigate: (folderId?: string | null) => void;
  onNavigate: (folder: { id?: string | null; name: string } | null) => void;
}

export const Breadcrumbs = ({ items, onNavigate }: BreadcrumbsProps) => {
  let displayItems: (BreadcrumbItem | { name: string; id?: string | null })[] =
    [];
  if (items?.length + 1 > 3) {
    // +1 because we prepend {id:null, name:'All Files'}
    const allFilesItem = { id: null, name: 'All Files' };
    const allItems = [allFilesItem, ...items];
    displayItems = [
      allItems[0], // first
      { name: '...' }, // ellipsis placeholder
      allItems[allItems.length - 2], // second last
      allItems[allItems.length - 1], // last
    ];
  } else {
    displayItems = [{ id: null, name: 'All Files' }, ...items];
  }

  return (
    <Group align="center" style={{ userSelect: 'none' }}>
      <MantineBreadcrumbs
        separator={<ICONS.IconChevronRight size={16} color="#868e96" />}
        styles={{
          root: {
            // padding: '6px 12px',
            // backgroundColor: '#f8f9fa',
            // borderRadius: 8,
            padding: 0,
          },
          breadcrumb: {
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            // padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: '#e2e8f0',
              color: '#374151',
            },
            '&[data-active]': {
              color: '#1e7ae8',
              backgroundColor: '#eff6ff',
              fontWeight: 600,
            },
          },
          separator: { color: '#d1d5db', margin: '0 4px', fontSize: '14px' },
        }}
      >
        {displayItems.map((item, index) => {
          const isEllipsis = item.name === '...';
          const isLast =
            index === displayItems.length - 1 || index === displayItems.length;

          if (isEllipsis) {
            return (
              <Text
                key="ellipsis"
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  userSelect: 'none',
                  cursor: 'default',
                  padding: '0 8px',
                }}
              >
                ...
              </Text>
            );
          }

          return (
            <Anchor
              onClick={() => {
                window.getSelection()?.removeAllRanges();
                // onNavigate(item?.id);
                // onNavigate(item.id === null ? null : item);
                if (isLast) return;
                onNavigate(item);
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
              <Tooltip label={item.name} fz={'xs'}>
                <Text
                  size="sm"
                  fw={isLast ? 700 : 500}
                  lineClamp={1}
                  truncate
                  miw={0}
                  maw={150}
                >
                  {item.name}
                </Text>
              </Tooltip>
            </Anchor>
          );
        })}
      </MantineBreadcrumbs>
    </Group>
  );
};
