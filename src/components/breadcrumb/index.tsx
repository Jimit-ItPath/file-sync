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
  onNavigate: (folderId?: string | null) => void;
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
    <Group align="center" style={{ userSelect: 'none', minWidth: 0 }}>
      <MantineBreadcrumbs
        separator={<ICONS.IconChevronRight size={14} color="#868e96" />}
        styles={{
          root: {
            padding: 0,
            minWidth: 0,
          },
          breadcrumb: {
            color: '#6b7280',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
            minWidth: 0,
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
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
          separator: {
            color: '#d1d5db',
            margin: '0 2px',
            fontSize: '12px',
            flexShrink: 0,
          },
        }}
      >
        {displayItems.map((item, index) => {
          const isEllipsis = item.name === '...';
          const isLast = index === displayItems.length - 1;

          if (isEllipsis) {
            return (
              <Text
                key="ellipsis"
                style={{
                  color: '#6b7280',
                  fontSize: '13px',
                  userSelect: 'none',
                  cursor: 'default',
                  padding: '0 4px',
                  flexShrink: 0,
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
                if (isLast) return;
                onNavigate(item?.id);
              }}
              key={index}
              style={{
                cursor: isLast ? 'default' : 'pointer',
                fontWeight: isLast ? 600 : 500,
                color: isLast ? '#212529' : '#495057',
                minWidth: 0,
                maxWidth: isLast ? '140px' : '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e =>
                !isLast && (e.currentTarget.style.color = '#1c7ed6')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.color = isLast ? '#212529' : '#495057')
              }
            >
              <Tooltip
                label={item.name}
                fz={'xs'}
                disabled={item.name.length < 15}
              >
                <Text
                  size="sm"
                  fw={isLast ? 600 : 500}
                  truncate
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}
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
