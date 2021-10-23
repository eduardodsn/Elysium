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

  let topFive;

  if (props.users[5]) {
    if (props.users[5].token === token) {
      topFive = props.users.slice(0, 6);
    } else {
      topFive = props.users.slice(0, 5);
    }
  } else {
    topFive = props.users.slice(0, props.users.length)
  }

  return (
    <div
      className={`${styles.rankingPage} ${
        contextUserData.isSwitchChecked ? styles.dark : ""
      }`}
    >
      <Head>
        <title>Leaderboard | Elysium</title>
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
            STUDENT
          </span>
          <span
            className={`${styles.labelExp} ${
              contextUserData.isSwitchChecked ? styles.darkText : ""
            }`}
          >
            EXPERIENCE
          </span>
        </div>
        {topFive.map((user, id) => (
          <div
            className={`${styles.card} ${
              contextUserData.isSwitchChecked ? styles.darkCard : ""
            } ${user.token === token ? styles.currentUser : null}`}
            key={id}
          >
            <span className={styles.position}>{id + 1}</span>
            <img
              className={styles.userImage}
              src={user.imagemB64}
              alt={user.nome}
            />
            <div className={styles.userInfo}>
              <div>
                <p>{user.nome}</p>
                <h6>{user.ds_emblema}</h6>
                <img src={user.emblema !== undefined ? `../assets/ranking/${user.emblema}.png` : '../assets/ranking/1.png'} alt="" style={{ width: user.emblema == 4 ? '1.9rem' : '1.5rem' }}/>   
              </div>
              <span>{user.cidade + " - " + user.uf}</span>
              <span>{user.nm_escola}</span>
            </div>
            <span className={styles.userXp}>
              <span className={styles.numberXp}>{user.xp}</span>
              <span className={styles.nameXp}> xp</span>
            </span>
          </div>
        ))}
        {props.users.map((user, id) => {
          if (user.token === token && id + 1 > 6) {
            return (
              <div className={styles.userOver6}>
                <div className={styles.dots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div
                  className={`${styles.over6Card} ${
                    contextUserData.isSwitchChecked ? styles.darkCard : ""
                  } ${
                    user.token === token
                      ? styles.currentUser
                      : null
                  }`}
                  key={id}
                >
                  <span className={styles.position}>{id + 1}</span>
                  <img
                    className={styles.userImage}
                    src={user.imagemB64}
                    alt={user.nome}
                  />
                  <div className={styles.userInfo}>
                    <div>
                      <p>{user.nome}</p>
                      <h6>{user.ds_emblema}</h6>
                      <img src={user.emblema !== undefined ? `../assets/ranking/${user.emblema}.png` : '../assets/ranking/1.png'} alt="" style={{ width: user.emblema == 4 ? '3.8rem' : '1.5rem' }}/>   
                    </div>
                    <span>{user.cidade + " - " + user.uf}</span>
                    <span>{user.nm_escola}</span>
                  </div>
                  <span className={styles.userXp}>
                    <span className={styles.numberXp}>{user.xp}</span>
                    <span className={styles.nameXp}> xp</span>
                  </span>
                </div>
              </div>
            );
          }
        })}
        <div className={styles.arrowToSchool}>
          <BiArrowBack title="Schools ranking" onClick={() => router.push('/ranking/schools')}/>
        </div>
      </div>
      <ThemeSwitcher className={styles.switchButton} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    let users;

    await axios.get(`${process.env.API_URL}/api/users`)
    .then(res => users = res.data)

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
        users: users.data,
      },
    };
};
