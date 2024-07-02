const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
  });
};

const join = async (req,res) => {
    const { email, password1, password2, nickname } = req.body;
    if (!email || !nickname || !password1 || !password2) { 
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "공백이 있습니다."
        })};

    if (password1 !== password2) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: "비밀번호가 일치하지 않습니다." 
        });
    }

    try {
        // 이메일 중복 확인
        let user = await User.findOne({ email });
        if (user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: '이메일이 이미 사용 중입니다.',
            });
        }

        const salt = crypto.randomBytes(16).toString('base64');
        const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');

        const newUser = new User({
            email,
            password: hashPassword,
            nickname,
            salt,
        });

        await newUser.save();
        return res.status(StatusCodes.OK).json({
            message: '회원가입 완료!',
        });
    } catch (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '서버 오류',
        });
    }
};

const login = async (req, res) => {
  res.header('Access-Control-Allow-Origin');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '공백이 있습니다.',
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '존재하지 않는 이메일입니다.',
      });
    }

    const hashPassword = crypto
      .pbkdf2Sync(password, user.salt, 10000, 64, 'sha512')
      .toString('base64');
    if (hashPassword !== user.password) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: '비밀번호가 틀렸습니다.',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.status(StatusCodes.OK).json({
      nickname: user.nickname,
      accessToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '서버 오류',
    });
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'RefreshToken이 없습니다.',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '유효하지 않은 RefreshToken입니다.',
      });
    }

    // 리프레시 토큰 무효화
    user.refreshToken = null;
    await user.save();

    // 클라이언트 측 쿠키 삭제 지시
    res.clearCookie('refreshToken');
    // + 로컬에 저장되어있는 Access Token도 제거바람 ( 프론트 )

    return res.status(StatusCodes.OK).json({
      message: '로그아웃 성공',
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '서버 오류',
    });
  }
};

const changePassword = async (req, res) => {
    const { newpassword1, newpassword2 } = req.body;

    if ( !newpassword1 || !newpassword2) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "공백이 있습니다."
        });

    }

    try {
        const user = await User.findById({ _id: req.user.id });
        // 새 비밀번호 해싱
        const newSalt = crypto.randomBytes(16).toString('base64');
        const newHashPassword = crypto.pbkdf2Sync(newpassword1, newSalt, 10000, 64, 'sha512').toString('base64');

        // 비밀번호 업데이트
        user.password = newHashPassword;
        user.salt = newSalt;
        await user.save();

        return res.status(StatusCodes.OK).json({ 
            message: "비밀번호가 성공적으로 변경되었습니다." 
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "서버 오류" 
        });
    }
}


const cancelAccount = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'RefreshToken이 없습니다.',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '유효하지 않은 RefreshToken입니다.',
      });
    }

    // 사용자 계정 삭제
    await User.deleteOne({ _id: user.id });

    // 클라이언트 측 쿠키 삭제 지시
    res.clearCookie('refreshToken');
    // + 로컬에 저장되어있는 Access Token도 제거바람 ( 프론트 )

    return res.status(StatusCodes.OK).json({
      message: '회원탈퇴 성공',
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '서버 오류',
    });
  }
};

module.exports = {
  join,
  login,
  logout,
  changePassword,
  cancelAccount,
};
