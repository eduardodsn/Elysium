import Head from 'next/head'
import SignUpCard from '../components/SignUpCard'


export default function SignUp() {
    return (
        <div>
            <Head>
                <title>Sign up | Elysium</title>
            </Head>
            
            <SignUpCard />
        </div>
    )
}