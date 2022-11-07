require('dotenv').config()

const jwt = require('jsonwebtoken');
const { Router } = require('express');
const { authenticateToken, authenticateHeader, checkAdmin } = require('../middleware')
const db = require('../db');

const router = Router();

router.post('/', [authenticateHeader, authenticateToken, checkAdmin], async (req, res) => {
    const { phone, balance } = req.body;
    if (balance <= 0) {
        return res.status(400).json({
            status: 0,
            msg: "Balance value cannot be lower than 0"
        });
    }
    const queryResult = await db.promise().query("SELECT * FROM users WHERE phone=? LIMIT 1", [phone]);
    const result = queryResult[0][0];
    if (!result) {
        return res.status(400).json({
            status: 0,
            msg: "Target user not found"
        });
    }
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // db.query(
    //     "UPDATE users SET balance=balance+$1, updated_at=$2 WHERE phone=$3", [balance, timestamp, phone], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     });

    // db.query(
    //     "INSERT INTO topup (user_phone, amount, created_at) VALUES ($1,$2,$3)", [phone, balance, timestamp], (err, results, fields) => {
    //         if (err) {
    //             console.log(err);
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [balance, timestamp, phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    db.execute(
        "INSERT INTO topup (user_phone, amount, created_at) VALUES (?,?,?)", [phone, balance, timestamp], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Server Error");
            }
        }
    );
    return res.status(200).json({
        status: 1,
        msg: "Topup success"
    });
});


module.exports = router;