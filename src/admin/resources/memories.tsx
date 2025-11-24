import {
  List,
  Datagrid,
  TextField,
  DateField,
  ImageField,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  ImageInput,
  required,
  Show,
  SimpleShowLayout,
  UrlField,
  NumberField,
  DeleteButton,
  EditButton,
  useRecordContext,
} from 'react-admin';

export const MemoryList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="title" />
      <TextField source="slug" label="Memory ID" />
      <ImageField source="coverUrl" label="Cover" />
      <DateField source="eventDate" />
      <NumberField source="mediaCount" label="Media Items" />
      <DateField source="createdAt" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const MemoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} fullWidth />
      <TextInput source="description" multiline rows={4} fullWidth />
      <DateTimeInput source="eventDate" validate={[required()]} />
      <ImageInput source="cover" label="Cover Image" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

export const MemoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} fullWidth />
      <TextInput source="description" multiline rows={4} fullWidth />
      <DateTimeInput source="eventDate" validate={[required()]} />
      <ImageInput source="cover" label="Cover Image (leave empty to keep current)" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
      <ImageField source="coverUrl" label="Current Cover Image" />
    </SimpleForm>
  </Edit>
);

const MemoryUrlField = () => {
  const record = useRecordContext();
  if (!record || !record.slug) return null;

  const memoryUrl = `${window.location.origin}/memory/${record.slug}`;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Memory URL</h3>
      <p>
        Share this link or QR code with guests:
        <br />
        <a
          href={memoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
        >
          {memoryUrl}
        </a>
      </p>
    </div>
  );
};

export const MemoryShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="slug" label="Memory ID" />
      <TextField source="description" />
      <DateField source="eventDate" />
      <ImageField source="coverUrl" label="Cover Image" />
      <ImageField source="qrCodeUrl" label="QR Code" />
      <UrlField source="qrCodeUrl" label="Download QR Code" target="_blank" />
      <DateField source="createdAt" showTime />

      <MemoryUrlField />

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <EditButton />
        <DeleteButton />
      </div>
    </SimpleShowLayout>
  </Show>
);
