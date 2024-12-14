import dotenv from 'dotenv';
dotenv.config()


export const config = {
    server:{
        port: Number(process.env.PORT) || 3000,
        host: process.env.APP_URL || 'http://localhost'
    },
    client:{
        url: process.env.CLIENT_URL || 'http://localhost:8080'
    },
    services:{
        ocr:{
            url: process.env.OCR_SERVICE_URL || 'http://localhost:5000'
        }
    }
}