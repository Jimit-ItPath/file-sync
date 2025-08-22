import { ICONS } from '../../assets/icons';

const getFileIcon = (item: {
  entry_type: string;
  mime_type?: string;
  file_extension?: string | null;
  name?: string;
}) => {
  const getIconComponent = (size: number) => {
    const iconSize = size || 20;

    // First handle folders
    if (
      item.entry_type === 'folder' ||
      item.mime_type === 'folder' ||
      item.mime_type === 'application/vnd.google-apps.folder'
    ) {
      return <ICONS.IconFolder size={iconSize} color="#38bdf8" />;
    }

    // Then handle by mime_type if available
    if (item.mime_type) {
      switch (true) {
        case item.mime_type.startsWith('image/'):
          return <ICONS.IconPhoto size={iconSize} color="#3b82f6" />;
        case item.mime_type === 'application/pdf':
          return <ICONS.IconFileTypePdf size={iconSize} color="#ef4444" />;
        case [
          'application/vnd.google-apps.document',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/rtf',
          'text/rtf',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypeDoc size={iconSize} color="#2563eb" />;
        case [
          'application/vnd.google-apps.spreadsheet',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.oasis.opendocument.spreadsheet',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypeXls size={iconSize} color="#16a34a" />;
        case [
          'application/vnd.google-apps.presentation',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.oasis.opendocument.presentation',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypePpt size={iconSize} color="#e11d48" />;
        case ['text/plain', 'text/markdown', 'text/x-markdown'].includes(
          item.mime_type
        ):
          return <ICONS.IconFileTypeTxt size={iconSize} color="#64748b" />;
        case item.mime_type === 'text/csv':
          return <ICONS.IconFileTypeCsv size={iconSize} color="#16a34a" />;
        case [
          'application/zip',
          'application/x-zip-compressed',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          'application/x-tar',
          'application/gzip',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypeZip size={iconSize} color="#7c3aed" />;
        case item.mime_type.startsWith('audio/'):
          return <ICONS.IconDeviceAudioTape size={iconSize} color="#9333ea" />;
        case item.mime_type.startsWith('video/'):
          return <ICONS.IconVideo size={iconSize} color="#dc2626" />;
        case [
          'text/html',
          'text/css',
          'text/javascript',
          'application/javascript',
          'application/json',
          'application/xml',
          'text/x-python',
          'text/x-java-source',
          'text/x-c',
          'text/x-c++',
          'text/x-php',
          'text/x-ruby',
          'text/x-shellscript',
          'application/x-httpd-php',
          'application/x-sh',
          'application/x-typescript',
        ].includes(item.mime_type):
          return <ICONS.IconCode size={iconSize} color="#f59e0b" />;
        case [
          'application/x-sql',
          'application/sql',
          'application/x-sqlite3',
          'application/x-mdb',
        ].includes(item.mime_type):
          return <ICONS.IconDatabase size={iconSize} color="#10b981" />;
        case [
          'application/x-msdownload',
          'application/x-ms-dos-executable',
          'application/x-executable',
          'application/x-mach-binary',
        ].includes(item.mime_type):
          return <ICONS.IconBinary size={iconSize} color="#6b7280" />;
        case [
          'application/epub+zip',
          'application/x-mobipocket-ebook',
          'application/vnd.amazon.ebook',
        ].includes(item.mime_type):
          return <ICONS.IconBook size={iconSize} color="#14b8a6" />;
      }
    }

    // Fall back to file extension if mime_type is not provided or not matched
    const extension =
      item.file_extension || item.name?.split('.')?.pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <ICONS.IconFileTypePdf size={iconSize} color="#ef4444" />;
      case 'doc':
      case 'docx':
        return <ICONS.IconFileTypeDoc size={iconSize} color="#2563eb" />;
      case 'xls':
      case 'xlsx':
        return <ICONS.IconFileTypeXls size={iconSize} color="#16a34a" />;
      case 'ppt':
      case 'pptx':
        return <ICONS.IconFileTypePpt size={iconSize} color="#e11d48" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
      case 'ico':
        return <ICONS.IconPhoto size={iconSize} color="#3b82f6" />;
      case 'txt':
      case 'md':
        return <ICONS.IconFileTypeTxt size={iconSize} color="#64748b" />;
      case 'csv':
        return <ICONS.IconFileTypeCsv size={iconSize} color="#16a34a" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <ICONS.IconFileTypeZip size={iconSize} color="#7c3aed" />;
      // Audio extensions
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
      case 'aac':
      case 'm4a':
        return <ICONS.IconDeviceAudioTape size={iconSize} color="#9333ea" />;
      // Video extensions
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'flv':
      case 'webm':
        return <ICONS.IconVideo size={iconSize} color="#dc2626" />;
      // Code extensions
      case 'html':
      case 'css':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'json':
      case 'xml':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'php':
      case 'rb':
      case 'sh':
        return <ICONS.IconCode size={iconSize} color="#f59e0b" />;
      // Database extensions
      case 'sql':
      case 'db':
      case 'sqlite':
      case 'mdb':
        return <ICONS.IconDatabase size={iconSize} color="#10b981" />;
      // Executable extensions
      case 'exe':
      case 'dmg':
      case 'app':
      case 'msi':
        return <ICONS.IconBinary size={iconSize} color="#6b7280" />;
      // Ebook extensions
      case 'epub':
      case 'mobi':
      case 'azw':
        return <ICONS.IconBook size={iconSize} color="#14b8a6" />;
      default:
        return <ICONS.IconFile size={iconSize} color="#64748b" />;
    }
  };

  return getIconComponent;
};

export default getFileIcon;
