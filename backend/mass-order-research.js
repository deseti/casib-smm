// Research CentralSMM Mass Order API
// Berdasarkan dokumentasi CentralSMM, mass order menggunakan endpoint yang sama
// tapi dengan format yang berbeda untuk multiple orders

/* 
MASS ORDER FORMAT (CentralSMM):
POST https://centralsmm.co.id/api/order
{
  "api_id": "your_api_id",
  "api_key": "your_api_key", 
  "secret_key": "your_secret_key",
  "service": "service_id",
  "targets": ["link1", "link2", "link3"], // Multiple links
  "quantity": 1000 // Quantity per link
}

Response:
{
  "response": true,
  "data": {
    "orders": [
      {"id": 123456, "link": "link1", "price": 100},
      {"id": 123457, "link": "link2", "price": 100},
      {"id": 123458, "link": "link3", "price": 100}
    ]
  }
}
*/

// Kita akan implementasikan:
// 1. Frontend form untuk multiple links
// 2. Backend endpoint untuk mass order
// 3. Database handling untuk multiple orders
// 4. Pricing calculation untuk total cost
