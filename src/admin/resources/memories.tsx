import {
  List,
  Datagrid,
  TextField,
  DateField,
  ImageField,
  Create,
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

      <div style={{ marginTop: '2rem' }}>
        <h3>Memory URL</h3>
        <p>
          Share this link or QR code with guests:
          <br />
          <a
            href={`${window.location.origin}/memory/${(window as any).record?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
          >
            {window.location.origin}/memory/{(window as any).record?.slug}
          </a>
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <DeleteButton />
      </div>
    </SimpleShowLayout>
  </Show>
);
