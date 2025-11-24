import { Admin, Resource, Login } from 'react-admin';
import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import { MemoryList, MemoryCreate, MemoryShow } from './resources/memories';

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
      <Resource name="memories" list={MemoryList} create={MemoryCreate} show={MemoryShow} />
    </Admin>
  );
};
