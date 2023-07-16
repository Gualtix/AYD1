//8080 -> msRestaurant
//8081 -> msClient
//8083 -> msDelivery
//9500 -> msLogin

//5d
//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZWxpdmVyeSIsImlhdCI6MTY1NDIzMzAxNSwiZXhwIjoxNjU0NjY1MDE1fQ.w_VYwKS9AVxPfMXml3mxTs-AGcwmRswRCZBxHRuemyY

const host = "http://localhost"
const msRestaurantURI = "http://182.18.7.5:8080"
const msClientURI     = "http://182.18.7.10:8081"
const msDeliveryURI   = "http://182.18.7.15:8083"

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 9500;
const microService = "msLogin";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const axios = require('axios').default;

const roles = ["delivery", "restaurant", "client"];

var logs = [];

const getCurrentTime = () => {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

const ensureAuthenticated = (req, res, next) => {

    logs.push({
        "date": getCurrentTime(),
        "microService": "login",
        "action": "ensureAuthenticated"
    });

    if (!req.headers.authorization) {
        return res.status(401).send({ message: "No tienes autorización" });
    }

    // Get the last part from a authorization header string like "bearer token-value"
    const token = req.headers.authorization.split(" ")[1];

    // Validate the token
    jwt.verify(token, "secretKey", (err, decoded) => {
        // Check if any error occurred while decoding
        if (err) {
            console.log(err);
            return res.status(401).send({ message: "Invalid Token" });
        }

        // If everything is good, save to request for use in other routes
        req.user = decoded;
        next();
    });
};

app.get('/', (req, res) => {
    res.send({ status: microService +' is Runnig at http://182.18.7.20:' + port });
});

app.get('/logs', (req, res) => {
    res.send({ logs: logs });
});

// Avisar al repartidor que ya está listo el pedido
app.post('/notifyDeliveryThatOrderIsReady', ensureAuthenticated, async (req, res) => {

    logs.push({
        "date": getCurrentTime(),
        "microService": "msRestaurant",
        "action": "notifyDeliveryThatOrderIsReady"
    });

    let orderId = req.body;
    await axios.post(msRestaurantURI+"/notifyDeliveryThatOrderIsReady", orderId)
        .then(response => {
            res.send(response.data);
        }
        ).catch(error => {
            res.send(error);
        });
});

// Solicitar pedido al restaurante
app.post('/createOrder', ensureAuthenticated, async (req, res) => {

    logs.push({
        "date": getCurrentTime(),
        "microService": "msClient",
        "action": "createOrder"
    });

    let order = req.body;
    await axios.post(msClientURI+"/createOrder", order)
        .then(response => {
            res.send(response.data);
        }
        ).catch(error => {
            res.send(error);
        });
});

// Verificar estado del pedido al restaurante
app.post('/checkOrderToRestaurant', ensureAuthenticated, async (req, res) => {

    logs.push({
        "date": getCurrentTime(),
        "microService": "msClient",
        "action": "checkOrderWithDelivery"
    });

    let orderId = req.body;
    await axios.post(msClientURI+"/checkOrderToRestaurant", orderId)
        .then(response => {
            res.send(response.data);
        }
        ).catch(error => {
            res.send(error);
        });
});


// Verificar estado del pedido al repartidor
app.post('/checkOrderWithDelivery', ensureAuthenticated, async (req, res) => {

    logs.push({
        "date": getCurrentTime(),
        "microService": "msClient",
        "action": "checkOrderWithDelivery"
    });

    let orderId = req.body;
    await axios.post(msClientURI+"/checkOrderWithDelivery", orderId)
        .then(response => {
            res.send(response.data);
        }
        ).catch(error => {
            res.send(error);
        });
});

app.post('/login', (req, res) => {

    logs.push({
        "date": getCurrentTime(),
        "microService": "msLogin",
        "action": "login",
        "role": req.body.role
    });

    let user = req.body;
    let role = roles.find(r => r == user.role);
    if (!role) {
        return res.status(401).send({ message: "You have No Authorization" });
    }
    // Create a token
    const token = jwt.sign({ sub: user.role }, "secretKey", {
        expiresIn: "5d"
    });

    // Set the token in the response
    res.send({ token });
});

var server = app.listen(port, () => {
    console.log(microService + ' is Runnig at http://182.18.7.20:' + port);
});






