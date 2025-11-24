import { Admin, Resource, Login } from 'react-admin';
import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import { MemoryList, MemoryCreate, MemoryEdit, MemoryShow } from './resources/memories';
import { MediaList } from './resources/media';

const LoginPage = () => (
  <Login backgroundImage="https://source.unsplash.com/random/1600x900/?wedding,celebration" />
);

export const AdminApp = () => {
  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      loginPage={LoginPage}
      basename="/admin"
      requireAuth
    >
      <Resource
        name="memories"
        list={MemoryList}
        create={MemoryCreate}
        edit={MemoryEdit}
        show={MemoryShow}
      />
      <Resource name="media" list={MediaList} />
    </Admin>
  );
};
