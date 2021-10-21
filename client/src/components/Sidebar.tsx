import styles from '../styles/components/Sidebar.module.css';
import { BiHomeAlt, BiData, BiAward, BiBookContent, BiExit, BiUser } from 'react-icons/bi';
import Cookie from 'js-cookie'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useData } from '../contexts/UserData';


export default function Sidebar() {
    const userData = useData()
    const router = useRouter()

    function handleExit() {
        localStorage.removeItem("userId")
        Cookie.remove('token')
        Cookie.remove("upload");
        router.push("/")
    }

    return (
        <div className={`${styles.sidebar} ${userData.isSwitchChecked ? styles.dark : ""}`}>
            <img className={styles.logo} src="/assets/logo.png" alt="Elysium"/>
            <ul className={styles.sidebarList}>
                <div>
                    <span></span>
                    <li title="Home" className={`${styles.sidebarItem} ${userData.isSwitchChecked ? styles.darkItem : ""}`}>
                        <a onClick={() => router.push('/home')}><BiHomeAlt/></a>
                    </li>
                </div>
                <div>
                    <span></span>
                    <li title="Questions Database" className={`${styles.sidebarItem} ${userData.isSwitchChecked ? styles.darkItem : ""}`}>
                        <a onClick={() => router.push('/questions')}><BiData/></a>
                    </li>
                </div>
                <div>
                    <span></span>
                    <li title="Leaderboard" className={`${styles.sidebarItem} ${userData.isSwitchChecked ? styles.darkItem : ""}`} >
                        <a onClick={() => router.push('/ranking')}><BiAward/></a>
                    </li>
                </div>
                <div>
                    <span></span>
                    <li title="Dictionary" className={`${styles.sidebarItem} ${userData.isSwitchChecked ? styles.darkItem : ""}`}>
                        <a onClick={() => router.push('/dictionary')}><BiBookContent/></a>
                    </li>
                </div>
                <div>
                <span></span>
                    <li title="Exit" className={`${styles.sidebarItem} ${userData.isSwitchChecked ? styles.darkItem : ""}`}>
                        <a onClick={handleExit}><BiExit/></a>
                    </li>
                </div>
                <div>
                    <span></span>
                    <li title="Profile" className={`${styles.sidebarItem} ${userData.isSwitchChecked ? styles.darkItem : ""}`}>
                        <a onClick={() => router.push('/profile')}><BiUser/></a>
                    </li>
                </div>
            </ul>
        </div>
    )
}
