# API E-Money Gallecoins

# Table of Contents

* [Introduction](#introduction)
* [Register: /api/register](#register)
* [JWT Token: /api/users](#jwt-token)
* [User Data: /api/users](#user-data)
* [User History: /api/users](#user-history)
* [Edit User: /api/users](#edit-user)
* [Topup: /api/topup](#topup)
* [Pay: /api/pay](#pay)
* [Transfer: /api/transfer](#transfer)
* [Transfer from another API: /api/transfer/bank](#transfer-bank)

### Introduction

> To use this api, register in [/api/register](#register)

This API use JWT Token as authentication. This token **must** be included in `Authorization Bearer Token` every time user make a request except for [register](#register) and [get token](#get-token). <br>
This API using JSON as input and output. For header, make sure to use `Content-Type application/json` every time using POST request. <br>
For api config, read [here](config/README.md)

### Register

POST /api/register <br>
Create an account in Gallecoins e-money API. <br>
Parameters:
- `phone`
- `email` 
- `username`
- `password`

Sample in body request:
```json
{
    "email": "sample@gmail.com",
    "phone": "08123456789",
    "username": "sampleUsername",
    "password": "samplePassword"
}
```

### JWT Token

POST /api/users <br>
Get JWT token from API. <br>
Parameters: 
- `username` OR 'phone'
- `password`

Sample in body request:
```json
{
    "username": "sampleUsername",
    "password": "samplePassword"
}
```
OR
```json
{
    "phone": "08xxxxxxxx",
    "password": "samplePassword"
}
```

Sample output: 
```json
{
    "msg": "login success!",
    "token": "YOUR_JWT_TOKEN"
}
```
***Don't forget to store your token in Authentication: Bearer Token***

### User Data

GET /api/users <br>
Get account's detail from API. <br>
Parameters: none 

Sample output:
```json
{
    "phone": "08123456789",
    "email": "sample@gmail.com",
    "username": "sampleUsername",
    "balance": 123000
}
```

### User History

GET /api/users/history <br>
Get account's history of transaction, transfer, and topup from API. <br>
Parameters: none 

Sample output:
```json
{
    "transaction_history": [
        {
            "transaction_id": 7,
            "user_phone": "0812345678",
            "description": "Paying books",
            "marketplace": "Diaralley",
            "market_transaction_id": 1234,
            "timestamp": "2022-03-17T13:01:39.000Z",
            "amount": 10000,
            "buyer": "Drachma"
        }
    ],
    "topup_history": [
        {
            "topup_id": 8,
            "user_phone": "0812345678",
            "amount": 20000,
            "created_at": "2022-04-17T08:05:21.000Z"
        }
    ],
    "transfer_history": [
        {
            "transfer_id": 5,
            "user_phone": "0812345678",
            "user_target_phone": "08111",
            "description": "lorem",
            "amount": 1000,
            "created_at": "2022-03-17T12:59:34.000Z"
        }
    ]
}
```

### Edit User

POST /api/users/edit <br>
Change account's credentials using API. <br>
Parameters (all of them are optional): 
- `email`
- `phone`
- `username`
- `password`

Sample in body request:
```json
{
    "email": "newemail@gmail.com",
    "phone": "08999999999",
    "username": "newUsername",
    "password": "newPassword"
}
```

Sample output: 
```json
"Update user success, please get your token again"
```
After change account's credential, retake token from [JWT Token](#jwt-token)

### Topup (Admin only)

POST /api/topup <br>
Add account's balance using API. <br>

Parameters: 
- `balance`
- `phone`

Sample in body request:
```json
{
    "phone": 20000,
    "balance": 20000
}
```

Sample output: 
```json
"Topup success"
```

### Pay

POST /api/pay <br>
Make a payment using API. <br>
Parameters: 
- `amount`
- `buyer`
- `description`
- `marketplace`
- `market_transaction_id`

Sample in body request:
```json
{
    "amount": 20000,
    "buyer": "Andika",
    "description": "Paying a shoes",
    "marketplace": "Diaralley",
    "market_transaction_id": 13
}
```

Sample output (if success): 
```json
{
    "status": 1,
    "msg": "Payment success" 
}
```

Sample output (if failed, wrong params): 
```json
{
    "status": 0,
    "msg": "Invalid or wrong parameters" 
}
```

Sample output (if failed, insufficient account's balance): 
```json
{
    "status": 0,
    "msg": "Balance insufficient" 
}
```

### Transfer

POST /api/transfer <br>
Transfer your balance to another user balance. <br>
Parameters: 
- `amount`
- `phone` : Target phone number to be transferred.
- `description`


Sample in body request:
```json
{
    "amount": 20000,
    "phone": "081233454",
    "description": "Monthly Rent"
}
```

Sample output (if success): 
```json
{
    "status": 1,
    "msg": "Payment success" 
}
```

Sample output (if Failed): 
```json
{
    "status": 0,
    "msg": "Insufficient balance" 
}
```

### Transfer bank

POST /api/transfer/bank <br>
Transfer your balance to another user balance from different API. <br>
Note, the token is included in body, not in Authorization Bearer <br>
Parameters: 
- `amount`
- `phone` : Target phone number to be transferred.
- `description`
- `token` : your JWT token

```json
{
    "amount": 12000,
    "phone": "081233456",
    "description": "lorem ipsum",
    "token": "YOUR_JWT_TOKEN" 
}
```

if success
```json
{
    "status": 1,
    "msg": "Transfer success" 
}
```

### Integrasi dengan E-Money Lain

List E-Money <br>
`        
        "padpay",
        "payfresh",
        "buskicoins",
        "kcnpay",
        "cuanind",
        "moneyz",
        "payphone",
        "ecoin",
        "talangin",
        "peacepay"
        `
- URL Request
```
api/transfer/(e-money tujuan)
```

- Parameter transfer from Gallecoins to Another E-Money
```
const { username, password, phone }
```

- Payphone <br>
Call Payphone API <br>
` http://fp-payphone.herokuapp.com/public/api/transfer `

Parameter transfer data to Payphone
```
formData: {
                'jumlah': amount,
                'telepon': phone_target,
                'emoney': 'payphone'
            }
```

- Peacepay <br>
Call Peacepay API <br>
` https://e-money-kelompok-12.herokuapp.com//api/transfer `

Parameter transfer data to Peacepay
```
body: JSON.stringify({
                "amount": amount,
                "tujuan": phone_target
            })
```

- Ecoin <br>
Call Ecoin API <br>
` https://ecoin10.my.id/api/transfer `

Parameter transfer data to Ecoin
```
body: JSON.stringify({
                "phone": "0898989898",
                "password": "gallecoins",
                "tfmethod": 1,
                "amount": amount,
                "phone2": phone_target,
                "description": "Transfer antar emoney gallecoins"
            })
```

 - CuanIND <br>
Call CuanIND API <br>
` https://e-money-kelompok5.herokuapp.com/cuanind/transfer `

Parameter transfer data to CuanIND
```
body: JSON.stringify({
                "amount": amount,
                "target": phone_target
            })
```

 - MoneyZ <br>
Call MoneyZ API <br>
` https://moneyz-kelompok6.herokuapp.com/api/user/transfer `

Parameter transfer data to MoneyZ
```
body: JSON.stringify({
                "nominal": amount,
                "nomortujuan": phone_target
            })
```

- Padpay <br>
Call Padpay API <br>
` https://mypadpay.xyz/padpay/api/transaksi.php/64 `

Parameter transfer data to Padpay
```
body: JSON.stringify({
                "email": "galle@gmail.com",
                "password": "gallecoins",
                "jwt": token,
                "tujuan": phone_target,
                "jumlah": amount
            })
```

- Payfresh <br>
Call Payfresh API <br>
` https://payfresh.herokuapp.com/api/user/transfer/41 `

Parameter transfer data to Payfresh
```
body: JSON.stringify({
                "amount": amount,
                "phone": phone_target
            })
```

- Talangin <br>
Call Talangin API <br>
` url': 'https://e-money-kelomok-11.000webhostapp.com/api/transfer.php `

Parameter transfer data to Talangin
```
body: JSON.stringify({
                "pengirim": "0898989898",
                "penerima": phone_target,
                "jumlah": amount,
                "jwt": token
            })
```

- KCNPay <br>
Call KCNPay API <br>
` https://kecana.herokuapp.com/transfer `

Parameter transfer data to KCNPay
```
body: JSON.stringify({
                "id": "40",
                "nohp": phone_target,
                "nominaltransfer": amount
            })
```

- Buski <br>
Call Buski API <br>
` https://arielaliski.xyz/e-money-kelompok-2/public/buskidicoin/admin/transfer `

Parameter transfer data to Buski
```
formData: {
                'nomer_hp': '0898989898',
                'nomer_hp_tujuan': phone_target,
                'e_money_tujuan': 'Buski Coins',
                'amount': amount,
                'description': description
            }
```
