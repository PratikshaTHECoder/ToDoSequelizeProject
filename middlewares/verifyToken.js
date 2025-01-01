const jwt = require("jsonwebtoken");
const SecretKey = "secretkey";
const { blacklistedTokens } = require("../controllers/userController");
const { StatusCodes } = require("../Constant");
const Constant = require("../Constant");

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            status: StatusCodes.STATUSERROR,
            message: Constant.Messages.VERIFYTOKENERROR,
        });
    }

    // Check if the token is blacklisted
    if (blacklistedTokens.has(token)) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Constant.Messages.VERIFYTOKENERROR2,
        });
    }
    try {
        const decoded = jwt.verify(token, SecretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: StatusCodes.STATUSERROR,
            message: Constant.Messages.VERIFYTOKENERROR3,
        });
    }
};

module.exports = { verifyToken };
