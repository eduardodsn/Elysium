import React from 'react';
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
    if(contextUserData.text != "") {
        router.push('/reading')
    }
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: "application/pdf",
        onDrop: async (accepedFiles) => {
            toast('Wait a second...', {
                duration: 3000,
                icon: '🕓',
            })
            if(accepedFiles[0] !== undefined) {
                if(accepedFiles[0].size > 5000000) {
                    toast.error("File too large, try another one! 🥺")
                } else {
                    const data = new FormData();
                    data.append('file', accepedFiles[0], accepedFiles[0].name);
                    axios.post('http://localhost:3001/api/books/create', data)
                        .then(res => {
                            contextUserData.setText(res.data.text);
                            contextUserData.setNameText(accepedFiles[0].name)
    
                            Cookie.set('upload', 'true', {
                                expires: addHours(new Date(), 2),
                                secure: process.env.NODE_ENV === 'production'
                            })
    
                            router.push('/reading')
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
        </div>
    )
}