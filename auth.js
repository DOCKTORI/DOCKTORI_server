const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('./models/user');
const dotenv = require('dotenv');
dotenv.config();

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRATION });
}

const ensureAuthorization = async (req, res, next) => {
    try {
        let receivedJwt = req.headers["authorization"];
        if (!receivedJwt) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "토큰이 제공되지 않았습니다."
            });
        }

        let decodedJwt;
        try {
            decodedJwt = jwt.verify(receivedJwt, process.env.JWT_SECRET);
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                // Access Token이 만료된 경우
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        message: "RefreshToken이 없습니다."
                    });
                }

                try {
                    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
                    const user = await User.findById(decodedRefreshToken.id);

                    if (!user || user.refreshToken !== refreshToken) {
                        return res.status(StatusCodes.UNAUTHORIZED).json({
                            message: "유효하지 않은 RefreshToken입니다."
                        });
                    }

                    // 새로운 Access Token 발급
                    const newAccessToken = generateAccessToken(user._id);
                    res.setHeader('Authorization', `${newAccessToken}`);
                    
                    req.user = jwt.verify(newAccessToken, process.env.JWT_SECRET); // 새로운 토큰으로 검증
                    next();
                    return;
                } catch (refreshError) {
                    console.log(refreshError);
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        message: "유효하지 않은 RefreshToken입니다."
                    });
                }
            } else if (err instanceof jwt.JsonWebTokenError) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    message: "유효하지 않은 AccessToken입니다."
                });
            } else {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "서버 오류"
                });
            }
        }
        req.user = decodedJwt;  // 해독된 JWT 정보를 요청 객체에 추가
        next();  // 다음 미들웨어로 제어를 넘김

    } catch (authorizationError) {
        console.log(authorizationError);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "서버 오류"
        });
    }
}

module.exports = ensureAuthorization;