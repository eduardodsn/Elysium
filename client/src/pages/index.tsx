import React, { useEffect } from 'react';
import Head from 'next/head';
import LoginForm from '../components/LoginForm';
import ThemeSwitcher from '../components/ThemeSwitcher'
import { useData } from '../contexts/UserData';

export default function Home() {
  const userData = useData();
  
  return (
    <div className={`loginPage ${userData.isSwitchChecked ? 'dark' : ""}`}>
        
        <Head>
          <title>Elysium</title>
        </Head>
        
        <div className="sections">
          <section className="sectionLeft">
            <LoginForm />
          </section>
          <section className="sectionRight">
            <img src="../assets/book.svg" alt="Elysium"/>
          </section>
        </div>
        <ThemeSwitcher className="switchButton"/>
    </div> 
  )
}
