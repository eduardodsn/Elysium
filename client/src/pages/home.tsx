import { GetServerSideProps } from 'next';
import Head from 'next/head'
import Sidebar from '../components/Sidebar';
import UploadArea from '../components/UploadArea';
import styles from '../styles/components/Home.module.css'
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useData } from '../contexts/UserData';


export default function ReadingRoom() {
  const userData = useData()
  return (
    <div className={`readingRoomContainer ${userData.isSwitchChecked ? "dark" : ""}`}>
      <Head>
          <title>Home | Elysium</title>
      </Head>
        <div className={`${styles.sidebarHome} ${userData.isSwitchChecked ? styles.darkSidebar : ""}`}>
          <Sidebar />
        </div>
      <section>
          <h1 className={`readingRoomTitle ${userData.isSwitchChecked ? "darkTitle" : ""}`}>Reading Room</h1>
          <UploadArea />
      </section>
      <ThemeSwitcher className={styles.switchButton}/>
    </div> 
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { token } = req.cookies;

  if (!token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};