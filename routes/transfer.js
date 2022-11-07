require('dotenv').config()

const jwt = require('jsonwebtoken');
const { Router } = require('express');
const { authenticateToken, authenticateHeader, authenticateTokenApi } = require('../middleware')
const db = require('../db');
const request = require('request');

const router = Router();
router.post('/bank', [authenticateTokenApi], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const bank = result[0][0];
    if (!bank)
        return res.status(400).json({
            status: 0,
            msg: "Target user not found"
        });
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Decrease balance from bank's
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Increase user's balance
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, phone_target], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    db.execute(
        "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [bank.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        }
    );
    return res.status(200).json({
        status: 1,
        msg: "Transfer success"
    });
});

router.post('/peacepay', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=082169420720 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const peacepay = result[0][0];
    // if (!peacepay)
    //     return res.status(400).json({
    //         status: 0,
    //         msg: "Target user not found"
    //     });
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, peacepay.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call peace pay' API
    var login_data = {
        'method': 'POST',
        'url': 'https://e-money-kelompok-12.herokuapp.com//api/login',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "number": "0898989898",
            "password": "gallecoins"
        })

    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = JSON.parse(response.body);
        const token = result_call.token;
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://e-money-kelompok-12.herokuapp.com//api/transfer',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                "amount": amount,
                "tujuan": phone_target
            })

        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            // const result_call = JSON.parse(response.body)
            if (response.statusCode != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [peacepay.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
});

router.post('/payphone', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=081263239502 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const payphone = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, payphone.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call payPhone' API
    var login_data = {
        'method': 'POST',
        'url': 'http://fp-payphone.herokuapp.com/public/api/login',
        formData: {
            'telepon': '0898989898',
            'password': 'gallecoins'
        }
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = JSON.parse(response.body);
        const token = result_call.token;
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'http://fp-payphone.herokuapp.com/public/api/transfer',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            formData: {
                'jumlah': amount,
                'telepon': phone_target,
                'emoney': 'payphone'
            }
        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            // const result_call = JSON.parse(response.body)
            if (response.statusCode != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [payphone.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
});

router.post('/ecoin', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=081359781268 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const ecoin = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, ecoin.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call ecoin' API
    var login_data = {
        'method': 'POST',
        'url': 'https://ecoin10.my.id/api/masuk',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "phone": "0898989898",
            "password": "gallecoins"
        })
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = JSON.parse(response.body);
        const token = result_call.token;
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://ecoin10.my.id/api/transfer',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                "phone": "0898989898",
                "password": "gallecoins",
                "tfmethod": 1,
                "amount": amount,
                "phone2": phone_target,
                "description": "Transfer antar emoney gallecoins"
            })
        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            // const result_call = JSON.parse(response.body)
            // console.log(result_call)
            if (response.statusCode != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [ecoin.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
});

router.post('/cuanind', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=087654321 LIMIT 1`);

    const cuanind = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, cuanind.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call cuanind's API
    var login_data = {
        'method': 'POST',
        'url': 'https://e-money-kelompok5.herokuapp.com/cuanind/user/login',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "notelp": "0898989898",
            "password": "gallecoins"
        })
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = response.body;
        const token = result_call;
        if (token == null)
            return res.status(400).json("Invalid token");

        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://e-money-kelompok5.herokuapp.com/cuanind/transfer',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                "amount": amount,
                "target": phone_target
            })

        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            const result_call = response.body
            // const result_call = JSON.parse(response.body)
            // console.log(result_call)
            if (response.statusCode != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [cuanind.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
})

router.post('/moneyz', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=081547123069 LIMIT 1`);

    const moneyz = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, moneyz.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call moneyz's API
    var login_data = {
        'method': 'POST',
        'url': 'https://moneyz-kelompok6.herokuapp.com/api/login',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "phone": "0898989899",
            "password": "gallecoins"
        })
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        // const result_call = response.body;
        const result_call = JSON.parse(response.body);
        // console.log(response.body);
        const token = result_call.token;
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://moneyz-kelompok6.herokuapp.com/api/user/transfer',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                "nominal": amount,
                "nomortujuan": phone_target
            })

        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            // const result_call = response.body
            // const result_call = JSON.parse(response.body)
            // console.log(result_call)
            if (response.statusCode != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });
    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [moneyz.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
})

router.post('/padpay', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=089999999999 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const padpay = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, padpay.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call padpay's API
    var login_data = {
        'method': 'POST',
        'url': 'https://mypadpay.xyz/padpay/api/login.php',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "email": "galle@gmail.com",
            "password": "gallecoins"
        })
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = JSON.parse(response.body);
        const token = result_call.Data.jwt;
        console.log(token)
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://mypadpay.xyz/padpay/api/transaksi.php/64',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                "email": "galle@gmail.com",
                "password": "gallecoins",
                "jwt": token,
                "tujuan": phone_target,
                "jumlah": amount
            })
        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            // const result_call = JSON.parse(response.body)
            // console.log(response.body)
            if (response.statusCode != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [padpay.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
})

router.post('/payfresh', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=0811111111 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const payfresh = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, payfresh.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call payfresh's API
    var login_data = {
        'method': 'POST',
        'url': 'https://payfresh.herokuapp.com/api/login',
        'headers': {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "email": "galle@gmail.com",
            "password": "gallecoins"
        })
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = JSON.parse(response.body);
        const token = result_call.token;
        // console.log(token)
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://payfresh.herokuapp.com/api/user/transfer/41',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,

            },
            body: JSON.stringify({
                "amount": amount,
                "phone": phone_target
            })
        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            // console.log(response.statusCode)
            // const result_call = JSON.parse(response.body)
            if (response.statusCode != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [payfresh.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
})

router.post('/talangin', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=08123123123 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const talangin = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, talangin.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call talangin's API
    var login_data = {
        'method': 'POST',
        'url': 'https://e-money-kelomok-11.000webhostapp.com/api/login.php',
        body: JSON.stringify({
            "nama": "gallecoins",
            "email": "galle@gmail.com",
            "password": "gallecoins",
            "phone": "0898989898"
        })
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = JSON.parse(response.body);
        const token = result_call.jwt;
        // console.log(token)
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://e-money-kelomok-11.000webhostapp.com/api/transfer.php',
            body: JSON.stringify({
                "pengirim": "0898989898",
                "penerima": phone_target,
                "jumlah": amount,
                "jwt": token
            })
        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            // console.log(response.statusCode)
            // const result_call = JSON.parse(response.body)
            if (response.statusCode == 400)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [payfresh.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
})

router.post('/kcnpay', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=0811811821 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const kcnpay = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, kcnpay.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call kcnpay's API
    var login_data = {
        'method': 'POST',
        'url': 'https://kecana.herokuapp.com/login',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "email": "galle@gmail.com",
            "password": "gallecoins"
        })
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        // const result_call = JSON.parse(response.body);
        const token = response.body;
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://kecana.herokuapp.com/transfer',
            'headers': {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "id": "40",
                "nohp": phone_target,
                "nominaltransfer": amount
            })
        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            const result_call = JSON.parse(response.body)
            if (result_call.status != 200)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [kcnpay.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
})

router.post('/buski', [authenticateToken], async (req, res) => {
    const { amount, description, phone_target } = req.body;
    const result = await db.promise().query(`SELECT * FROM users WHERE phone=089191919119 LIMIT 1`);
    // const result = await db.promise().query(`SELECT * FROM users WHERE phone=${phone_target} LIMIT 1`);
    const buski = result[0][0];

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    // Increase balance from bank's
    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, buski.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    // Decrease user's balance
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, req.response.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });

    // Call buski's API
    var login_data = {
        'method': 'POST',
        'url': 'https://arielaliski.xyz/e-money-kelompok-2/public/buskidicoin/publics/login',
        'headers': {
            'Content-Type': 'application/json'
        },
        formData: {
            'username': 'gallecoins',
            'password': 'gallecoins'
        }
    };
    request(login_data, function (error, response) {
        if (error) return res.status(500).json(error);
        const result_call = JSON.parse(response.body);
        const token = result_call.message.token;
        if (token == null)
            return res.status(400).json("Invalid token");
        // console.log("test");
        // Transfer
        var transfer_data = {
            'method': 'POST',
            'url': 'https://arielaliski.xyz/e-money-kelompok-2/public/buskidicoin/admin/transfer',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            formData: {
                'nomer_hp': '0898989898',
                'nomer_hp_tujuan': phone_target,
                'e_money_tujuan': 'Buski Coins',
                'amount': amount,
                'description': description
            }

        };
        request(transfer_data, function (error, response) {
            if (error) return res.status(500).json(error);
            const result_call = JSON.parse(response.body)
            if (result_call.status != 201)
                return res.status(400).json(result_call);
            return res.status(200).json({
                status: 1,
                msg: "Transfer success"
            });
        });
    });

    // db.execute(
    //     "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [buski.phone, phone_target, description, amount, timestamp], (err, results, fields) => {
    //         if (err) {
    //             return res.status(500).json("Server Error");
    //         }
    //     }
    // );
})

router.post('/', [authenticateToken, authenticateHeader], async (req, res) => {
    const { amount, phone, description } = req.body;
    const fromUser = await db.promise().query(`SELECT * FROM users WHERE phone=${req.response.phone} LIMIT 1`);
    const result1 = fromUser[0][0];
    const targetUser = await db.promise().query(`SELECT * FROM users WHERE phone=? LIMIT 1`, [phone]);
    const result2 = targetUser[0][0];
    if (amount > result1.balance)
        return res.status(400).json({
            status: 0,
            msg: "Insufficient balance"
        });
    if (!result2)
        return res.status(400).json({
            status: 0,
            msg: "Target user not found"
        });

    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    db.execute(
        "UPDATE users SET balance=balance+?, updated_at=? WHERE phone=?", [amount, timestamp, result2.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    db.execute(
        "UPDATE users SET balance=balance-?, updated_at=? WHERE phone=?", [amount, timestamp, result1.phone], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        });
    db.execute(
        "INSERT INTO transfer (user_phone, user_target_phone, description, amount, created_at) VALUES (?,?,?,?,?)", [result1.phone, result2.phone, description, amount, timestamp], (err, results, fields) => {
            if (err) {
                return res.status(500).json("Server Error");
            }
        }
    );
    res.status(200).json({
        status: 1,
        msg: "Transfer success"
    });
});

module.exports = router;