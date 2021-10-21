import React, { useEffect, useState } from 'react';
import Switch from 'react-switch';
import { useData } from '../contexts/UserData';

function ThemeSwitcher(props) {
  const userData = useData();
  const [isSwitchChecked, setIsSwitchChecked ] = useState(true)
    
    useEffect(() => {
      const storageValue = localStorage.getItem("theme")
      if(storageValue) {
        if(storageValue == "light"){
          setIsSwitchChecked(false)
          userData.setIsSwitchChecked(false)
        } else {
          setIsSwitchChecked(true)
          userData.setIsSwitchChecked(true)
        }
      }
    }, [])
    

    useEffect(() => {
      localStorage.setItem("theme", isSwitchChecked ? "dark" : "light");
      userData.setIsSwitchChecked(isSwitchChecked)
    }, [isSwitchChecked])
    
    return (
        <Switch 
          className={props.className}
          onChange={() => {isSwitchChecked ? setIsSwitchChecked(false) : setIsSwitchChecked(true)}}
          checked={userData.isSwitchChecked}
          checkedIcon={false}
          uncheckedIcon={false}
          height={28}
          width={50}
          handleDiameter={16}
          offColor="#dfdfdf"
          onColor="#333"
          uncheckedHandleIcon={<img src="../assets/sun-solid.svg" style={{ background: '#dfdfdf', outlineStyle: 'none'}}/>}
          checkedHandleIcon={<img src="../assets/moon-solid.svg" style={{ background: '#333' }}/>}
          activeBoxShadow={null}
        />
    )
}

export default ThemeSwitcher
