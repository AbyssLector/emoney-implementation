require('dotenv').config()

const jwt = require('jsonwebtoken');
const { Router } = require('express');
const { authenticateToken, authenticateHeader } = require('../middleware')
const db = require('../db');

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
    // const queryResult = await db.query(`SELECT phone, email, username, balance FROM users WHERE user_id=${req.response.id} LIMIT 1`);
    const queryResult = await db.promise().query(`SELECT phone, email, username, balance FROM users WHERE user_id=${req.response.id} LIMIT 1`);
    const result = queryResult[0][0];
    res.status(200).json(result);
});

router.get('/history', authenticateToken, async (req, res) => {
    // const queryResult = await db.query(`SELECT * FROM transaction WHERE user_phone=$1`, [req.response.phone]);
    const queryResult = await db.promise().query(`SELECT * FROM transaction WHERE user_phone=?`, [req.response.phone]);
    const transaction = queryResult[0];

    // const queryResult2 = await db.query(`SELECT * FROM topup WHERE user_phone=$1`, [req.response.phone]);
    const queryResult2 = await db.promise().query(`SELECT * FROM topup WHERE user_phone=?`, [req.response.phone]);
    const topup = queryResult2[0];

    // const queryResult3 = await db.query(`SELECT * FROM transfer WHERE user_phone=? OR user_target_phone=?`, [req.response.phone, req.response.phone]);
    const queryResult3 = await db.promise().query(`SELECT * FROM transfer WHERE user_phone=? OR user_target_phone=?`, [req.response.phone, req.response.phone]);
    const transfer = queryResult3[0];
    return res.status(200).json({
        transaction_history: transaction,
        topup_history: topup,
        transfer_history: transfer
    });
});

router.post('/edit', [authenticateHeader, authenticateToken], async (req, res) => {
    const { email, username, password, phone } = req.body;

    const queryResult4 = await db.query(`SELECT * FROM users WHERE user_id=$1`, [req.response.id]);
    // const queryResult4 = await db.promise().query(`SELECT * FROM users WHERE user_id=?`, [req.response.id]);
    const users = queryResult4['rows'][0];
    const newUsers = {
        email: email || users.email,
        username: username || users.username,
        password: password || users.password,
        phone: phone || users.phone
    };

    const queryResult = await db.query(`SELECT * FROM users WHERE username=$1`, [newUsers.username]);
    // const queryResult = await db.promise().query(`SELECT * FROM users WHERE username=?`, [username]);
    const result = queryResult['rows'][0];
    if (result)
        return res.status(400).json("Username already exist");

    const queryResult2 = await db.query(`SELECT * FROM users WHERE email=$1`, [newUsers.email]);
    const result2 = queryResult2['rows'][0];
    if (result2)
        return res.status(400).json("Email already exist");
    // const queryResult3 = await db.query(`SELECT * FROM users WHERE phone=$1`, [newUsers.phone]);
    // // const queryResult3 = await db.promise().query(`SELECT * FROM users WHERE phone=?`, [phone]);
    // const result3 = queryResult3['rows'][0];
    // if (result3)
    //     return res.status(400).json("Phone number already exist");


    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    // db.query(
    //     "UPDATE users SET phone=$1, email=$2, username=$3, password=$4, updated_at=$5 WHERE user_id=$6", [newUsers.phone, newUsers.email, newUsers.username, newUsers.password, timestamp, req.response.id], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     });
    db.execute(
        "UPDATE users SET phone=?, email=?, username=?, password=?, updated_at=? WHERE user_id=?", [newUsers.phone, newUsers.email, newUsers.username, newUsers.password, timestamp, req.response.id], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    return res.status(200).json("Update user success, please get your token again");
});

router.post('/', (req, res) => {
    const { username, password, phone } = req.body;
    if (username) {
        db.query(`SELECT * FROM users WHERE username=? LIMIT 1`, [username], (err, result, fields) => {
            result = result[0];
            // console.log(result);

            if (err) {
                console.log(err);
                return res.status(401).json('Server error');
            }
            if (!result || result.password !== password)
                return res.status(401).json('Invalid username or password');

            const token = jwt.sign({
                id: result.user_id,
                phone: result.phone,
                username: result.username,
                role: result.role
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.status(200).json({
                msg: 'login success!',
                token: token
            });
        });
    } else if (phone) {
        db.query(`SELECT * FROM users WHERE phone=? LIMIT 1`, [phone], (err, result, fields) => {
            result = result[0];
            // console.log(result);

            if (err) {
                console.log(err);
                return res.status(401).json('Server error');
            }
            if (!result || result.password !== password)
                return res.status(401).json('Invalid username or password');

            const token = jwt.sign({
                id: result.user_id,
                phone: result.phone,
                username: result.username,
                role: result.role
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.status(200).json({
                msg: 'login success!',
                token: token
            });
        });
    } else {
        res.status(400).json({ msg: 'Invalid Parameters' });
    }
});

module.exports = router;