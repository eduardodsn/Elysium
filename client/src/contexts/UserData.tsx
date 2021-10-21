import React, { useState, createContext, useContext } from 'react'


const UserData = createContext(undefined);

export default function UserDataProvider({ children }) {
    const [text, setText] = useState("")
    const [nameText, setNameText] = useState("")
    const [ userId, setUserId ] = useState(undefined)
    const [ userQuestions, setUserQuestions ] = useState(undefined)
    const [ isSwitchChecked, setIsSwitchChecked ] = useState(false)
    const [ favoriteWordsLength, setFavoriteWordsLength ] = useState(undefined)
    const [ userType, setUserType ] = useState(undefined)

    return (
        <UserData.Provider value={{
            text, 
            setText,
            nameText,
            setNameText,
            userId,
            setUserId,
            userQuestions,
            setUserQuestions,
            isSwitchChecked,
            setIsSwitchChecked,
            favoriteWordsLength,
            setFavoriteWordsLength,
            userType,
            setUserType,
        }}>
            {children}
        </UserData.Provider>
    )
}

export function useData() {
    const { text, setText, nameText, setNameText, userId, setUserId, userQuestions, 
        setUserQuestions, isSwitchChecked, setIsSwitchChecked, favoriteWordsLength, 
        setFavoriteWordsLength, userType, setUserType } = useContext(UserData);
    
        return { text, setText, nameText, setNameText, userId, setUserId, userQuestions,
        setUserQuestions, isSwitchChecked, setIsSwitchChecked, favoriteWordsLength, setFavoriteWordsLength, 
        userType, setUserType}
}