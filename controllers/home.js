const {StatusCodes} = require('http-status-codes');
const User = require('../models/user');

const main = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 토큰입니다."
            });
        }

        user.books.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        await user.save();


        const bookReading = user.books
        .filter(book => book.readStatus === false)
        .map(book => ({
            title: book.title,
            author: book.author,
            image: book.image,
            likeStatus: book.likeStatus,
            readStatus: book.readStatus,
            isbn: book.isbn
        }));

        const bookFinished = user.books
        .filter(book => book.readStatus === true)
        .map(book => ({
            title: book.title,
            author: book.author,
            image: book.image,
            likeStatus: book.likeStatus,
            readStatus: book.readStatus,
            isbn: book.isbn
        }));


        return res.status(StatusCodes.OK).json({
            userGoal: user.goal !== null ? user.goal : '',
            bookReadingCount: bookReading.length,
            bookFinishedCount: bookFinished.length,
            bookReading: bookReading,
            bookFinished: bookFinished,
        });

    } catch (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "서버 오류"
        })
    }
}

const favorites = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 토큰입니다."
            });
        }

        const favoritesBooks = user.books
        .filter(book => book.likeStatus === true)
        .map(book => ({
            title: book.title,
            author: book.author,
            image: book.image,
            likeStatus: book.likeStatus,
            readStatus: book.readStatus,
            isbn: book.isbn
        }));

        return res.status(StatusCodes.OK).json({
            books: favoritesBooks
        });

    } catch (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "서버 오류"
        })
    }
}

const readingBooks = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 토큰입니다."
            });
        }

        const bookReading = user.books
        .filter(book => book.readStatus === false)
        .map(book => ({
            title: book.title,
            author: book.author,
            image: book.image,
            likeStatus: book.likeStatus,
            readStatus: book.readStatus,
            isbn: book.isbn
        }));

        return res.status(StatusCodes.OK).json({
            books: bookReading
        });

    } catch(error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '서버 오류'
        });
    }
}

const finishedBooks = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 토큰입니다."
            });
        }

        const bookFinished = user.books
        .filter(book => book.readStatus === true)
        .map(book => ({
            title: book.title,
            author: book.author,
            image: book.image,
            likeStatus: book.likeStatus,
            readStatus: book.readStatus,
            isbn: book.isbn
        }));

        return res.status(StatusCodes.OK).json({
            books: bookFinished
        });

    } catch(error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '서버 오류'
        });
    }
}

const changeGoal = async (req, res) => {
    try {
        const { cNickname, cGoal } = req.body;
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 토큰입니다."
            });
        }

        user.nickname = cNickname;
        user.goal = cGoal;
        await user.save();

        return res.status(StatusCodes.OK).json({
            userNickname: user.nickname,
            userGoal: user.goal
        });

    } catch(error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '서버 오류'
        });
    }
}

const calender = async (req, res) => {
    try {
        const { year, month } = req.query;
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 토큰입니다."
            });
        }

        const readBooks = user.books.filter(book => {
            if (!book.readStatus) return false;
            const startDate = new Date(book.startDate);
            const endDate = book.endDate ? new Date(book.endDate) : null;
            return (
                (startDate.getFullYear() === year && startDate.getMonth() === month - 1) ||
                (endDate && endDate.getFullYear() === year && endDate.getMonth() === month - 1)
            );
        });

        const bookReading = user.books.filter(book => book.readStatus === false)
        const bookFinished = user.books.filter(book => book.readStatus === true)

        return res.status(StatusCodes.OK).json({
            bookFinished: readBooks.map(book => ({
                title: book.title,
                author: book.author,
                endDate: book.endDate.toISOString().split('T')[0],
                image: book.image,
                isbn: book.isbn
            })),
            bookReadCount: bookReading.length,
            bookFinishCount: bookFinished.length
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '서버 오류'
        });
    }
}


module.exports = {
    main,
    favorites,
    readingBooks,
    finishedBooks,
    changeGoal,
    calender
}