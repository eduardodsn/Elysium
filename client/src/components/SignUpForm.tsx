import axios from 'axios';
import { useEffect, useState, useRef } from 'react'
import { BiShow, BiHide } from 'react-icons/bi'
import styles from '../styles/components/SignUpForm.module.css'
import toast, { Toaster } from 'react-hot-toast';
import { useData } from '../contexts/UserData';
import router from 'next/router';

const statesUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados'

export default function SignUpForm() {
    const contextUserData = useData();
    
    //FORM
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);
    const photoRef = useRef<HTMLInputElement>(null);
    const [stateRef, setStateRef] = useState("State")
    const [cityRef, setCityRef] = useState("City")
    const [profilePhoto, setProfilePhoto] = useState(undefined)
    const [userType, setUserType] = useState("User type")

    //STATES
    const [states, setStates] = useState([])
    const [cities, setCities] = useState([])
    const [type, setType] = useState("password")
    const [fileName, setFileName] = useState("");
    const [currentState, setCurrentState] = useState("")
    const [schools, setSchools] = useState([])
    const [schoolText, setSchoolText] = useState("")
    const [schoolSuggestions, setSchoolSuggestions] = useState([])
    

    //Trazer escolas ao carregar pagina
    useEffect(() => {
        const getSchools = async () => {
          if(currentState !== "" && cityRef !== "") {
            axios.post(`${process.env.API_URL}/api/schools/read`, {
                estado: currentState,
                cidade: cityRef
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

    function checkFieldsValid() {
        if(nameRef.current.value !== "" && emailRef.current.value !== "" && passRef.current.value !== "" && profilePhoto !== ""
        && stateRef !== "" && cityRef !== "" && String(stateRef) !== "State" && String(cityRef) !== "City" && !(passRef.current.value.length < 6)) {
            return true;
        } else {
            return false;
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

    function getUserType() {
        // TEACHER 1
        // STUDENT 2
        // ADMIN 0

        if(userType === "Teacher") {
            return 1;
        } else if(userType === "Student") {
            return 2;
        } else {
            toast.error("Please, select a user type! 🤖");
            return -1;
        }
    }

    function handleSubmit() {
        if(!checkFieldsValid()) {
            if(passRef.current.value.length < 6) {
                toast.error("Password must be at least 6 characters long!")
            } else {
                toast.error("Please, fill out all the fields! 🤖")
            }
        } else {
            let escola = getSelectedSchool();
            let tp_user = getUserType();

            if(escola !== "" && tp_user !== -1) {
                toast.loading("Creating account...", {duration: 800})
                axios.post(`${process.env.API_URL}/api/user/create`, {
                    name: nameRef.current.value,
                    email: emailRef.current.value,
                    password: passRef.current.value,
                    state: stateRef,
                    city: cityRef,
                    profilePhoto: profilePhoto,
                    id_school: escola,
                    tp_user: tp_user
                })
                .then((res) => {
                    if(res.data.status === "[ERROR - EMAIL]") {
                        toast.error("Email already exists, try another one! 🤖");
                    } else if(res.data.status === "[OK]"){
                        toast.success('Successfully created! Back to sign in!');
                    }
                })

                nameRef.current.value = "" 
                emailRef.current.value = ""
                passRef.current.value = ""
                setStateRef("State")
                setCityRef("City")
                setFileName("")
                setSchoolText("")
                setUserType("User type")
            }
        }
    }

    return (
        <div className={styles.formContainer}>
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
                <form>
                    <input type="text" ref={nameRef} required autoComplete="off" className={styles.inputInfo} name="name" placeholder="Name" />
                    <input type="email" ref={emailRef} required className={styles.inputInfo} name="email" placeholder="Email" />
                    <div className={styles.passwordContainer}>
                        <span className={styles.passIcon} onClick={changeType} >
                            {
                                type == 'text' ? 
                                <BiHide className={styles.icons}/>
                                :
                                <BiShow className={styles.icons}/>
                            }
                        </span>
                        <input type={type} ref={passRef} minLength={5} required name="password" className={styles.inputInfo} placeholder="Password" />
                    </div>

                    <div className={styles.uploadContainer}>
                        <span>{fileName === "" ? "Choose your photo" : fileName}</span>
                        <label htmlFor="uploadPhoto" className={styles.fileLabel}>
                            Open
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
                                        
                                        setFileName(e.target.files[0].name)
                                    }
                                }} />
                            <input hidden ref={photoRef} type="text" name="imagemCodigo" defaultValue={profilePhoto}/>
                            <span className={styles.fileCustom}></span>
                        </label>
                    </div>

                    <div className={styles.selects} >
                        <select 
                        required
                        name="state" 
                        className={`${styles.inputInfo} ${styles.select}`}
                        value={stateRef}
                        onChange={(event) => {
                            setCurrentState(event.target.value)
                            setStateRef(event.target.value)
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
                        value={cityRef}
                        onChange={(event) => {
                            setCityRef(event.currentTarget.value)
                        }}
                        className={`${styles.inputInfo} ${styles.select}`}
                        >
                            <option disabled>City</option>
                            {cities.map((val, key) => {
                                return (<option key={key} value={val.nome}>{val.nome}</option>)
                            })}
                        </select>
                        
                    </div>

                    <input className={styles.inputInfo}  type="text" value={schoolText} placeholder="School" onChange={e => onSchoolChange(e.target.value)} list="schoolsList"/>

                    <datalist id="schoolsList">
                    {schoolSuggestions.map((schoolSuggestion, i) => {
                        return <option key={i} value={schoolSuggestion.nm_escola}/>
                    })}
                    </datalist>
                    
                    <select 
                        required
                        name="userType"
                        value={userType}
                        onChange={(event) => {
                            setUserType(event.currentTarget.value)
                        }}
                        className={`${styles.inputInfo} ${styles.select}`}
                        >
                            <option disabled selected>User type</option>
                            <option>Teacher</option>
                            <option>Student</option>
                        </select>

                    <button 
                    type="button"
                    className={`${styles.submitButton} ${contextUserData.isSwitchChecked ? styles.dark : ""}`}
                    onClick={handleSubmit}>Sign up</button>
                </form>
        </div>

    )
}
