import React, { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { BiHide, BiLogIn, BiShow } from 'react-icons/bi';
import styles from '../styles/components/LoginForm.module.css'
import toast, { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import Cookie from 'js-cookie'
import { addHours } from 'date-fns'
import { useRouter } from 'next/router'
import sha1 from 'sha1';
import { useData } from '../contexts/UserData'


export default function loginForm() {
    const contextUserData = useData();

    const router = useRouter()
    
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    async function handleLogin() {
        Cookie.remove('token');
        
        if(email != "" && password != "") {
            toast('Wait a second...', {
                duration: 1000,
                icon: '🕓',
            })

            let token = uuidv4();
            let res = axios.post(`${process.env.API_URL}/api/user/login`, {
                email: email,
                password: password,
                token: token
            }).then((res) => res)

            if((await res).data == '[OK]') {
                contextUserData.setUserId((await res).data.user_id)
                localStorage.setItem("userId", (await res).data.user_id)
                Cookie.set('token', token, {
                    expires: addHours(new Date(), 2),
                    secure: process.env.NODE_ENV === 'production'
                })
                router.push('/home')
            } else if((await res).data == '[NO USER]'){
                toast.error("User does not exists! 🙈")
            } else if((await res).data == '[PASSWORD INCORRECT]') {
                toast.error("Email or password is incorrect! 🙈")
            }
        } else if (email != "" && password == "") {
            toast.error("Please, enter your password! 🙈")
        } else if (email == "" && password == ""){
            toast.error("Please, enter your email and password! 🙈")
        }
    }

    const [type, setType] = useState("password")

    function changeType() {
        var newType = type == "text" ? "password" : "text"
        setType(newType)
    }

    return (
        <div className={styles.loginComponent}>
            <Toaster 
            position="top-right" 
            reverseOrder={false} 
            toastOptions={{
                className: '',
                style: {
                  padding: '16px',
                  color: '#FFF',
                  background: '#1E1F2B',
                  font: '500 calc(100% + 0.03vw) "Roboto", sans-serif'
                },
              }}/>
            <div className={styles.titleContainer}>
                <img src='../assets/logo.png' alt="Elysium" />
                <h1 className={`${contextUserData.isSwitchChecked ? styles.dark : ""}`}>Elysium</h1>
            </div>
            <div className={styles.formContainer}>
                <h3 className={`${contextUserData.isSwitchChecked ? styles.dark : ""}`}>Welcome</h3>
                <form method="POST">
                    <input 
                    type="email" 
                    name="email" 
                    className={styles.inputInfo} 
                    placeholder="Email" 
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                    onKeyDown={(e) => {
                        if(e.code === 'Enter' || e.code === "NumpadEnter") {
                            handleLogin()
                        }
                    }}
                    />
                    <div className={styles.passwordContainer}>
                        <span className={styles.passIcon} onClick={changeType} >
                            {
                                type == 'text' ?
                                    <BiHide className={styles.icons} />
                                    :
                                    <BiShow className={styles.icons} />
                            }
                        </span>
                        <input 
                        type={type} 
                        name="password" 
                        className={styles.inputInfo} 
                        placeholder="Password" 
                        required
                        onChange={(e) => setPassword(e.target.value)} 
                        onKeyDown={(e) => {
                            if(e.code === 'Enter' || e.code === "NumpadEnter") {
                                handleLogin()
                            }
                        }}
                        />
                    </div>
                    <br/>
                </form>
                <button className={`${styles.submitButton} ${contextUserData.isSwitchChecked ? styles.darkButton : ""}`} onClick={handleLogin}> Sign In</button>
                <div className={styles.signUpContainer}>
                    <BiLogIn />
                    <span className={`${contextUserData.isSwitchChecked ? styles.darkTip : ""}`}>New here? <a onClick={() => router.push("/signup")}>Sign Up</a></span>
                </div>
            </div>
        </div>
    )
}