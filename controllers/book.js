const {StatusCodes} = require('http-status-codes');
const User = require('../models/user');
const dotenv = require('dotenv');
const axios = require("axios");
dotenv.config();

const addDeletelike = async (req, res) => {
    try {
        const { isbn } = req.body;
        const { user, book } = await findUserAndBook(req.user.id, isbn);

        // 좋아요 상태 업데이트
        book.likeStatus = !book.likeStatus;
        await user.save();

        return res.status(StatusCodes.OK).json({ 
            bookLikeStatus: book.likeStatus
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const searchBooks = async (req, res) => {
    const title = decodeURIComponent(req.query.title);
    console.log(title);
    const url = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${process.env.ALADIN_TTBKEY}&Query=${title}&QueryType=Title&MaxResults=20&Sort=Accuracy&start=1&SearchTarget=Book&output=js&Version=20131101`;

    try {
        const response = await axios.get(url);
        const books = response.data.item.map(book=> ({
            image: book.cover,
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            isbn: book.isbn
        }));
        
        res.status(StatusCodes.OK).json({
            books
        });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "서버 오류" 
        });
    }
};

const selectBook = async (req, res) => {
    try{
        const { title, author, image, publisher, isbn } = req.body;
        const user = await User.findOne({ _id: req.user.id });

        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 사용자입니다."
            });
        }

        const bookExist = user.books.some(book => book.isbn === isbn);
        if (bookExist) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "이미 등록된 책입니다."
            });
        }

        user.books.unshift({ title, author, publisher, image, isbn });
        await user.save();

        return res.status(StatusCodes.OK).json({
            message: '책이 성공적으로 저장되었습니다.'
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const finishReading = async (req, res) => {
    try {
        const { isbn } = req.body;
        const { user, book } = await findUserAndBook(req.user.id, isbn);

        book.readStatus = !book.readStatus;

        if(book.readStatus === true)
        {
            book.endDate = Date.now();
        } else {
            book.endDate = null;
        }
        await user.save();

        return res.status(StatusCodes.OK).json({ 
            bookReadStatus: book.readStatus,
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const bookDetail = async (req, res) => {
    try {
        const { isbn } = req.query;
        const { user, book } = await findUserAndBook(req.user.id, isbn);

        const startDate = book.startDate ? book.startDate.toISOString().split('T')[0] : null;
        const endDate = book.endDate ? book.endDate.toISOString().split('T')[0] : null;

        return res.status(StatusCodes.OK).json({
            bookTitle: book.title,
            bookAuthor: book.author,
            bookImage: book.image,
            bookStartDate: startDate,
            bookEndDate: endDate,
            bookRemind: book.remind,
            bookReview:book.review,
            bookScore: book.score,
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const changeDate = async (req, res) => {
    try {
        const { isbn, sDate, eDate } = req.body;
        const { user, book } = await findUserAndBook(req.user.id, isbn);


        const isValidDate = (dateString) => {
            const date = new Date(dateString);
            return !isNaN(date.getTime());
        };

        if (sDate && !isValidDate(sDate)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: '시작 날짜 형식이 올바르지 않습니다.'
            });
        }

        if (eDate && !isValidDate(eDate)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: '마감 날짜 형식이 올바르지 않습니다.' 
            });
        }

        book.startDate = sDate? new Date(sDate) : null;
        book.endDate = eDate? new Date(eDate) : null;

        if (book.endDate === null) {
            book.readStatus = false;
        } else {
            book.readStatus = true;
        }

        await user.save();

        return res.status(StatusCodes.OK).json({
            bookStatus: book.readStatus,
            bookStartDate: book.startDate,
            bookEndDate: book.endDate
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const remind = async (req, res) => {
    try {
        const { isbn, context } = req.body;
        const { user, book } = await findUserAndBook(req.user.id, isbn);
        book.remind.unshift(context);
        await user.save();
        
        return res.status(StatusCodes.OK).json({
            bookRemind: book.remind
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const deleteRemind = async (req, res) => {
    try {
        const { isbn, index } = req.body;
        const remindIndex = parseInt(index);
        const { user, book } = await findUserAndBook(req.user.id, isbn);

        if (remindIndex >= 0 && remindIndex < book.remind.length) {
            book.remind.splice(remindIndex, 1);
            await user.save();

            return res.status(StatusCodes.OK).json({
                bookRemind: book.remind
            });
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "유효하지 않은 인덱스입니다."
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const review = async (req, res) => {
    try {
        const { isbn, context, score } = req.body;
        const bookScore = parseFloat(score);
        if (bookScore < 0 || bookScore > 5) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "점수는 0~5 사이로 입력하세요."
            });
        }
        const { user, book } = await findUserAndBook(req.user.id, isbn);

        book.review = context;
        book.score = bookScore;
        await user.save();

        return res.status(StatusCodes.OK).json({
            bookReview: book.review,
            bookScore: book.score
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const deleteBook = async (req, res) => {
    try {
        const { isbn } = req.body;
        const { user, book } = await findUserAndBook(req.user.id, isbn);

        user.books = user.books.filter(book => book.isbn !== isbn);
        await user.save();

        return res.status(StatusCodes.OK).json({
            message: '책이 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '서버 오류' 
        });
    }
}

const findUserAndBook = async (userId, isbn) => {
    const user = await User.findOne({ _id: userId });
    if (!user) {
        throw { status: StatusCodes.BAD_REQUEST, message: "유효하지 않은 토큰입니다." };
    }

    const book = user.books.find(book => book.isbn === isbn);
    if (!book) {
        throw { status: StatusCodes.NOT_FOUND, message: "책을 찾을 수 없습니다." };
    }

    return { user, book };
};

module.exports = { 
    addDeletelike, 
    searchBooks,
    selectBook,
    finishReading, 
    bookDetail, 
    changeDate, 
    remind, 
    deleteRemind, 
    review,
    deleteBook
};