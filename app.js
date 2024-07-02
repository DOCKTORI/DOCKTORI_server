const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const connectionMongoDB = require('./models/index');
const cookieParser = require('cookie-parser');

const corsOptions = {
  origin: 'http://localhost:3000', // 허용하고자 하는 도메인
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 쿠키를 사용한 인증을 허용
};

connectionMongoDB();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth');
const homeRouter = require('./routes/home');
const bookRouter = require('./routes/book');

app.use('/auth', authRouter);
app.use('/home', homeRouter);
app.use('/book', bookRouter);

const PORT = process.env.PORT || 8888; // 포트 설정을 이 줄로 이동
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
