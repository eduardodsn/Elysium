import { GetServerSideProps } from "next";
import Head from "next/head";
import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import styles from "../styles/components/Dictionary.module.css";
import { useData } from "../contexts/UserData";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BiVolumeFull } from "react-icons/bi";
import ThemeSwitcher from "../components/ThemeSwitcher";
import axios from "axios";

export default function dictionary(props) {
  const router = useRouter();
  const contextUserData = useData();
  const [favoriteWordsLeft, setFavoriteWordsLeft] = useState(props.data.slice(0, props.data.length / 2));
  const [favoriteWordsRight, setFavoriteWordsRight] = useState(props.data.slice(props.data.length / 2));
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCardActive, setIsCardActive] = useState(false);

  //informações da palavra em ingles
  const [wordClicked, setWordClicked] = useState(""); // palavra
  const [wordPhonetic, setWordPhonetic] = useState(""); // transcrição fonetica
  const [wordMeaning, setWordMeaning] = useState(""); // significado da palavra
  const [wordType, setWordType] = useState(""); // classe gramatical
  const [wordPronounceLink, setWordPronounceLink] = useState(""); // audio da pronuncia da palavra

  //informações da palavra em portugues
  const [palavraClicada, setPalavraClicada] = useState("");
  const [significadoPalavra, setSignificadoPalavra] = useState("");
  const [tipoPalavra, setTipoPalavra] = useState("");

  //estados da combo de informações
  const [currentLanguage, setCurrentLanguage] = useState("PT-BR");
  const [comboWord, setComboWord] = useState("");
  const [comboMeaning, setComboMeaning] = useState("Meaning: ");
  const [comboMeaningInfo, setComboMeaningInfo] = useState("");
  const [comboType, setComboType] = useState("Part of speech: ");
  const [comboTypeInfo, setComboTypeInfo] = useState("");
  const [comboPronounce, setComboPronounce] = useState("Pronunciation:");

  useEffect(() => {
    const getWords = () => {
      axios.post(`${process.env.API_URL}/api/words/favorites/read`, {
      token: Cookie.get('token')
    })
		.then(res => {
      setFavoriteWordsLeft(res.data.slice(0, res.data.length / 2));
      setFavoriteWordsRight(res.data.slice(res.data.length / 2));
    });
    };
    getWords();
  }, [isFavorite]);

  async function handleWordClick(e) {
		let word = e.target.innerHTML.replace(/[^\w\s]/gi, "");
		let contains;
		
		setWordClicked(word);
		setComboWord(word);

    // puxa as palavras favoritas do banco
		axios.post(`${process.env.API_URL}/api/words/favorites/read`, {
      token: Cookie.get('token')
    })
		.then(res => {
			for(let i = 0; i < res.data.length; i++) {
				if(res.data[i].palavra_favorita.toLowerCase() === word.toLowerCase()) {
					contains = true
				}
			}
			contains === true ? setIsFavorite(true) : setIsFavorite(false)
		})

		const promise = axios.post(`${process.env.API_URL}/api/words/read`, { word: word }).then((res) => {
			setWordMeaning(res.data.en.meaning);
			setWordType(res.data.en.type);
			setWordPronounceLink(res.data.en.link);
			setWordPhonetic(res.data.en.phonetic);
			setComboMeaningInfo(res.data.en.meaning);
			setComboTypeInfo(res.data.en.type);

			setPalavraClicada(res.data.pt.palavra);
			setSignificadoPalavra(res.data.pt.significado);
			setTipoPalavra(res.data.pt.tipo);

			setCurrentLanguage("EN");
			setIsCardActive(true);
		});
		toast.promise(promise, {
			loading: "Looking for the word 🔍...",
			success: "Here it is...",
			error: "Well, nothing found, try another word! 🤔",
		});
 	}

  function removeCard() {
    setIsCardActive(false);
  }

  useEffect(() => {
    if (currentLanguage === "EN") {
      setComboWord(wordClicked);
      setComboMeaning("Meaning: ");
      setComboMeaningInfo(wordMeaning);
      setComboType("Part of speech: ");
      setComboTypeInfo(wordType);
      setComboPronounce("Pronunciation:");
    } else {
      setComboWord(palavraClicada);
      setComboMeaning("Significado: ");
      setComboMeaningInfo(significadoPalavra);
      setComboType("Classe gramatical: ");
      setComboTypeInfo(tipoPalavra);
      setComboPronounce("Pronúncia:");
    }
  }, [currentLanguage]);

  async function saveWord(operation) {
    let res = axios.post(`${process.env.API_URL}/api/words/favorites/save`, {
      word: wordClicked,
      token: Cookie.get('token'),
      operation: operation
    })

    if((await res).data == '[OK]') {
      return true;
    } 
    return false
  }

  function changeFavorite() {
    if (isFavorite) {
      if(saveWord('remove')) {
        toast.success("Word removed successfully!");
        setIsFavorite(false);
      }
    } else {
      if(saveWord('save')) {
        toast.success("Word saved successfully!");
        setIsFavorite(true);
      }
    }
  }

  function playPronounce() {
    let audio = new Audio(wordPronounceLink);
    audio.preload = 'auto';
    audio.play();
  }

  return (
    <div className={`${styles.dictPage} ${contextUserData.isSwitchChecked ? styles.dark : ""}`}>
      <Head>
        <title>Dictionary | Elysium</title>
      </Head>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: "",
          style: {
            padding: "16px",
            color: "#FFF",
            background: "#1E1F2B",
            font: '500 1.2vw "Roboto", sans-serif',
          },
        }}
      />
      <div className={`${styles.sidebarHome} ${contextUserData.isSwitchChecked ? styles.darkSidebar : ""}`}>
        <Sidebar />
      </div>
      <h1 className={`${styles.dictTitle} ${contextUserData.isSwitchChecked ? styles.darkText : ""}`}>Personal Dictionary</h1>
      <div className={styles.dictContainer}>
        <div className={`${styles.dictLists} ${contextUserData.isSwitchChecked ? styles.darkContainer : ""}`} onClick={removeCard}>
          <ul className={styles.leftList}>
            {favoriteWordsLeft.length != 0 ? favoriteWordsLeft.map((item, idx) => (
              <li key={idx}>
                <span className={`${styles.word} ${contextUserData.isSwitchChecked ? styles.darkText : ""}`} onClick={handleWordClick}>
                  {item.palavra_favorita}
                </span>
              </li>
            )) : 
            <li>
                <span className={`${styles.word} ${styles.noWords} ${contextUserData.isSwitchChecked ? styles.darkText : ""}`}>
                  You don't have favorite words yet. Start now!
                </span>
              </li>}
          </ul>
          <ul className={styles.rightList}>
            {favoriteWordsRight.map((item, idx) => (
              <li key={idx}>
                <span className={`${styles.word} ${contextUserData.isSwitchChecked ? styles.darkText : ""}`} onClick={handleWordClick}>
                  {item.palavra_favorita}
                </span>
              </li>
            ))}
          </ul>
          <div className={`${styles.dictDivisor} ${contextUserData.isSwitchChecked ? styles.darkDivisor : ""}`}></div>
        </div>
        <div
        className={`${styles.card} ${
          isCardActive ? styles.activeCard : styles.disableCard
        } ${contextUserData.isSwitchChecked ? styles.darkCard : ""}`}
      >
        <header>
          <div>
            <h1 className={contextUserData.isSwitchChecked ? styles.darkTitle : ""}>{comboWord == "" ? wordClicked : comboWord}</h1>
            <span>{wordPhonetic}</span>
          </div>
          {isFavorite ? (
            <AiFillStar onClick={changeFavorite} />
          ) : (
            <AiOutlineStar onClick={changeFavorite} />
          )}
        </header>
        <div className={styles.wordInfo}>
          <span className={`${styles.info} ${contextUserData.isSwitchChecked ? styles.darkTitle : ""}`}>
            <span className={styles.infoTitle}>{comboMeaning}</span>
            {comboMeaningInfo}
          </span>
          <span className={`${styles.info} ${contextUserData.isSwitchChecked ? styles.darkTitle : ""}`}>
            <span className={styles.infoTitle}>{comboType}</span>
            {comboTypeInfo.charAt(0).toUpperCase() + comboTypeInfo.slice(1)}
          </span>
          <div className={`${styles.audioContainer} ${styles.info} ${contextUserData.isSwitchChecked ? styles.darkTitle : ""}`}>
            <div>
              <span className={styles.infoTitle}>{comboPronounce}</span>
              <BiVolumeFull
                className={styles.playButton}
                onClick={playPronounce}
              />
            </div>
            <button
              onClick={() =>
                setCurrentLanguage(currentLanguage == "EN" ? "PT-BR" : "EN")
              }
            >
              {currentLanguage}
            </button>
          </div>
        </div>
      </div>
      </div>
      <ThemeSwitcher className={styles.switchButton}/>
    </div>
  );
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

  let res = await axios.post(`${process.env.API_URL}/api/words/favorites/read`, {
    token: token
  });
  return {
    props: {data: res.data},
  };
};