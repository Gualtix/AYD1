#8080 -> msRestaurant
#8081 -> msClient
#8083 -> msDelivery
#9500 -> msLogin

from flask import Flask
from flask import request
import requests

port = 8081

app = Flask(__name__)

host = "http://localhost"
msRestaurantURI = "http://182.18.7.5:8080"
msClientURI     = "http://182.18.7.10:8081"
msDeliveryURI   = "http://182.18.7.15:8083"

# Verificar estado del pedido al repartidor
@app.route('/checkOrderWithDelivery', methods=['POST'])
def checkOrderWithDelivery():
    orderId = request.get_json().get('orderId')
    res = requests.post(msDeliveryURI+"/orderStatus", data={'orderId': orderId})
    return res.json()

# Verificar estado del pedido al restaurante
@app.route('/checkOrderToRestaurant', methods=['POST'])
def checkOrderToRestaurant():
    orderId = request.get_json().get('orderId')
    res = requests.post(msRestaurantURI+"/orderStatus", data={'orderId': orderId})
    return res.json()

# Solicitar pedido al restaurante
@app.route('/createOrder', methods=['POST'])
def createOrder():
    order = request.get_json()
    res = requests.post(msRestaurantURI+"/createOrder", data={'dish': order.get('dish')})
    return res.json()

@app.route('/', methods=['GET'])
def health():
    return {
        'status': 'msClient is Runnig at http://182.18.7.10:' + str(port)
    }


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)