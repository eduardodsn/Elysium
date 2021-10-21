import sha1 from 'sha1';
import React from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next';
import Sidebar from '../components/Sidebar';
import styles from '../styles/components/Reading.module.css'
import ReadingTab from '../components/ReadingTab'
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useData } from '../contexts/UserData';


export default function Reading() {    
  const userData = useData();

    return (
        <div className={`readingRoomContainer ${userData.isSwitchChecked ? "dark" : ""}`}>
        <Head>
            <title>Reading | Elysium</title>
        </Head>
          <div className={`${styles.sidebarHome} ${userData.isSwitchChecked ? styles.darkSidebar : ""}`}>
            <Sidebar />
          </div>
        <section>
          <ReadingTab/>
        </section>
        <ThemeSwitcher className={styles.switchButton}/>
      </div> 
    )
}

export const getServerSideProps:GetServerSideProps = async ({ req }) => {
  const { upload, token } = req.cookies
  
  if(!upload || !upload.includes("true")) {
    return {
      redirect: {
        destination: '/home',
        permanent: false
      }
    }
  }
  
  if(!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }
  return {
    props: {}
  }
}