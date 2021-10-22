import React, { useEffect, useState } from 'react';
import { BiUpload } from 'react-icons/bi'
import { useDropzone } from 'react-dropzone'
import styles from '../styles/components/UploadArea.module.css';
import { useData } from '../contexts/UserData'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast';
import Cookie from 'js-cookie'
import { addHours } from 'date-fns';
import axios from 'axios';


export default function UploadArea() {
    const router = useRouter()
    const contextUserData = useData()
    const [isSaveChecked, setIsSaveChecked] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(-1)
    const [bookName, setBookName] = useState("");
    const [categories, setCategories] = useState([])


    if(contextUserData.text != "") {
        router.push('/reading')
    }

    useEffect(() => {
        axios.get('http://localhost:3001/api/categories/read')
        .then((res) => {
            setCategories(res.data.data)
        })
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: "application/pdf",
        onDrop: async (accepedFiles) => {
            toast('Wait a second...', {
                duration: 500,
                icon: '🕓',
            })
            if(accepedFiles[0] !== undefined) {
                if(accepedFiles[0].size > 5000000) {
                    toast.error("File too large, try another one! 🥺")
                } else {
                    const data = new FormData();
                    data.append('file', accepedFiles[0], accepedFiles[0].name);
                    data.append('token', Cookie.get('token'))

                    if(isSaveChecked) {
                        data.append('isSalvar', "true")
                        data.append('bookName', bookName)
                        data.append('idCategoria', String(selectedCategory))
                    } else {
                        data.append('isSalvar', "false")
                    }

                    axios.post('http://localhost:3001/api/books/create', data)
                        .then(res => {
                            contextUserData.setText(res.data.text);
                            if(res.data.status !== "") {
                                toast.error("Book not saved! You already have 5 books, please delete one!")
                            }

                            if(isSaveChecked && bookName !== "") {
                                contextUserData.setNameText(bookName)
                            } else {
                                contextUserData.setNameText(accepedFiles[0].name)
                            }
    
                            Cookie.set('upload', 'true', {
                                expires: addHours(new Date(), 2),
                                secure: process.env.NODE_ENV === 'production'
                            })
                            
                            setTimeout(() => {
                                router.push('/reading')
                            }, 5000);

                        }).catch(e => {
                            toast.error("Something went wrong, please try again! 🥺")
                        });
                }
            } else {
                toast.error("This file is not acceptable! 🥺")
            }
        }
    })
    return (
        <div>
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
                }} />
            <div {...getRootProps} className={styles.uploadContainer}>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <label>
                                <BiUpload className={styles.uploadIcon} />
                                <h3 className={styles.uploadTitle}>Drop the file here!</h3>
                                <span className={styles.uploadTip}>Tip: the file must be .pdf and must be valid (be searchable)</span>
                            </label>
                            :
                            <label>
                                <BiUpload className={`${styles.uploadIcon} ${contextUserData.isSwitchChecked ? styles.darkIcon : ""}`} />
                                <h3 className={`${styles.uploadTitle} ${contextUserData.isSwitchChecked ? styles.darkTitle : ""}`}>Click or drop a file here to start reading</h3>
                                <span className={`${styles.uploadTip} ${contextUserData.isSwitchChecked ? styles.darkTip : ""}`}>Tip: the file must be .pdf and must be valid (be searchable)</span>
                            </label>
                    }
                </div>
            </div>
            <div className={`${styles.saveBox} ${contextUserData.isSwitchChecked ? styles.dark : ""}`}>
                <label id={styles.saveLabel}>
                    <input type="checkbox" onChange={() => {
                        if(isSaveChecked) {
                            setIsSaveChecked(false)
                            setBookName("")
                            setSelectedCategory(-1)
                        } else {
                            setIsSaveChecked(true);
                        }
                        
                    }}/>
                    Save this file on my profile
                </label> 
                
                <label id={styles.nameLabel} htmlFor="fileName" style={{ display: isSaveChecked ? "" : "none"}}>
                    Name of this file:
                    <input type="text" name="fileName" value={bookName} maxLength={45} onChange={(e) => setBookName(e.target.value)}/>
                </label>

                <label id={styles.categoryLabel} htmlFor="category" style={{ display: isSaveChecked ? "" : "none"}}>
                    Category:
                    <select name="category" value={selectedCategory} onChange={(e) => setSelectedCategory(parseInt(e.target.value))}>
                    <option selected disabled value={-1}>None</option>
                    {categories.map((cat, id) => {
                            return <option key={id} value={cat.id_categoria}>{cat.nm_categoria}</option>
                    })}
                    </select>
                </label>
            </div>
        </div>
    )
}