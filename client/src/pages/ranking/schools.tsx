import Cookie from "js-cookie";
import sha1 from "sha1";
import { GetServerSideProps } from "next";
import React, { useEffect } from "react";
import Head from "next/head";
import Sidebar from "../../components/Sidebar";
import styles from "../../styles/components/Ranking.module.css";
import { useData } from "../../contexts/UserData";
import { useRouter } from "next/router";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";
const path = require('path')


export default function Ranking(props) {
  const router = useRouter();
  const contextUserData = useData();
  let token = Cookie.get('token');

  let topFive = props.schools;

  return (
    <div
      className={`${styles.rankingPage} ${
        contextUserData.isSwitchChecked ? styles.dark : ""
      }`}
    >
      <Head>
        <title>Schools Leaderboard | Elysium</title>
      </Head>
      <div
        className={`${styles.sidebarHome} ${
          contextUserData.isSwitchChecked ? styles.darkSidebar : ""
        }`}
      >
        <Sidebar />
      </div>
      <h1
        className={`${styles.rankingTitle} ${
          contextUserData.isSwitchChecked ? styles.darkText : ""
        }`}
      >
        Leaderboard
      </h1>
      <div className={styles.rankingContainer}>
        <div
          className={`${styles.labels} ${
            contextUserData.isSwitchChecked ? styles.darkText : ""
          }`}
        >
          <span
            className={`${styles.labelPosition} ${
              contextUserData.isSwitchChecked ? styles.darkText : ""
            }`}
          >
            POSITION
          </span>
          <span
            className={`${styles.labelStudent} ${
              contextUserData.isSwitchChecked ? styles.darkText : ""
            }`}
          >
            SCHOOL
          </span>
          <span
            className={`${styles.labelExp} ${
              contextUserData.isSwitchChecked ? styles.darkText : ""
            }`}
          >
            EXPERIENCE
          </span>
        </div>
        {topFive.map((school, id) => (
          <div
            className={`${styles.card} ${
              contextUserData.isSwitchChecked ? styles.darkCard : ""
            }`}
            key={id}
          >
            <span className={styles.position}>{id + 1}</span>
            <div className={styles.userInfo}>
              <div>
                <p>{school.nm_escola}</p>
              </div>
              <span>{school.cidade + " - " + school.uf}</span>
            </div>
            <span className={styles.userXp}>
              <span className={styles.numberXp}>{school.xp}</span>
              <span className={styles.nameXp}> xp</span>
            </span>
          </div>
        ))}
         <div className={styles.arrowToStudents}>
          <BiArrowBack title="Students ranking" onClick={() => router.push('/ranking')}/>
        </div>
      </div>
      <ThemeSwitcher className={styles.switchButton} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    let schools;

    await axios.get('http://localhost:3001/api/schools/ranking')
    .then(res => schools = res.data)

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
      props: {
        schools: schools.data,
      },
    };
};
