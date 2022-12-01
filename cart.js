var orderList = [];
var mqtt;
var reconnectTimeout = 2000;
var host = "15.207.222.251";
var port = 8083;
var nameElement = document.getElementById("name");
var walletBalElement = document.getElementById("wallet_bal");
var userMobile = localStorage.getItem("userMobile");
var userName = localStorage.getItem("userName");
var userID = localStorage.getItem("UserId");
var cir = document.getElementById("cir");
localStorage.setItem("totalCartBalance", 0);
console.log(userID);
var waitingVar = {};
var orderListforBarcode = [];
// cir.style.backgroundColor = 'red';
var onFlag = 0;
var offFlag = 1;
//Deeriak Config
// const firebaseConfig = {
//   apiKey: "AIzaSyA3T-3p0m-GV7a2vgdNNcLSmHjN_5Y8yGI",
//   authDomain: "deerika-smart-store-rdb.firebaseapp.com",
//   databaseURL: "https://deerika-smart-store-rdb-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "deerika-smart-store-rdb",
//   storageBucket: "deerika-smart-store-rdb.appspot.com",
//   messagingSenderId: "157472897205",
//   appId: "1:157472897205:web:18fc50ce3c1609a44fe6fc"
// };
//Nitin Config
// const firebaseConfig = {
//   apiKey: "AIzaSyDp-KZ6mW40EPpy48kYqg2mcxjL8olzi7E",
//   authDomain: "dashboard-57331.firebaseapp.com",
//   databaseURL: "https://dashboard-57331-default-rtdb.firebaseio.com",
//   projectId: "dashboard-57331",
//   storageBucket: "dashboard-57331.appspot.com",
//   messagingSenderId: "978966435775",
//   appId: "1:978966435775:web:c5890ce905495f4894330a"
// };
// console.log("OrderID, ", localStorage.getItem("orderId"));
// // Initialize Firebase
// const fb = firebase.initializeApp(firebaseConfig);

// // Get a reference to the database service
// var database = fb.database();
// const dbRef = fb.database().ref();

// const usersRef = dbRef.child('dummydata');

// usersRef.child('customers/' + userID).once("value", snap => {
//   let user = snap.val();
//   if (snap.exists()) {
//     console.log("exists!");
//   } else {
//     console.log("not exists!");
//     var today = new Date();
//     var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
//     var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
//     var dateTime = date + ' ' + time;
//     usersRef.child("customers/" + userID).set({
//       cartID: "4828392f2",
//       inTime: dateTime,
//       outTime: "--",
//       userID: userID,
//       status: "Active",
//     });
//   }
// for (const [key, value] of Object.entries(user)) {
//   console.log(key, value);
//   if (key == userID) {
//     console.log("User Present");
//   } else {
//     console.log("User Not Present");



//   }
// }
// if (user.userID == userID) {
//   console.log("User Present");
// } else {
//   console.log("User Not Present");
// }
// });



// if (userName != "") {
//   nameElement.innerHTML = "Hi " + userName;
//   console.log("dasdadasd");
// } else {
//   nameElement.innerHTML = "Hi " + userMobile;
//   localStorage.setItem("userMobile", userMobile);
// }
// walletBalElement.innerHTML = localStorage.getItem("walletBalance");
// const button = document.querySelector('button')
var token = localStorage.getItem("PriceUserToken");

// Example POST method implementation:
async function generatingToken(url = '', data) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function generateNewToken() {

  var json = '{ "message": "Details fetched Successfully", "success": true, "data": { "user_id": "61d67836422ca5c08961d3bd", "mobile": "8901593303", "name": "Durgash Pandy", "email": "somyajain210220@gmail.com", "notification_token": "fH3BmUXGRbeMl5TZ5fvHPM:APA91bEdcg4vySATBFK4RWzBtugp_WtEI6d10s0nb3lVkjCd2_rGC71y0dcx_E9ZYMZPEGGvs_kc3kWZ2Ak2_3UxYwoEfTQXMWQGyl7JPmdfSPDrWHXBcrJ7EFrHyJkoELeCFJu6Oc9z", "is_member": false, "membership_id": null, "membership_with_free_items": 0 } }';
  // 890712200050

  generatingToken('http://api.djtretailers.com/smartauth/toke-generator/', JSON.parse(json))
    .then(data => {
      // console.log(data); // JSON data parsed by `data.json()` call
      // user_collection("http://192.168.1.192:85/api/user_collection", data).then(data => {
      //   console.log(data.order_id);
      //   localStorage.setItem("orderId", data.order_id)
      // })
      console.log(data.access_token); // JSON data parsed by `data.json()` call
      token = data.access_token;
      localStorage.setItem("PriceUserToken", data.access_token);

      // return fetchWallet('http://a0081d9e6be6746e9bf613dc166a53ac-75257c64ea2c0cf3.elb.ap-northeast-3.amazonaws.com/walletAdmin/user_details/?page_num=1&page_size=10&mobile=7060883183',data);
    })


}

function onFailure(message) {
  console.log("Connection Attempt to Host " + host + "Failed");
  setTimeout(MQTTconnect, reconnectTimeout);
}

async function fetchProductDetailsUsingBarcode(url = '', data) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    // mode: 'no-cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'include', // include, *same-origin, omit
    headers: {
      'Authorization': 'bearer ' + data,
      'Content-Type': 'application/json',


      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
async function fetchProductDetails(url = '', data, body) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Authorization': 'bearer ' + data,
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(body) // body data type must match "Content-Type" header
  });
  // console.log(response.json());
  return response.json(); // parses JSON response into native JavaScript objects
}
//admin/cart1/barcode
function onMessageArrived(msg) {
  out_msg = "Message received " + msg.payloadString + "<br>";
  out_msg = out_msg + "Message received Topic " + msg.destinationName;
  console.log(msg.payloadString, msg.destinationName)
  var common = msg.destinationName.split("/");
  var devID = common[2];
  var topic = common[3];
  // console.log(topic, devID)
  // console.log(common[0], common[1], common[2]);

  // console.log(topic, devID)
  // if (topic == "added_weight") {
  //   console.log(msg);
  //   var data = JSON.parse(msg.payloadString);
  //   var prodNumber = data.product_id;
  //   var quantity = data.quantity;
  //   var total = 55;
  //   // console.log("Yo ",prodNumber, quantity);
  //   let obj = orderList.find((o, i) => { //value, key
  //     if (o.item_number === prodNumber) {
  //       console.log("Found!!");
  //       //Updating in OrderList
  //       orderList[i].quantity = parseInt(o.fulfilled_quantity, 10) + parseInt(quantity, 10);
  //       orderList[i].fulfilled_quantity = parseInt(o.fulfilled_quantity, 10) + parseInt(quantity, 10);
  //       total = parseInt(o.mrp, 10) * parseInt(orderList[i].fulfilled_quantity, 10);
  //       orderList[i].item_total = total;

  //       // buildCartItem(orderList[i]);
  //       // console.log(o.quantity);
  //       // stop searching
  //     }

  //     // buildCartItem(orderList);
  //     $('.row').remove();
  //     // console.log("Removed");

  //     console.log(orderList);
  //     var cartTotal = 0;
  //     var savingsTotal = 0;
  //     orderList.forEach(function (order) {

  //       if (parseInt(order.fulfilled_quantity, 10) > 0) {
  //         console.log("Building items");

  //         buildCartItem(order)
  //         cartTotal = parseInt(order.item_total, 10) + cartTotal;
  //         savingsTotal = parseInt(order.strikePrice, 10) * parseInt(order.fulfilled_quantity, 10) + savingsTotal;
  //       } else {
  //         console.log("Not Building for qty 0");
  //         orderList.splice[i, 1];

  //       }

  //       // buildCartItem(order)
  //       //  cartTotal = parseInt(order.item_total,10) + cartTotal;
  //       //  savingsTotal = parseInt(order.strikePrice,10) * parseInt(order.quantity,10) + savingsTotal;

  //     })


  //     console.log("cart total -----", cartTotal, savingsTotal);
  //     document.getElementById("total").innerHTML = cartTotal;
  //     document.getElementById("savings").innerHTML = savingsTotal - cartTotal;
  //     localStorage.setItem("cartSavings", savingsTotal - cartTotal)
  //     localStorage.setItem("totalCartBalance", cartTotal);
  //     // console.log("cart total",cartTotal, savingsTotal);

  //     localStorage.setItem("items", JSON.stringify(orderList));

  //     updateFb(orderList);


  //   });
  //   // {"label" : "patanjali-honey-500g“,”product_id”:”202442","total_cart_weight":"2994.651855","product_weight_from_sensor":"721.254150","product_weight_from_label":"1000”, “quantity”:”2”}
  //   // {"label" : "patanjali-honey-500g","product_id":"202442"}
  //   //{"label" : "bournvita-","product_id":"201352","total_cart_weight":"25.218994","product_weight_from_sensor":"502.397400","product_weight_from_label":"5000","quantity":"1"}
  // } else if (topic == "label") {
  //   //Check item if it exist in list

  //   console.log(out_msg);
  //   //removing colon from string
  //   var data = JSON.parse(msg.payloadString);
  //   // data = String(data.label).split(":");
  //   console.log(data.label, data.product_id);

  //   console.log("")


  // var token = localStorage.getItem("UserToken");
  // console.log(token);

  //   var bodyToSend = {
  //     "export": false,
  //     "search": "number",
  //     "value": data.product_id,
  //     "warehouse": "STR01"
  //   }
  //   fetchProductDetails("http://api.djtretailers.com/item/adminitems/?page_number=100&page_size=1", token, bodyToSend)
  //     .then(data => {
  //       console.log(data.data.items[0].rating); // JSON data parsed by `data.json()` call
  //       //name, imageUrl, ratings, strikePrice, MRP
  //       var productName = data.data.items[0].name;
  //       var imgURL = data.data.items[0].images[0].url;
  //       var ratings = data.data.items[0].rating;
  //       var strikePrice = data.data.items[0].warehouses.MRP;
  //       var mrp = data.data.items[0].warehouses.ASP;
  //       var prodNumber = data.data.items[0].number;
  //       console.log(mrp, strikePrice);
  //       var singleObj = {}
  //       // singleObj['img'] = imgURL;
  //       // singleObj['name'] = productName;
  //       // singleObj['star'] = ratings; 
  //       // singleObj['strikePrice'] = strikePrice;
  //       // singleObj['mrp'] = mrp;
  //       // singleObj['id'] = prodNumber;
  //       // singleObj['quantity'] = 0;
  //       // singleObj['weight'] = " ";



  //       singleObj['image_url'] = imgURL;
  //       singleObj['item_name'] = productName;
  //       //To be removed
  //       singleObj['itemID'] = productName;
  //       singleObj['itemPrice'] = mrp;
  //       singleObj['quantity'] = 0;


  //       // singleObj['star'] = ratings;
  //       // singleObj['strikePrice'] = strikePrice;
  //       singleObj['star'] = ratings;
  //       singleObj['strikePrice'] = strikePrice;
  //       singleObj['mrp'] = mrp;

  //       singleObj['unit_price'] = {
  //         "asp": mrp,
  //         "mrp": strikePrice
  //       };
  //       singleObj['item_number'] = prodNumber;
  //       singleObj['fulfilled_quantity'] = 0;
  //       singleObj['weight'] = " ";
  //       singleObj['hsn'] = data.data.items[0].hsn;
  //       singleObj['tax'] = data.data.items[0].tax;
  //       singleObj['item_varient'] = {};
  //       singleObj['barcode'] = data.data.items[0].barcode[0].barcode;





  //       // return 
  //       let obj = orderList.find(o => o.item_number === prodNumber);
  //       console.log(obj);

  //       if (typeof obj === "undefined") {
  //         console.log("---->>>Adding Item in List")

  //         orderList.push(singleObj);
  //         buildCartItem(singleObj);
  //         // orderList = [];
  //         // orderList.forEach(function (order) {
  //         //   buildCartItem(order)
  //         // })
  //         console.log(JSON.stringify(orderList));
  //       } else {
  //         console.log(" Item Already in List..Updating if requires")

  //       }
  //     })

  //   // {
  //   //   id: 4,
  //   //   img: "./assets/tatasalt_og 1.png",
  //   //   name: "Head & Shoulders",
  //   //   star: "3",
  //   //   weight: "1kg",
  //   //   strikePrice: "₹50",
  //   //   mrp: "₹28",
  //   //   quantity: 2,
  //   //   item_total: "₹56.00"
  //   // }

  //   // var listOfObjects = [];
  //   // var a = ["car", "bike", "scooter"];
  //   // a.forEach(function (entry) {
  //   //   var singleObj = {}
  //   //   singleObj['type'] = 'vehicle';
  //   //   singleObj['value'] = entry;
  //   //   listOfObjects.push(singleObj);
  //   // });


  // } else if (topic == "removed_weight") {
  //   console.log(out_msg);

  //   var data = JSON.parse(msg.payloadString);
  //   var prodNumber = data.product_id;
  //   var quantity = data.quantity;
  //   let obj = orderList.find((o, i) => {
  //     if (o.item_number === prodNumber) {
  //       console.log("Found!!");
  //       //Updating in OrderList
  //       var initialQuantity = parseInt(o.fulfilled_quantity, 10);
  //       if (initialQuantity > quantity) {
  //         orderList[i].fulfilled_quantity = initialQuantity - parseInt(quantity, 10);
  //         orderList[i].quantity = initialQuantity - parseInt(quantity, 10);


  //       } else {
  //         orderList[i].fulfilled_quantity = initialQuantity - parseInt(quantity, 10);
  //         orderList[i].quantity = initialQuantity - parseInt(quantity, 10);

  //       }
  //       total = parseInt(o.mrp, 10) * parseInt(orderList[i].fulfilled_quantity, 10);
  //       orderList[i].item_total = total;

  //       // buildCartItem(orderList[i]);
  //       // console.log(o.quantity);
  //       // stop searching
  //     } else {
  //       console.log("Product not found which is removed.");
  //     }

  //     // buildCartItem(orderList);
  //     $('.row').remove();
  //     console.log("Removed");

  //     console.log(orderList);
  //     var cartTotal = 0;
  //     var savingsTotal = 0;
  //     orderList.forEach(function (order, i) {
  //       if (parseInt(order.fulfilled_quantity, 10) > 0) {
  //         console.log("Building items");

  //         buildCartItem(order)
  //         cartTotal = parseInt(order.item_total, 10) + cartTotal;
  //         savingsTotal = parseInt(order.strikePrice, 10) * parseInt(order.fulfilled_quantity, 10) + savingsTotal;
  //       } else {
  //         console.log("Not Building for qty 0");
  //         orderList.splice[i, 1];
  //       }
  //     })


  //     console.log("cart total -----", cartTotal, savingsTotal);
  //     document.getElementById("total").innerHTML = cartTotal;
  //     document.getElementById("savings").innerHTML = savingsTotal - cartTotal;
  //     localStorage.setItem("totalCartBalance", cartTotal);
  //     // console.log("cart total",cartTotal, savingsTotal);

  //     localStorage.setItem("items", JSON.stringify(orderList));


  //   });
  //   updateFb(orderList);

  // } else if (topic == "na") {
  //   console.log(out_msg);
  //   if (msg.payloadString == "added") {
  //     console.log("Please re-add the Item again");

  //   } else if (msg.payloadString == "removed") {
  //     console.log("Please remove the Item again");
  //     // document.getElementById("ring").style.border = "purple";
  //     // document.getElementById("cir").style.backgroundColor = "purple";
  //     // button.disabled = true

  //   }

  // } else if (msg.destinationName == "admin/cartv1/isstable") {
  //   //   button.disabled = false
  //   // button.disabled = false
  //   // cir.style.backgroundColor = 'green';
  //   toggleModal(2);
  //   console.log(out_msg);
  //   // if (msg.payloadString == "stable") {
  //   //   console.log("Cart is stable");
  //   //   cir.style.backgroundColor = 'green';
  //   //   button.disabled = false


  //   // } else if (msg.payloadString == "not-stable") {
  //   //   console.log("Not stable");
  //   //   // document.getElementById("ring").style.border = "purple";
  //   //   // document.getElementById("cir").style.backgroundColor = "purple";
  //   //   cir.style.backgroundColor = 'red';

  //   //   button.disabled = true

  //   // }


  // } else if (msg.destinationName == "admin/cartv1/notstable") {
  //   //   button.disabled = false
  //   // button.disabled = true
  //   // cir.style.backgroundColor = 'red';
  //   toggleModal(1);

  //   console.log(out_msg);
  //   // if (msg.payloadString == "stable") {
  //   //   console.log("Cart is stable");
  //   //   cir.style.backgroundColor = 'green';
  //   //   button.disabled = false


  //   // } else if (msg.payloadString == "not-stable") {
  //   //   console.log("Not stable");
  //   //   // document.getElementById("ring").style.border = "purple";
  //   //   // document.getElementById("cir").style.backgroundColor = "purple";
  //   //   cir.style.backgroundColor = 'red';

  //   //   button.disabled = true

  //   // }


  // } else if (topic == "updated_dict") {

  //   var data = JSON.parse(msg.payloadString);
  //   // var objectStringArray = (new Function("return [" + msg.payloadString + "];")());

  //   // console.log("heloooo", data);

  //   // udpateCurrentLocalList(data);

  //   // updateFirebase(data);

  // } else if (topic == "r_label") {
  //   // console.log("Hola");
  //   // var data = JSON.parse(msg.payloadString);
  //   // console.log(data.product_id);
  //   // orderList.forEach(function (order, index) {
  //   //   console.log(order.item_number);

  //   //   if (order.item_number == data.product_id) {
  //   //     console.log("remove this item ");
  //   //     orderList.splice(index, 1);

  //   //   }
  //   // })
  //   // orderList.forEach(function (order) {
  //   //   buildCartItem(order);

  //   // })
  //   // console.log(orderList);

  // } else
  if (topic == "barcode") {

    var data = JSON.parse(msg.payloadString);
    console.log(data.barcode);
    var bodyToSend = {}
    fetchProductDetailsUsingBarcode("http://api.djtretailers.com/collection/getsingleitem?search=barcode&value=" + data.barcode, token)
      .then(data => {
        console.log("Cart", data.message)
        if (data.message == "Invalid Token") {
          generateNewToken();
        }
        console.log("Cart", data)

        // var data = JSON.parse(data);
        var productName = data.data[0].name;
        var imgURL = data.data[0].images[0].url;
        var ratings = data.data[0].rating;
        var strikePrice = data.data[0].warehouses[0].MRP;
        var mrp = data.data[0].warehouses[0].ASP;
        var prodNumber = data.data[0].number;
        var barcodeID = data.data[0].barcode[0].barcode;
        console.log(mrp, strikePrice);
        var singleObj = {}
        singleObj['img'] = imgURL;
        singleObj['name'] = productName;
        singleObj['star'] = ratings;
        singleObj['strikePrice'] = strikePrice;
        singleObj['mrp'] = mrp;
        singleObj['id'] = prodNumber;
        singleObj['quantity'] = 1;
        singleObj['weight'] = "";
        singleObj['item_total'] = mrp;
        singleObj['barcodeId'] = barcodeID;


        console.log(singleObj);

        // return 
        let obj = orderListforBarcode.find(o => o.id === prodNumber);
        console.log(obj);

        if (typeof obj === "undefined") {
          console.log("---->>>Adding Item in List")
          orderListforBarcode.pop();
          orderListforBarcode.push(singleObj);
          // buildCartItem(singleObj);

        } else {
          console.log(" Item Already in List..Updating if requires")
          console.log(obj.quantity, quantity);
          obj.quantity = parseInt(obj.quantity, 10) + 1;
          total = parseInt(obj.mrp, 10) * parseInt(obj.quantity, 10);
          obj.item_total = total;

        }
        $('.row').remove();


        console.log(orderListforBarcode);
        var cartTotal = 0;
        var savingsTotal = 0;
        orderListforBarcode.forEach(function (order, i) {
          if (parseInt(order.quantity, 10) != 0) {
            console.log("Building items");

            buildCartItem(order)
            cartTotal = parseInt(order.item_total, 10) + cartTotal;
            savingsTotal = parseInt(order.strikePrice, 10) * parseInt(order.quantity, 10) + savingsTotal;
          } else {
            console.log("Not Building for qty 0");
            orderListforBarcode.splice[i, 1];

          }

        })


        // console.log("cart total -----", cartTotal, savingsTotal);
        // document.getElementById("total").innerHTML = cartTotal;
        // document.getElementById("savings").innerHTML = savingsTotal - cartTotal;
        // localStorage.setItem("totalCartBalance", cartTotal);

      })


    // } else if (topic == "added_weight_barcode") {
    //   var data = JSON.parse(msg.payloadString);
    //   console.log(data);
    // } else if (topic == "remove_weight_barcode") {
    //   var data = JSON.parse(msg.payloadString);
    //   console.log(data);
    // }
    // else if (msg.destinationName == "/beacons/office") {
    //   var data = JSON.parse(msg.payloadString);
    //   // console.log(data, data.e[0].r);
    //   var rssi = parseInt(data.e[0].r, 10)
    //   // console.log(rssi);
    //   if (rssi >= -65) {
    //     console.log("Cart is Near");
    //     if (document.getElementById("disabled").disabled && onFlag == 1) {
    //       // document.getElementById("disabled").disabled = false;
    //       document.getElementById("cir").style.backgroundColor = "#FF0000";


    //     } else {
    //       document.getElementById("disabled").disabled = false;
    //       document.getElementById("cir").style.backgroundColor = "#00FF00";

    //     }


    //   }
    //   else {
    //     console.log("Cart is Far");
    //     document.getElementById("disabled").disabled = true;
    //     document.getElementById("cir").style.backgroundColor = "#FF0000";

    //   }
    // }
  }
}
// function updateFirebase(data) {
//   console.log("hola");
//   usersRef.child("customers/" + userID + "/orders").get().then((snapshot) => {
//     let user = snapshot.val();
//     if (snapshot.exists()) {
//       console.log(user);
//     } else {
//       console.log("No data available, Adding current data to firebase");
//       var index = 0
//       for (const [key, value] of Object.entries(data)) {
//         console.log(key, value);
//         usersRef.child("customers/" + userID + "/orders/" + index + "/").set({
//           itemID: value.product_name,
//           itemPrice: Math.floor(Math.random() * 100),
//           quantity: value.qty
//         });
//         index = index + 1;
//       }


//     }
//   }).catch((error) => {
//     console.error(error);
//   });
// }
// function udpateCurrentLocalList(obj) {
//   console.log("In Loop for check current ")
//   Object.entries(obj).forEach((entry) => {
//     const [key, value] = entry;
//     console.log(`${key}: ${value}`);
//   });
//   // for (var key in obj) {
//   //   if (obj.hasOwnProperty(key)) {
//   //     var val = obj[key];
//   //     console.log(val);
//   //     udpateCurrentLocalList(val);
//   //   }
//   // }
// }
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.

  console.log("Connected ");
  mqtt.subscribe("admin/pricechecker/v1/barcode");
  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/added_weight");
  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/updated_dict");

  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/label");
  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/removed_weight");
  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/na");
  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/r_label");
  // mqtt.subscribe("admin/cartv1/isstable");
  // mqtt.subscribe("admin/cartv1/notstable");
  // mqtt.subscribe("/beacons/office");

  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/addFromAdmin");
  // mqtt.subscribe("admin/cartv1/48b02d5f84a6/addFromAdmin");


  // mqtt.subscribe("admin/cartv1/#");



  // message = new Paho.MQTT.Message("Hello World");
  // message.destinationName = "sensor2";
  // message.retained = true;
  // mqtt.send(message);
  // var payload = {
  //   "tok": token
  // }
  // message = new Paho.MQTT.Message(localStorage.getItem("UserToken"));
  // message.destinationName = "admin/cartv1/token";
  // message.retained = false;
  // message.setQos(0);
  // mqtt.send("admin/cartv1/token", localStorage.getItem("UserToken"), 0, false);

}

function onConnectionLost(err) {
  console.log("Connection Lost!!!", err);
  MQTTconnect();

}

function MQTTconnect() {
  console.log("connecting to " + host + " " + port);
  var x = Math.floor(Math.random() * 10000);
  var cname = "CartID -" + x;
  mqtt = new Paho.MQTT.Client(host, port, cname);
  //document.write("connecting to "+ host);
  var options = {
    timeout: 3,
    onSuccess: onConnect,
    onFailure: onFailure,
  };
  mqtt.onMessageArrived = onMessageArrived
  mqtt.onConnectionLost = onConnectionLost;

  mqtt.connect(options); //connect

}

const buildCartItem = function (order) {
  // Create elements needed to build a card

  console.log(order.item_name);

  const div1 = document.createElement("div");
  const div2 = document.createElement("div");
  const div3 = document.createElement("div");
  const div4 = document.createElement("div");
  const div5 = document.createElement("div");
  const div6 = document.createElement("div");
  const div7 = document.createElement("div");
  const div8 = document.createElement("div");
  const img = document.createElement("img");
  const _1h2 = document.createElement("h2");
  const _2h2 = document.createElement("h2");
  const _3h2 = document.createElement("h2");
  const _1h3 = document.createElement("h3");
  const _2h3 = document.createElement("h3");
  const _1h1 = document.createElement("h1");
  const _1p = document.createElement("p");
  const _2p = document.createElement("p");
  const br = document.createElement("br");
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  const span3 = document.createElement("span");
  const strike = document.createElement("strike");


  const main = document.querySelector(".container");
  main.append(div1);
  div1.append(div2);
  div2.append(div3);
  div2.append(div7);
  div7.append(div8);
  div8.append(_3h2);
  div8.append(_1h3);
  div8.append(span2);
  div8.append(_2h3);
  div8.append(span3);
  div8.append(_1h1);
  div3.append(div4);
  div3.append(div5);
  div3.append(div6);
  div4.append(img);
  div5.append(_1h2);
  div5.append(_1p);
  _1p.append(span);
  div6.append(_2h2);
  div6.append(_2p);
  _2p.append(br);
  _2p.append(strike);


  div1.setAttribute("class", "row");
  div2.setAttribute("class", "grid grid-flow-row-dense justify-center align-center items-center text-center grid-cols-3 grid-rows-2");
  div3.setAttribute("class", "col-span-2 flex flex-row mt-10 -mb-14");
  div4.setAttribute("class", "image justify-center flex align-center text-center ml-7 mr-10");
  div5.setAttribute("class", "title");
  div6.setAttribute("class", "rate flex flex-col ml-auto mr-12");
  // div7.setAttribute("class", "side");
  div8.setAttribute("class", "mt-10 flex flex-row justify-center");
  _3h2.setAttribute("class", "text-base font-semibold 2xl:text-xl text-txt");
  _1h3.setAttribute("class", "text-base 2xl:text-xl text-txt ml-3");
  span2.setAttribute("class", "text-base 2xl:text-xl text-txt ml-3");
  _2h3.setAttribute("class", "text-base 2xl:text-xl text-txt ml-3");
  span3.setAttribute("class", "equal");
  _1h1.setAttribute("class", "text-base 2xl:text-xl text-txt ml-3");
  _1h2.setAttribute("class", "text-base font-semibold text-3xl");
  _1p.setAttribute("class", "text-base text-gray-400 mb-6 font-bold text-yellow 2xl:text-lg mr-auto");
  _2h2.setAttribute("class", "text-base 2xl:text-xl text-txt ml-3");
  _2p.setAttribute("class", "text-base font-semibold text-6xl");
  strike.setAttribute("class", "text-gray-400");
  //Setting Data to cards
  img.setAttribute("src", order.img);
  _1h2.innerHTML = order.name;
  // Adding Start/rating to element
  for (let i = 0; i < order.star; i++) {
    span.innerHTML = span.innerHTML + " &#x1F31F ";
  }
  _2h2.innerHTML = order.weight;
  strike.innerHTML = order.mrp;
  _2p.innerHTML = "&#8377;" + order.strikePrice;
  // _3h2.innerHTML = "Quantity: ";
  // _1h3.innerHTML = order.fulfilled_quantity;
  // span2.innerHTML = "*";
  // _2h3.innerHTML = order.mrp + " ";
  // span3.innerHTML = " =";
  // _1h1.innerHTML = order.item_total;

  // localStorage.setItem("items", JSON.stringify(orderList));
  // console.log(JSON.stringify(orderList));
}

MQTTconnect();





//------------Fixed Header JS--------------//
// window.onscroll = function () {
//   myFunction()
// };

// // Get the header
// var header = document.getElementById("myHeader");

// // Get the offset position of the navbar
// var sticky = header.offsetTop;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
// function myFunction() {
//   if (window.pageYOffset > sticky) {
//     header.classList.add("sticky");
//   } else {
//     header.classList.remove("sticky");
//   }
// }


// setInterval(() => {MQTTconnect()}, 10000);


// fetch("./768.json").then(response => {
//   return response.json();
// })
//   .then(function (data) {
//     const res = data;
//     console.log(res);

//     var element = {},
//       cart = [];


//     Object.entries(res).forEach((entry) => {
//       const [key, value] = entry;
//       // element.id = value;
//       // element.quantity = key;
//       // cart.push({element: element});
//       // console.log(cart);
//       console.log(value.name);
//     });

//   });


// var modal = document.querySelector(".modal");

// function toggleModal(val) {
//   if (val == 1 && offFlag == 1 && onFlag == 0) {
//     modal.classList.toggle("show-modal");
//     onFlag = 1;
//     document.getElementById("disabled").disabled = true;

//     usersRef.child('customers/' + userID).update({
//       status: "Not-stable"
//     });

//   }
//   else if (val == 2 && onFlag == 1) {
//     modal.classList.toggle("show-modal");
//     offFlag = 1;
//     onFlag = 0;
//     document.getElementById("disabled").disabled = false;
//     usersRef.child('customers/' + userID).update({
//       status: "Active"
//     });

//   }
// }

// function windowOnClick(event) {
//   if (event.target === modal) {
//   }
// }


// function updateFb(orderList) {
//   // var order = {};
//   // orderList.forEach((value, key) => {
//   //   // const [key, value] = entry;
//   //   // console.log("FB --", key, value, value.id);
//   //   var id = key;
//   //   order[id] = key;
//   //   order["itemID"] = value.item_name
//   // })
//   // console.log("Push -----", order);
//   usersRef.child('customers/' + userID).update({
//     orders: orderList
//   });
// }

// setInterval(() => {

//   Object.entries(orderList).forEach((entry) => {
//     const [key, value] = entry;
//     // element.id = value;
//     // element.quantity = key;
//     // cart.push({element: element});
//     // console.log(cart);
//     if (value.fulfilled_quantity < 0) {
//       console.log(value.item_name);
//       value.fulfilled_quantity = 0;
//       value.quantity = 0
//       // delete orderList[key];

//     }
//   });
//   $('.row').remove();

//   orderList.forEach(function (order, i) {
//     // buildCartItem(order)

//     if (parseInt(order.fulfilled_quantity, 10) > 0) {
//       console.log("Building items");

//       buildCartItem(order)
//       // cartTotal = parseInt(order.item_total, 10) + cartTotal;
//       // savingsTotal = parseInt(order.strikePrice, 10) * parseInt(order.fulfilled_quantity, 10) + savingsTotal;
//     } else {
//       console.log("Not Building for qty 0");
//       orderList.splice[i, 1];
//     }
//   })
// }, 5000);
