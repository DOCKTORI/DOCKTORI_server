require('dotenv').config();
const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        // await mongoose.connect('mongodb://mongodb1:27017/DokTest'); // 도커 서버 실행 시
        // await mongoose.connect('mongodb://localhost:27016/DokTest'); // 로컬 서버 실행 시
        await mongoose.connect(process.env.MONGO_URI); // 배포 서버
        console.log('MongoDB connected');
    } catch(err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectMongoDB;