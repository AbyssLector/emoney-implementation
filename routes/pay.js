require('dotenv').config()

const jwt = require('jsonwebtoken');
const { Router } = require('express');
const { authenticateToken, authenticateHeader } = require('../middleware')
const db = require('../db');

const router = Router();

router.post('/', [authenticateHeader, authenticateToken], async (req, res) => {
    const {
        amount, buyer, description,
        marketplace, market_transaction_id,
    } = req.body;
    if (!amount || !buyer || !description || !marketplace || !market_transaction_id)
        return res.status(400).json({
            status: 0,
            msg: "Invalid or wrong parameters"
        });
    const queryResult = await db.promise().query('SELECT * FROM users WHERE user_id=? LIMIT 1', [req.response.id]);
    const user = queryResult[0][0];
    if (user.balance < amount) return res.status(400).json({
        status: 0,
        msg: "Balance insufficient"
    });

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json({
                    status: 0,
                    msg: "Server Error"
                });
            }
        });
    db.execute(
        "INSERT INTO transaction (user_phone,description,marketplace,market_transaction_id,timestamp,amount,buyer) VALUES (?,?,?,?,?,?,?)",
        [req.response.phone, description, marketplace, market_transaction_id, timestamp, amount, buyer], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: 0,
                    msg: "Server Error"
                });
            }
        });
    res.status(200).json({
        status: 1,
        msg: "Payment success"
    });
});


module.exports = router;