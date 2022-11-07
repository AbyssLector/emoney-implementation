const { Router } = require('express');
const { append } = require('express/lib/response');
const db = require('../db');
const { authenticateHeader } = require('../middleware')
const router = Router();

// Public
router.post('/', authenticateHeader, async (req, res) => {
    const { email, username, password, phone } = req.body;
    if (!email || !username || !password || !phone)
        return res.status(400).json("Invalid or wrong parameters");
    // const queryResult = await db.query(`SELECT * FROM users WHERE username=$1`, [username]);
    const queryResult = await db.promise().query(`SELECT * FROM users WHERE username=?`, [username]);
    const result = queryResult[0][0];

    if (result)
        return res.status(400).json("Username already exist");

    // const queryResult2 = await db.query(`SELECT * FROM users WHERE email=$1`, [email]);
    const queryResult2 = await db.promise().query(`SELECT * FROM users WHERE email=?`, [email]);
    const result2 = queryResult2[0][0];
    if (result2)
        return res.status(400).json("Email already exist");
    // const queryResult3 = await db.query(`SELECT * FROM users WHERE phone=$1`, [phone]);
    const queryResult3 = await db.promise().query(`SELECT * FROM users WHERE phone=?`, [phone]);
    const result3 = queryResult3[0][0];
    if (result3)
        return res.status(400).json("Phone number already exist");

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    db.execute(
        "INSERT INTO users (phone, email, username, password, balance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [phone, email, username, password, 0, timestamp, timestamp], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Server error");
            }
            res.status(200).json("User has been registered!");
        });
});

module.exports = router;