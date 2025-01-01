const e = require('express');
const { StatusCodes, Messages } = require('../Constant');
const blacklistedTokens = new Set();
const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const SecretKey = "secretkey";
const nodemailer = require("nodemailer");



const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const profileImage = req.file ? req.file.path : null;

        if (!name) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.Name,
            });
        }
        if (!profileImage) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.ProfileImage,
            });
        }
        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.Email,
            });
        }
        if (!password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.PassWord,
            });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.UserExist,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage
        });
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, SecretKey, { expiresIn: '1h' });
        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.RegisterSuccess,
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, profileImage: newUser.profileImage },
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.Error,
            error: error.message,
        });
    }
};

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.Email,
            });
        }
        if (!password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.PassWord,
            });
        }
        const userExist = await User.findOne({ where: { email } });
        if (!userExist) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.InvalideCredentials,
            });
        }
        const isPasswordValid = await bcrypt.compare(password, userExist.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.InvalideCredentials,
            });
        }

        const token = jwt.sign({ id: userExist.id, email: userExist.email }, SecretKey, { expiresIn: '1h' });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.LoginSuccess,
            token,
            user: { id: userExist.id, email: userExist.email, name: userExist.name },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.Error,
            error: error.message,
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userExist = await User.findOne({ where: { id: userId } });
        if (userExist) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.STATUSSUCCESS,
                message: Messages.DataSuccess,
                data: { id: userExist.id, name: userExist.name, profileImage: userExist.profileImage, email: userExist.email, createdAt: userExist.createdAt },
            });
        }
        return res.status(StatusCodes.NOT_FOUND).json({ status: StatusCodes.STATUSERROR, message: Messages.UserNotExist });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.Error, error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.TokenRequired,
            });
        }
        blacklistedTokens.add(token);
        res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.LogoutSuccess,
        });
    } catch (error) {
        res.status(500).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.INTERNAL_SERVER_ERROR,
            error: error.message,
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.OldPassword,
            });
        }
        if (!newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.NewPassword,
            });
        }
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.UserNotFound,
            });
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.InvalidOldPassword,
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update({ password: hashedPassword }, { where: { id: userId } });
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.PasswordUpdated,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.INTERNAL_SERVER_ERROR,
            error: error.message,
        });
    }
};


// Generate a random password
const generateRandomPassword = () => {
    const length = 10;
    const charset = Messages.PASSWORD_CHARSET
    let temporaryPassword = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        temporaryPassword += charset.charAt(randomIndex);
    }

    return temporaryPassword;
};

const sendEmail = async (mailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            service: Messages.EMAIL_SERVICE,
            auth: {
                user: Messages.EMAIL_USER,
                pass: Messages.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        throw error;
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res
            .status(400)
            .json({ status: 0, message: Messages.Email });
    }
    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: 0, message: Messages.UserNotFound });
        }

        // Generate a temporary password
        const temporaryPassword = generateRandomPassword();
        const saltRounds = 10;
        const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, saltRounds);

        // Update user's password in the database
        await user.update({ password: hashedTemporaryPassword });

        // Send the email with the temporary password
        const mailOptions = {
            from: Messages.EMAIL_FROM, // Your email address
            to: email,
            subject: Messages.EMAIL_SUBJECT,
            html: `<p>You have requested a password reset. Here is your temporary password: <strong>${temporaryPassword}</strong></p><p>Please use this temporary password to log in and reset your password.</p>`,
        };

        await sendEmail(mailOptions);
        res.json({
            status: 1,
            message: Messages.TEMPMESG,
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: Messages.INTERNAL_SERVER_ERROR, message: Messages.INTERNAL_SERVER_ERROR });
    }
};

module.exports = {
    register,
    Login,
    getProfile,
    logout,
    blacklistedTokens,
    changePassword,
    forgotPassword,
};

