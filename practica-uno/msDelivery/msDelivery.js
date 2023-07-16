//8080 -> msRestaurant
//8081 -> msClient
//8083 -> msDelivery
//9500 -> msLogin

const express = require('express');
const app = express();
const port = 8083;

const microService = "msDelivery";
const axios = require('axios').default;

const host = "http://localhost"
const msRestaurantURI = "http://182.18.7.5:8080"
const msClientURI     = "http://182.18.7.10:8081"
const msDeliveryURI   = "http://182.18.7.15:8083"

const status = ["Received","On the way", "Delivered"];

var orders = [
   {
      "orderId": 1,
      "dish": "Pizza",
      "status": "Received",
   }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
   res.send({ status: microService + ' is Runnig at http://182.18.7.15:' + port });
});

// Marcar como entregado
app.post('/markOrderAsDelivered', function (req, res) {
   let orderId = req.body.orderId;
   let order = orders.find(o => o.orderId == orderId);
   order.status = "Delivered";
   res.send(order);
});

// Recibir pedido del restaurante
app.post('/receiveOrderFromRestaurant', (req, res) => {
   let order = req.body;
   order['status']="Received";
   orders.push(order);
   res.send(order);
});

// Informar estado del pedido al cliente
app.post('/orderStatus', function (req, res) {
   let orderId = req.body.orderId;
   let order = orders.find(o => o.orderId == orderId);
   res.send(order);
});

var server = app.listen(port, () => {
   console.log(microService + ' is Runnig at http://182.18.7.15:' + port);
});





