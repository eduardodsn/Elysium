import { BiArrowBack } from 'react-icons/bi'
import styles from '../styles/components/SignUpCard.module.css'
import SignUpForm from '../components/SignUpForm'
import { useData } from '../contexts/UserData';
import ThemeSwitcher from './ThemeSwitcher';
import { useRouter } from 'next/router';

function SignUpCard() {
    const router = useRouter()
    const contextUserData = useData();

    return (
        <div className={`${styles.signUpContainer} ${contextUserData.isSwitchChecked ? styles.dark : ""}`}>
            <div className={`${styles.signUpCard} ${contextUserData.isSwitchChecked ? styles.darkCard : ""}`}>
                <div className={styles.signUpInfo}>
                    <div className={styles.titleContainer}>
                        <img src='../assets/logo.png' alt="Elysium"/>
                        <h1 className={contextUserData.isSwitchChecked ? styles.darkTitle : ""}>Elysium</h1>
                    </div>
                    <div className={styles.signUpText}>
                        <h3 className={contextUserData.isSwitchChecked ? styles.darkTitle : ""}>Sign up</h3>
                        <p className={`${styles.signUpTip} ${contextUserData.isSwitchChecked ? styles.darkTitle : ""}`}>Sign up, join the platform, enjoy yourself and learn reading books!</p>
                    </div>
                    <a onClick={() => router.push('/')} className={styles.backToSignIn}>
                        <BiArrowBack />
                        <span className={contextUserData.isSwitchChecked ? styles.darkTitle : ""}>Back to sign in</span>
                    </a>
                </div>
                <div className={styles.signUpForm}>
                    <SignUpForm />
                </div>
            </div>
            <ThemeSwitcher className={styles.switchButton}/>
        </div>
    )
}

export default SignUpCard
