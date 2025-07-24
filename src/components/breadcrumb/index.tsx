import { Breadcrumbs as MantineBreadcrumbs, Group } from '@mantine/core';
import { ICONS } from '../../assets/icons';
import { DroppableBreadcrumb } from './DroppableBreadcrumb';

interface BreadcrumbItem {
  id?: string | null;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId?: string | null) => void;
  canDropOnBreadcrumb: (folderId: string | null | undefined) => boolean;
  isDragActive: boolean;
}

export const Breadcrumbs = ({
  items,
  onNavigate,
  canDropOnBreadcrumb = () => true,
  isDragActive,
}: BreadcrumbsProps) => {
  const allItems = [{ id: null, name: 'All Files' }, ...items];

  return (
    <Group align="center" style={{ userSelect: 'none' }}>
      <MantineBreadcrumbs
        separator={<ICONS.IconChevronRight size={16} color="#868e96" />}
        styles={{
          root: {
            padding: 0,
            backgroundColor: 'transparent',
            borderRadius: 8,
          },
          separator: { margin: '0 6px' },
        }}
      >
        {allItems.map((item, index) => {
          // const isLast = index === items.length;
          const isLast = index === allItems.length - 1;
          const canDrop = canDropOnBreadcrumb(item.id);

          return (
            <DroppableBreadcrumb
              key={index}
              item={item}
              isLast={isLast}
              canDrop={canDrop}
              isDragActive={isDragActive}
              onNavigate={onNavigate}
            />
          );
        })}
      </MantineBreadcrumbs>
    </Group>
  );
};
