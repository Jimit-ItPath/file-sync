import {
  Group,
  Text,
  useMantineTheme,
  rem,
  Box,
  ActionIcon,
} from '@mantine/core';
import {
  Dropzone as MantineDropzone,
  type DropzoneProps,
  type FileWithPath,
} from '@mantine/dropzone';
import { ICONS } from '../../../assets/icons';
import { Image } from '../../image';
import { Tooltip } from '../../tooltip';
import { formatFileSize } from '../../../utils/helper';

interface CustomDropzoneProps extends Partial<DropzoneProps> {
  onFilesSelected: (files: File[]) => void;
  getFileIcon: (item: {
    entry_type: string;
    mime_type?: string;
    file_extension?: string | null;
    name?: string;
  }) => (size: number) => React.ReactNode;
  files: File[];
  handleRemoveUploadedFile?: (idx: number) => void;
}

export function Dropzone({
  onFilesSelected,
  getFileIcon,
  files = [],
  handleRemoveUploadedFile = () => {},
  ...props
}: CustomDropzoneProps) {
  const theme = useMantineTheme();

  const previews = files?.map((file: FileWithPath, idx) => {
    const isImage = file.type.startsWith('image/');
    return (
      <Group
        key={file.name}
        align="center"
        style={{
          padding: rem(8),
          border: `1px solid ${theme.colors.gray[3]}`,
          borderRadius: rem(6),
          backgroundColor: theme.white,
          cursor: 'default',
          display: 'flex',
          width: '100%',
          pointerEvents: 'auto',
        }}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <Box
          style={{
            width: rem(60),
            height: rem(60),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: rem(4),
            backgroundColor: theme.colors.gray[0],
            flexShrink: 0,
            marginRight: rem(12),
          }}
        >
          {isImage ? (
            <Image
              src={URL.createObjectURL(file)}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'cover',
              }}
              alt={file.name}
            />
          ) : (
            getFileIcon({
              entry_type: file.type,
              mime_type: file.type,
              file_extension: file.type,
              name: file.name,
            })(40)
          )}
        </Box>
        <Tooltip label={file.name} fz={'xs'}>
          <Text
            size="sm"
            lineClamp={1}
            style={{
              wordBreak: 'break-word',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {file.name}
          </Text>
        </Tooltip>
        <Text size="sm">({formatFileSize(file.size.toString())})</Text>
        {/* Delete Icon */}
        <Tooltip label="Remove File" fz="xs">
          <ActionIcon
            variant="subtle"
            radius="xl"
            size="lg"
            color="red"
            onClick={e => {
              e.stopPropagation();
              handleRemoveUploadedFile?.(idx);
            }}
            style={{ transition: 'transform 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <ICONS.IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  });

  return (
    <MantineDropzone
      onDrop={files => onFilesSelected(files)}
      multiple={props.multiple}
      {...props}
      style={{ pointerEvents: 'auto' }}
    >
      <Group
        align="center"
        justify="center"
        style={{ minHeight: rem(220), pointerEvents: 'none' }}
      >
        <MantineDropzone.Accept>
          <ICONS.IconUpload
            size="3.2rem"
            stroke={1.5}
            color={theme.colors[theme.primaryColor][6]}
          />
        </MantineDropzone.Accept>
        <MantineDropzone.Reject>
          <ICONS.IconX size="3.2rem" stroke={1.5} color={theme.colors.red[6]} />
        </MantineDropzone.Reject>
        <MantineDropzone.Idle>
          <ICONS.IconCloud size="3.2rem" stroke={1.5} />
        </MantineDropzone.Idle>

        <div>
          <Text size="xl" inline>
            {!props.multiple
              ? 'Drag a file here or click to select a file'
              : 'Drag files here or click to select files'}
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            {!props.multiple
              ? 'Attach a file, should not exceed 5mb'
              : 'Attach as many files as you like, each file should not exceed 5mb'}
          </Text>
        </div>
      </Group>
      {previews && previews?.length ? (
        <Box
          mt="md"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: rem(16),
            maxWidth: '100%',
            pointerEvents: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {previews}
        </Box>
      ) : null}
    </MantineDropzone>
  );
}
