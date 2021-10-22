import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import ThemeSwitcher from '../components/ThemeSwitcher'
import { useData } from '../contexts/UserData';
import Cookie from "js-cookie";
import { useRouter } from "next/router";
import styles from '../styles/components/Profile.module.css'
import Sidebar from '../components/Sidebar';
import { BiHide, BiShow, BiUpload, BiX } from 'react-icons/bi';
import toast, { Toaster } from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import { addHours } from 'date-fns';


interface IUserData{
    image: string,
    name: string,
    email: string,
    state: string,
    city: string,
    xp: number,
    school: number,
    emblema: number,
    ds_emblema: string,
    ranking: number,
    tp_usuario: number,
    livros: []
}

interface ILivro {
    id_anexo: number,
    titulo_anexo: string,
    anexo: string,
    id_categoria: number,
    id_usuario: number,
    nm_categoria: string
}

const statesUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados'


export default function Profile(props) {
    const router = useRouter();
    const userData = useData();
    const [info, setInfo] = useState<IUserData>()

    //FORM
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passRef1 = useRef<HTMLInputElement>(null);
    const passRef2 = useRef<HTMLInputElement>(null);
    const[stateRef, setStateRef] = useState("")
    const[cityRef, setCityRef] = useState("City")
    const[profilePhoto, setProfilePhoto] = useState(undefined)

    //STATES
    const [states, setStates] = useState([])
    const [cities, setCities] = useState([])
    const [type, setType] = useState("password")
    const [currentState, setCurrentState] = useState("")
    const [schools, setSchools] = useState([])
    const [schoolText, setSchoolText] = useState("")
    const [schoolSuggestions, setSchoolSuggestions] = useState([])
    const [isDeleteSelected, setIsDeleteSelected] = useState(false)
    


    //Trazer escolas ao carregar pagina
    useEffect(() => {
        const getSchools = async () => {
            if(currentState !== "" && cityRef !== "" && cityRef !== "City" && currentState !== undefined) {
              await axios.post('http://localhost:3001/api/schools/read', {
                  estado: currentState || info?.state,
                  cidade: cityRef || info?.city
              }).then(res => {
                  setSchools(res.data.data);
              });
            }
          };
        getSchools();
    }, [cityRef]);

    useEffect(() => {
        getStates();
    }, []);
    
    useEffect(() => {
        getCities();
    }, [currentState]);

    const onSchoolChange = (text) => {
        let matches = []

        if(text.length > 4 && schools != []) {
            matches = schools.filter(school => {
                const regex = new RegExp(`${schoolText}`, "gi")
                return school.nm_escola.match(regex)
            })
        }
        setSchoolSuggestions(matches)
        setSchoolText(text)
    }

    async function getStates() {
        const response = await axios.get(statesUrl)
        setStates(response.data);
    };

    async function getCities() {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${currentState}/municipios`)
        setCities(response.data);
    };

    function changeType() {
        var newType = type == "text" ? "password" : "text"
        setType(newType)
    }
    
    useEffect(() => {
        setCurrentState(props.data.state)
        setInfo(props.data)
        setSchoolText(props.data.school)
        setCityRef(props.data.city)
    }, []);

    useEffect(() => {
        window.onbeforeunload = function () {
            localStorage.setItem("userId", userData.userId);
        };
    });

    function handleDelete() {
        setIsDeleteSelected(true)
    }

    async function handleUpdate() {
        if(checkFieldsValid()) {
            let name = nameRef.current.value;
            let email = emailRef.current.value;
            let pass = passRef1.current.value;
            let state = stateRef;
            let city = cityRef;
            let escola = getSelectedSchool();

            axios.post('http://localhost:3001/api/user/update', {
                token: Cookie.get('token'),
                name: name,
                email: email,
                password: pass,
                state: state || info?.state,
                city: city,
                school: escola,
                profilePhoto: profilePhoto || info?.image
            }).then(res => {

                if(res.data.status == '[OK]') {
                    toast.success("Profile updated successfully!");
                    passRef1.current.value = ""
                    passRef2.current.value = ""
                    setType("password")
                } else if(res.data.status == '[ERROR - EMAIL]'){
                    toast.error("This email already exists, try another one! 🤖");
                } else {
                    toast.error("Something went wrong, try again! 🤖");
                }
            });
        }
    }

    function getSelectedSchool() {
        if(schools != []) {
            let escola = schools.filter(school => {
                const regex = new RegExp(`${schoolText}`, "gi")
                return school.nm_escola.match(regex)
            })

            if(escola[0]) {
                return escola[0].id_escola;
            } else {
                toast.error("Please, select a valid school! 🤖");
                return "";
            }
        } 
    }

    function checkFieldsValid() {
        if((passRef1.current.value !== "" || passRef1.current.value !== "") &&passRef1.current.value !== passRef2.current.value) {
            toast.error("Passwords do not match! 🔑");
            return false;
        }

        if(nameRef.current.value !== "" && emailRef.current.value !== "" 
            && profilePhoto !== "" && (stateRef !== "" || info?.state !== "") 
            && cityRef !== "" && String(stateRef) !== "State" && String(cityRef) !== "City") {
            return true;
        } else {
            toast.error("Please, fill all the fields! ✍️");
            return false;
        }
    }

    function deleteUser() {
        let token = Cookie.get('token');

        if(token !== undefined && token !== "") {
            axios.post(`${process.env.NEXT_PUBLIC_LOCAL_API}/api/user/delete`, {
                token: token
            }).then(res => {
                if(res.data == "[OK]") {
                    Cookie.remove('token');
                    router.push('/');
                }
            });
        }
    }

    function handleReadBook(e) {
        let titulo_anexo = e.target.value.split("-:-")[0];
        let anexo = e.target.value.split("-:-")[1];
        let token = Cookie.get("token");

        if(anexo !== "") {
            axios.post('http://localhost:3001/api/book/extract', {
                nome_livro: anexo,
                token: token
            }).then((res) => {
                if(res.data.text !== "") {
                    userData.setText(res.data.text);
                    userData.setNameText(titulo_anexo)

                    Cookie.set('upload', 'true', {
                        expires: addHours(new Date(), 2),
                        secure: process.env.NODE_ENV === 'production'
                    })
                    
                    router.push('/reading')
                } else {
                    toast.error("Error on reading book, try again!");
                }
            })
        }
    }

    function handleDeleteBook(e) {
        let targetBook = e.value;
        let token = Cookie.get("token");

        if(targetBook !== "") {
            axios.post('http://localhost:3001/api/book/delete', {
                nome_livro: targetBook,
                token: token
            }).then((res) => {
                if(res.data.status === "[OK]") {
                    toast.success("Book deleted successfully!")
                    axios.post('http://localhost:3001/api/user/data', {
                        token: token
                    }).then(res => {
                        setCurrentState(res.data.state)
                        setInfo(res.data)
                        setSchoolText(res.data.school)
                        setCityRef(res.data.city)
                    })
                } else {
                    toast.error("Error, try again!");
                }
            })
        }
    }

    return (
    <div className={`${styles.profilePage} ${userData.isSwitchChecked ? styles.dark : ""}`} style={{ height: info?.livros.length === 0 ? "100vh" : "auto"}}>
        
        <Head>
            <title>Profile | Elysium</title>
        </Head>
        <div className={`${styles.sidebarHome} ${userData.isSwitchChecked ? styles.darkSidebar : ""}`}>
          <Sidebar />
            <Toaster 
            position="top-right" 
            reverseOrder={false} 
            toastOptions={{
                className: '',
                style: {
                  padding: '16px',
                  color: '#FFF',
                  background: '#1E1F2B',
                  font: '500 1.2vw "Roboto", sans-serif'
                },
            }}/>
        </div>

        
        <div className={`${styles.deleteModal} ${userData.isSwitchChecked ? styles.darkDeleteModal : ""}`} style={{display: isDeleteSelected ? 'flex' : 'none'}}>
            <h2>Are you sure you want to DELETE your account?</h2>
            <div>
                <button onClick={() => setIsDeleteSelected(false)}>No</button>
                <button onClick={deleteUser}>Yes</button>
            </div>
        </div>


        <div className={styles.imageContainer}>
            <div>
                <label htmlFor="uploadPhoto" className={styles.uploadArea}>
                    <BiUpload className={styles.uploadIcon} />
                    <img className={`${styles.userImage}`} src={profilePhoto || info?.image} alt="User image" />
                </label>

                <input
                required
                type="file"
                hidden
                className={styles.inputPhoto}
                id="uploadPhoto"
                name="uploadPhoto"
                accept="image/jpeg,image/jpg"
                
                onChange={(e) => {
                    let reader = new FileReader();
                    let baseURL;
                    if(e.target.files[0] !== undefined) {
                        reader.readAsDataURL(e.target.files[0]);
                        reader.onload = () => {
                            baseURL = reader.result;
                            setProfilePhoto(baseURL)
                        };
                    }
                }} />
            </div>

            
            <div className={styles.emblema} style={{ display: info?.tp_usuario === 1 ? 'none' : ''}}>
                <img src={info?.emblema !== undefined ? `../assets/ranking/${info?.emblema}.png` : '../assets/ranking/1.png'} alt="" style={{ width: info?.emblema == 4 ? '3.8rem' : '3rem' }}/>   
                <h3>{info?.ds_emblema}</h3>
            </div>
            <div className={styles.userData} style={{ display: info?.tp_usuario === 1 ? 'none' : ''}}>
                <div className={`${styles.xp} ${userData.isSwitchChecked ? styles.darkText : ""}`}>
                    <div className={`${styles.innerXp} ${userData.isSwitchChecked ? styles.darkText : ""}`}>
                        <h1>{info?.xp}</h1>
                        <h3>xp</h3>
                    </div>
                    <span>Experience</span>
                </div>

                <div className={`${styles.ranking} ${userData.isSwitchChecked ? styles.darkText : ""}`}>
                    <h1>#{info?.ranking}</h1>
                    <span>Ranking</span>
                </div>
            </div>
            <div className={styles.divisor}></div>
            
            <div className={`${styles.booksArea} ${userData.isSwitchChecked ? styles.darkText : ""}`}>
                {info?.livros.length === 0 ? "" : <span>Books</span>}

                {info?.livros.length === 0 ? "" : 
                    info?.livros.map((livro: ILivro, id) => {
                        return (<div key={id} className={`${styles.bookList} ${userData.isSwitchChecked ? styles.darkBookList : ""}`}>
                                    <button className={styles.readBook} title="Click to read the book!" onClick={(e) => handleReadBook(e)} value={`${livro.titulo_anexo}-:-${livro.anexo}`}>{livro.titulo_anexo} <h5>({livro.nm_categoria})</h5></button>
                                    <button title="Click to delete the book!" value={livro.anexo}><BiX className={styles.deleteBook} onClick={(e) => handleDeleteBook(e.currentTarget.parentNode)}/></button>
                                </div>)
                    })
                }
               
            </div>
            {info?.livros.length === 0 ? "" : <div className={styles.divisor}></div>}
            <div className={styles.formContainer}>
            <form>
                <div>
                    <label className={`${styles.label} ${userData.isSwitchChecked ? styles.darkLabel : ""}`} htmlFor="name">Name</label>
                    <input type="text" ref={nameRef} defaultValue={info?.name} required autoComplete="off" className={styles.inputInfo} name="name" />
                    
                    <label className={`${styles.label} ${userData.isSwitchChecked ? styles.darkLabel : ""}`} htmlFor="email">Email</label>
                    <input type="email" ref={emailRef} defaultValue={info?.email} required autoComplete="off" className={styles.inputInfo} name="email" />
                    
                    <label className={`${styles.label} ${userData.isSwitchChecked ? styles.darkLabel : ""}`} htmlFor="password">New password</label>
                    <div className={styles.passwordContainer}>
                        <span className={styles.passIcon} onClick={changeType} >
                            {
                                type == 'text' ? 
                                <BiHide className={styles.icons}/>
                                :
                                <BiShow className={styles.icons}/>
                            }
                        </span>
                        <input type={type} ref={passRef1} minLength={5} required name="password" className={styles.inputInfo} />
                    </div>
                </div>
                
               <div>
                    <label className={`${styles.label} ${userData.isSwitchChecked ? styles.darkLabel : ""}`} htmlFor="">Location</label>
                    <div className={styles.selects}>
                        <select 
                        required
                        name="state" 
                        className={`${styles.inputInfo} ${styles.select}`}
                        defaultValue={info?.state}
                        value={stateRef || info?.state}
                        onChange={(event) => {
                            setCurrentState(event.target.value)
                            setStateRef(event.target.value)
                            setCityRef("City")
                            getCities()
                        }}>
                            <option disabled>State</option>
                            {states.map((val, key) => {
                                return (<option key={key} value={val.sigla}>{val.sigla}</option>)
                            })}
                        </select>

                        <select 
                        required
                        name="city"
                        defaultValue={info?.city}
                        value={cityRef || info?.city}
                        onChange={(event) => {
                            setCityRef(event.target.value)
                        }}
                        className={`${styles.inputInfo} ${styles.select}`}
                        >
                            <option disabled>City</option>
                            {cities.length === 0 ? <option value={info?.city}>{info?.city}</option> : cities.map((val, key) => {
                                return (<option key={key} value={val.nome}>{val.nome}</option>)
                            })}
                        </select>
                            
                    </div>

                    <label className={`${styles.label} ${userData.isSwitchChecked ? styles.darkLabel : ""}`} htmlFor="school">School</label>
                    <input className={styles.inputInfo} name="school" type="text" defaultValue={info?.school} autoComplete="off" onChange={e => onSchoolChange(e.target.value)} list="schoolsList"/>

                    <datalist id="schoolsList">
                    {schoolSuggestions.map((schoolSuggestion, i) => {
                        return <option key={i} value={schoolSuggestion.nm_escola}/>
                    })}
                    </datalist>

                    <label className={`${styles.label} ${userData.isSwitchChecked ? styles.darkLabel : ""}`} htmlFor="passwordConfirm">Confirm new password</label>
                    <div className={styles.passwordContainer}>
                        <span className={styles.passIcon} onClick={changeType} >
                            {
                                type == 'text' ? 
                                <BiHide className={styles.icons}/>
                                :
                                <BiShow className={styles.icons}/>
                            }
                        </span>
                        <input type={type} ref={passRef2} minLength={5} required name="passwordConfirm" className={styles.inputInfo} />
                    </div>
                </div>
            </form>
            </div>
            <div className={styles.buttons}>
                <button className={`${styles.deleteAccount} ${userData.isSwitchChecked ? styles.darkButton : ""}`} onClick={handleDelete}>Delete account</button>
                <button className={`${styles.updateAccount} ${userData.isSwitchChecked ? styles.darkUpdateButton : ""}`} onClick={handleUpdate}>Update account</button>
            </div>
        </div>


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
  
    let res = await axios.post('http://localhost:3001/api/user/data', {
      token: token
    });

    return {
      props: {data: res.data},
    };
};