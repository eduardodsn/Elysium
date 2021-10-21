import UserDataProvider from '../contexts/UserData'
import '../styles/global.css';
import '../styles/home.css';
import '../styles/index.css';

function MyApp({ Component, pageProps }) {
  return (
    <UserDataProvider>
      <Component {...pageProps} />
    </UserDataProvider>
  )
}

export default MyApp
