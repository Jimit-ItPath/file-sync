import { Group, Text, ActionIcon, Box } from '@mantine/core';
import { ICONS } from '../../assets/icons';
import { Tooltip } from '../tooltip';
import { useEffect, useState } from 'react';

export const SelectionBar = ({
  count,
  onCancel,
  onDelete,
  onDownload,
  onShare,
  onMove,
  onPaste,
  isMoveMode,
  isPasteEnabled = true,
  displayMoveIcon = true,
  displayDownloadIcon = true,
  displayShareIcon = true,
}: {
  count: number;
  onCancel: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onShare: () => void;
  onMove: () => void;
  onPaste: () => void;
  isMoveMode: boolean;
  isPasteEnabled: boolean;
  displayMoveIcon: boolean;
  displayDownloadIcon: boolean;
  displayShareIcon: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, []);

  return (
    <Box
      style={{
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: 9999,
        margin: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid rgba(200, 200, 200, 0.4)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
      }}
    >
      <Group gap={20}>
        <Text
          fw={600}
          size="sm"
          style={{ whiteSpace: 'nowrap', color: '#202124' }}
        >
          {count} selected
        </Text>

        <Group gap={4} wrap="nowrap">
          {!isMoveMode ? (
            <>
              {displayDownloadIcon && (
                <Tooltip label="Download" fz="xs">
                  <ActionIcon
                    variant="subtle"
                    radius="xl"
                    size="lg"
                    onClick={onDownload}
                    style={{
                      color: '#5f6368',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.transform = 'scale(1.1)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.transform = 'scale(1)')
                    }
                  >
                    <ICONS.IconDownload size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
              {displayShareIcon && (
                <Tooltip label="Share" fz="xs">
                  <ActionIcon
                    variant="subtle"
                    radius="xl"
                    size="lg"
                    onClick={onShare}
                    style={{
                      color: '#5f6368',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.transform = 'scale(1.1)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.transform = 'scale(1)')
                    }
                  >
                    <ICONS.IconShare size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
              {displayMoveIcon && (
                <Tooltip label="Move" fz="xs">
                  <ActionIcon
                    variant="subtle"
                    radius="xl"
                    size="lg"
                    onClick={onMove}
                    style={{
                      color: '#5f6368',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.transform = 'scale(1.1)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.transform = 'scale(1)')
                    }
                  >
                    <ICONS.IconFolderShare size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Delete" fz="xs">
                <ActionIcon
                  variant="subtle"
                  radius="xl"
                  size="lg"
                  color="red"
                  onClick={onDelete}
                  style={{ transition: 'transform 0.15s ease' }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.transform = 'scale(1.1)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.transform = 'scale(1)')
                  }
                >
                  <ICONS.IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            </>
          ) : (
            <Tooltip label="Paste here" fz="xs">
              <ActionIcon
                variant="subtle"
                radius="xl"
                size="lg"
                disabled={!isPasteEnabled}
                onClick={onPaste}
                style={{
                  color: '#5f6368',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = 'scale(1.1)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <ICONS.IconClipboard size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      <ActionIcon
        variant="subtle"
        radius="xl"
        size="lg"
        onClick={onCancel}
        style={{
          color: '#5f6368',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <ICONS.IconX size={18} />
      </ActionIcon>
    </Box>
  );
};
