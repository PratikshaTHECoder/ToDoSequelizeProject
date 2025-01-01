const express = require('express');
const bodyParser = require('body-parser');
require('./models/index');
const userCtrl = require('./controllers/userController');
const homeCtrl = require('./controllers/homeController');

const { verifyToken } = require('./middlewares/verifyToken');
const upload = require('./middlewares/ImageUpload')

const app = express();
app.use(bodyParser.json());

//============AUTH====================
app.post('/register', upload.single('profileImage'), userCtrl.register);
app.post('/login', userCtrl.Login);
app.get('/getProfile', verifyToken, userCtrl.getProfile);
app.post('/changePassword', verifyToken, userCtrl.changePassword);
app.post('/logout', verifyToken, userCtrl.logout);
app.post('/forgotPassword', userCtrl.forgotPassword);

//=========HOME========================
app.post('/addTask', verifyToken, homeCtrl.addTask);
app.put('/editTask', verifyToken, homeCtrl.editTask);
app.get('/getAllTask', verifyToken, homeCtrl.getAllTask);
app.put('/updateTaskStatus', verifyToken, homeCtrl.updateTaskStatus);
app.delete('/deleteTask', verifyToken, homeCtrl.deleteTask);







app.listen(4000, () => {
    console.log("app is running on http://localhost:4000");
});


