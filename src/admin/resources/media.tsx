import {
  List,
  Datagrid,
  TextField,
  DateField,
  DeleteButton,
  useRecordContext,
  FunctionField,
  Filter,
  TextInput,
} from 'react-admin';

const MediaFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search by filename" source="filename" alwaysOn />
    <TextInput label="Memory Slug" source="memorySlug" />
  </Filter>
);

const MediaPreview = () => {
  const record = useRecordContext();
  if (!record) return null;

  const isVideo = record.mimeType?.startsWith('video/');

  if (isVideo) {
    return (
      <video
        src={record.url}
        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
        controls
      />
    );
  }

  return (
    <img
      src={record.url}
      alt={record.filename}
      style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
    />
  );
};

export const MediaList = () => (
  <List filters={<MediaFilter />} perPage={25}>
    <Datagrid>
      <FunctionField label="Preview" render={() => <MediaPreview />} />
      <TextField source="filename" />
      <TextField source="mimeType" label="Type" />
      <FunctionField
        label="Size"
        render={(record: any) => {
          const sizeInMB = (record.fileSize / (1024 * 1024)).toFixed(2);
          return `${sizeInMB} MB`;
        }}
      />
      <TextField source="memory.title" label="Memory" />
      <TextField source="memory.slug" label="Memory Slug" />
      <DateField source="uploadedAt" showTime />
      <DeleteButton
        confirmTitle="Delete this media?"
        confirmContent="This action cannot be undone. The file will be permanently deleted from storage."
      />
    </Datagrid>
  </List>
);
