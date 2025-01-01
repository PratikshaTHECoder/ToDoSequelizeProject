const e = require('express');
const { StatusCodes, Messages } = require('../Constant');
const db = require('../models');
const { where } = require('sequelize');
const User = db.User;
const Task = db.Task;


const addTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { task } = req.body;
        if (!task) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.Task,
            });
        }
        const userExit = await User.findOne({ where: { id: userId } })
        if (!userExit) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.UserNotFound,
            });
        }
        const addTask = await Task.create({
            userId,
            task,
        })
        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.TaskSuccess,
            data: addTask,
        });

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.INTERNAL_SERVER_ERROR });
    }
}

const editTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId, task } = req.body;
        if (!taskId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.TaskId
            })
        }
        if (!task) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                message: Messages.Task
            })
        }
        const userExit = await User.findOne({ where: { id: userId } })
        if (!userExit) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.UserNotFound
            })
        }
        const TaskExits = await Task.findOne({ where: { id: taskId } })
        if (!TaskExits) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.TaskExist
            })
        }
        await Task.update({ task }, { where: { id: taskId } })
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            Messages: Messages.TaskUpdateSuccess
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.INTERNAL_SERVER_ERROR });
    }
}

const getAllTask = async (req, res) => {
    try {
        const data = await Task.findAll({})
        if (!data) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.STATUSSUCCESS,
                message: Messages.DataNotFound,
            })
        }
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.DataSuccess,
            data: [data]
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.INTERNAL_SERVER_ERROR });

    }
}

const updateTaskStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId, status } = req.body;
        if (!taskId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.TaskId
            })
        }
        if (!status) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                message: Messages.Task
            })
        }
        const userExit = await User.findOne({ where: { id: userId } })
        if (!userExit) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.UserNotFound
            })
        }
        const TaskExits = await Task.findOne({ where: { id: taskId } })
        if (!TaskExits) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.TaskExist
            })
        }
        await Task.update({ status }, { where: { id: taskId } })
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            Messages: Messages.StatusUpdateSuccess
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.INTERNAL_SERVER_ERROR });
    }
}

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        if (!taskId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.TaskId
            })
        }
        const TaskExits = await Task.findOne({ where: { id: taskId } })
        if (!TaskExits) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.TaskExist
            })
        }
        await Task.destroy({ where: { id: taskId } })
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            Messages: Messages.DeleteSuccess
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.INTERNAL_SERVER_ERROR });

    }
}


module.exports = {
    addTask,
    editTask,
    getAllTask,
    updateTaskStatus,
    deleteTask
};
