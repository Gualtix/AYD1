const express = require('express');
const app = express();
const port = 8080;

const microService = "msRestaurant";

const host = "http://localhost"
const msRestaurantURI = "http://182.18.7.5:8080"
const msClientURI     = "http://182.18.7.10:8081"
const msDeliveryURI   = "http://182.18.7.15:8083"

const axios = require('axios').default;

const status = ["Pending", "In Preparation", "Prepared", "Delivered"];

var orders = [

   {
      "orderId": 1,
      "dish": "Pizza",
      "status": "Pending",
   }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
   res.send({ status: microService + ' is Runnig at http://182.18.7.5:' + port });
});

// Recibir pedido del cliente
app.post('/createOrder', function (req, res) {
   let order = req.body;
   order.orderId = orders.length + 1;
   order['status'] = "Pending";
   orders.push(order);
   res.send(order);
});

// Informar estado del pedido al cliente
app.post('/orderStatus', function (req, res) {
   let orderId = req.body.orderId;
   let order = orders.find(o => o.orderId == orderId);
   res.send(order);
});

// Avisar al repartidor que ya está listo el pedido
app.post('/notifyDeliveryThatOrderIsReady', async (req, res) => {
   let orderId = req.body.orderId;
   let order = orders.find(o => o.orderId == orderId);
   await axios.post(msDeliveryURI + "/receiveOrderFromRestaurant", order)
      .then(response => {
         res.send(response.data);
      }
      ).catch(error => {
         res.send(error);
      });
});

var server = app.listen(port, () => {
   console.log(microService + ' is Runnig at http://182.18.7.5:' + port);
});





