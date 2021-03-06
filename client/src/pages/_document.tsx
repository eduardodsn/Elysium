import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="shortcut icon" href="./assets/logo.png" type="image/png"/>
                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link href="https://fonts.googleapis.com/css2?family=Baumans&family=Inter:wght@400;500;600&family=Poppins:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                    <style jsx global>{`
                        #__next {
                            overflow-x: hidden !important;
                        }

                        #__next::-webkit-scrollbar {
                            width: 1vw !important;
                        }
                        
                        #__next::-webkit-scrollbar-track {
                            background: #a0a6e0 !important;
                            border-bottom-left-radius: 10px !important;
                            border-bottom-right-radius: 10px !important;
                        }
                        
                        #__next::-webkit-scrollbar-thumb {
                            background: var(--blue) !important; 
                            border-bottom-left-radius: 10px !important;
                            border-bottom-right-radius: 10px !important;
                        }
                    `}</style>
                </body>
            </Html>
        );
    }
}
