import Cookie from "js-cookie";
import { useRouter } from "next/router";
import { useData } from "../contexts/UserData";
import React, { useEffect, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import styles from "../styles/components/Reading.module.css";
import { BiCaretLeft, BiCaretRight, BiX, BiVolumeFull } from "react-icons/bi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export default function ReadingTab() {
  // estados de controle da pagina
  const router = useRouter();
  const { nameText, text, userId, setUserId, isSwitchChecked, setIsSwitchChecked, setText, favoriteWordsLength, setFavoriteWordsLength } = useData();
  const [page, setPage] = useState(1);
  const [parsedNameText, setParsedNameText] = useState("");
  const [parsedText, setParsed] = useState(
    JSON.stringify(text).slice(1, -1)
  );
  const [currentPageText, setCurrentPageText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCardActive, setIsCardActive] = useState(false);
  const [favoriteWords, setFavoriteWords] = useState([]);

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
    let bookName = nameText.split(".pdf")[0];
    setParsedNameText(bookName);
  });

  useEffect(() => {
    window.onbeforeunload = function () {
      Cookie.remove("upload");
    };
  });

  function nextPage() {
    if (currentPageText != "") {
      setPage(page + 1);
    }
  }

  function previousPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  function closeBook() {
    setText("")
    router.replace("/home");
  }

  function playPronounce() {
    let audio = new Audio(wordPronounceLink);
    audio.preload = 'auto';
    audio.play();
  }

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
			setFavoriteWords(res.data)

			for(let i = 0; i < res.data.length; i++) {
				if(res.data[i].palavra_favorita === word) {
					contains = true
				}
			}
			contains == true ? setIsFavorite(true) : setIsFavorite(false)
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

  useEffect(() => {
    if(page == 1) {
      let text = parsedText
      .replaceAll("  ", "")
      .replaceAll("-\\n", "")
      .replaceAll(" , ", ", ")
      .split(" ")
      .slice((page > 1 ? page - 1 : 0) * (getMaxWordsByWindow()), (page > 1 ? page : page) * (getMaxWordsByWindow() - 70))
      .join(" ");
      setCurrentPageText(text);
    } else{
      let text = parsedText
      .replaceAll("  ", "")
      .replaceAll("-\\n", "")
      .replaceAll(" , ", ", ")
      .split(" ")
      .slice((page > 1 ? page - 1 : 0) * (getMaxWordsByWindow() - 70), (page > 1 ? page : page) * (getMaxWordsByWindow() - 70))
      .join(" ");
      setCurrentPageText(text);
    } 
  }, [page]);

  function getMaxWordsByWindow() {
    return Math.trunc((window.innerWidth * window.innerHeight)/2000)
  }

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
        setIsFavorite(false);
        toast.success("Word removed successfully!");
      } else {
        toast.error("Something went wrong, try again!");
      }
    } else if(saveWord('save')){
      setIsFavorite(true);
      toast.success("Word saved successfully!");
    } else {
      toast.error("Something went wrong, try again!");
    }
  }

  function removeCard() {
    setIsCardActive(false);
  }

  useEffect(() => {
    if (currentLanguage == "EN") {
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

  return (
    <div className={styles.readingOuterContainer}>
      <div className={styles.readingComponent} onClick={removeCard}>
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
        <div
          className={`${styles.leftReadingContainer} ${
            page == 1 ? styles.disabled : null
          }`}
        >
          <BiCaretLeft onClick={previousPage} />
        </div>
        <div className={`${styles.readingContainer} ${isSwitchChecked ? styles.darkBackground : ""}`}>
          <header>
            <div className={styles.readingContainerPage}>
              <span>{page}</span>
            </div>
            <div className={`${styles.readingContainerName} ${isSwitchChecked ? styles.darkTheme : ""}`}>
              <span>{parsedNameText}</span>
            </div>
          </header>
          <div className={`${styles.readingContainerBody} ${isSwitchChecked ? styles.darkTheme : ""}`}>
            {currentPageText
              .replaceAll("\\f", "")
              .replaceAll("\\t", "")
              .split("\\n\\n")
              .map((line, i) => (
                <div key={i}>
                  {line
                    .replaceAll("\\n", " ")
                    .split(" ")
                    .map((word) => (
                      <>
                        <span className={`${styles.word} ${isSwitchChecked ? styles.darkWords : ""}`} onClick={handleWordClick}>
                          {word}
                        </span>{" "}
                      </>
                    ))}
                  <br />
                </div>
              ))}
          </div>
        </div>
        <div
          className={`${styles.rightReadingContainer} ${
            currentPageText == "" ? styles.disabled : null
          }`}
        >
          <BiCaretRight onClick={nextPage} />
        </div>
        <div className={styles.closeButton}>
          <BiX onClick={closeBook} />
        </div>
      </div>
      <div
        className={`${styles.card} ${
          isCardActive ? styles.activeCard : styles.disableCard
        } ${isSwitchChecked ? styles.darkCard: ""}`}
      >
        <header>
          <div>
            <h1 className={isSwitchChecked ? styles.darkTitle : ""}>{comboWord == "" ? wordClicked : comboWord}</h1>
            <span>{wordPhonetic}</span>
          </div>
          {isFavorite ? (
            <AiFillStar onClick={changeFavorite} />
          ) : (
            <AiOutlineStar onClick={changeFavorite} />
          )}
        </header>
        <div className={styles.wordInfo}>
          <span className={`${styles.info} ${isSwitchChecked ? styles.darkTitle : ""}`}>
            <span className={styles.infoTitle}>{comboMeaning}</span>
            {comboMeaningInfo}
          </span>
          <span className={`${styles.info} ${isSwitchChecked ? styles.darkTitle : ""}`}>
            <span className={styles.infoTitle}>{comboType}</span>
            {comboTypeInfo.charAt(0).toUpperCase() + comboTypeInfo.slice(1)}
          </span>
          <div className={`${styles.audioContainer} ${styles.info} ${isSwitchChecked ? styles.darkTitle : ""}`}>
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
  );
}
