const firebase = require("firebase");
var admin = require("firebase-admin");

var serviceAccount = require("C:/Users/MUSTAPHA/Downloads/complete-kite-320815-firebase-adminsdk-v9mts-323e712e61.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://complete-kite-320815-default-rtdb.europe-west1.firebasedatabase.app"
});


// Required for side-effects
require("firebase/firestore");
const express = require("express");
const { send } = require("process");
var bodyparser = require("body-parser");
const { database, firestore } = require("firebase-admin");

var app = express();
var firebaseConfig = {
    apiKey: "AIzaSyDCTWtl5NEFLLsd8yTQjTJMGvnaQ5kvYF8",
    authDomain: "complete-kite-320815.firebaseapp.com",
    projectId: "complete-kite-320815",
    storageBucket: "complete-kite-320815.appspot.com",
    messagingSenderId: "497478748033",
    appId: "1:497478748033:web:e0bbfcf2e8186adcd50a80"
  };

db = admin.database();
FirestoreDB = admin.firestore();
/*docRef = db.collection("Restaurants").doc("PIZZERIA ZOOM").get().then((querySnapshot)=>
{   
    querySnapshot.forEach((doc)=>
    {
        console.log(doc.data());
        stringobj = stringobj + doc.data().toString() ;
    console.log(stringobj)
    })
      
    }
).catch((err)=>
console.log(err))*/
var jsonParser = bodyparser.json();
orders = [];
const port = 10000;
class Orderitem
{
    constructor(name,price,quantity,ImageUrl)
    {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
}
class callStatus
{
    constructor(status,message)
    {
        this.status = status;
        this.message = message;
    }
}
class Order{
    constructor(id,location,totalValue,restaurant,status,items,uid)
    {
        this.orderId = id;
        this.location = location;
        this.totalValue = totalValue;
        this.items = items;
        this.restaurant = restaurant;
        this.status = status;
        this.uid = uid;
    }
    addItem(item)
    {
        this.items.push(item)
    }
}
class Status
 {
     constructor(status)
     {
         this.status = status;
     }
 }
class Deliverer
{
    constructor(id,location,status)
    {
        this.id = id;
        this.location = location;
        this.status = status;
    }
}   
deliverers = [];
Ordersref = db.ref('root').child('Orders');
DeliverersRef = db.ref('root').child('Deliverers');
OrderCountRef = FirestoreDB.collection("RestaurantOrdersCount");
var resTokenMap = new Map();
var resNameIdMap = new Map();
var reqresMap = new Map();
var resCallbackMap = new Map();
var orderIdReqResMap = new Map();
var pendingorderStateClient = new Map();
var pendingordersRestaurant = new Map();
var restaurantCacheMap = new Map();
var globalTokens;
function updateTodayRecord()
{
    date = new Date();
    tomorrow12 = new Date(parseInt(date.getYear(),10)+1900,date.getDate() == 31 ? date.getMonth():date.getMonth() +1,date.getDate() == 31 ? 1 : date.getDate(),0,0,0,0);
    millisUntilTomorrow = Date.parse(today12)-Date.parse(date);
    globalTokens.forEach((doc)=>{
        var docReference = FirestoreDB.collection('RestaurantOrdersCount').doc(docName);
        docReference.get().then((snapshot)=>
         {
             data = snapshot.data();
          var todayOld = data.today;
          var thisMonthOld = data.thisMonth;
          var lastMonthOld = data.lastMonth;
          docReference.update({today:0,thisMonth:thisMonthOld + todayOld});
         })
    })
    window.setTimeout(updateTodayRecord,millisUntilTomorrow);    
}
function changeMonth()
{

    var docReference = FirestoreDB.collection('RestaurantOrdersCount').doc(docName);
            docReference.get().then((snapshot)=>
             {
                 data = snapshot.data();
              var todayOld = data.today;
              var thisMonthOld = data.thisMonth;
              var lastMonthOld = data.lastMonth;
              docReference.update({today:0,thisMonth:0 ,lastMonth:lastMonthOld});
             })
    date = new Date();
    NextMonth = new Date(parseInt(date.getYear(),10)+1900,date.getMonth()+1,date.getDate(),0,0,0,0);
    millisUntilNextMonth = Date.parse(NextMonth)-Date.parse(date);
    window.setTimeout(changeMonth,millisUntilNextMonth);
       
}
function updateOrderCountRecords(restId, order)
{
    date = new Date();
    monthStr = getMonthName(date.getMonth);
    OrderCountRef.doc(restId).get().then((snapshot)=>
    {
        var data = snapshot.data();
        var val = data[monthStr];
        var todayVal = data['today'];
        strArr = todayVal.split(',');
       newOrderCount = parseInt(strArr[0] + 1,10);
       newTotalValue = parseInt(strArr[1],10) + order.totalValue;
       strArr1 = todayVal.split(',');
       newOrderCount1 = parseInt(strArr1[0] + 1,10);
       newTotalValue1 = parseInt(strArr1[1],10) + order.totalValue;
        OrderCountRef.doc(restId).update({today:newOrderCount.toString() + "," + newTotalValue.toString(),monthStr:newOrderCount1.toString() + "," + newTotalValue1.toString()});
    })
}
 FirestoreDB.collection('RestaurantTokens').get().then((tokens)=>
 {

    if(tokens.empty)
    {
        //tnaket
        console.log("tnaket : tokens is empty !!");
    }
    else{
        globalTokens = tokens;
        date = new Date();
        tomorrow12 = new Date(parseInt(date.getYear(),10)+1900,date.getMonth(),date.getDate()+1,0,0,0,0);
        NextMonth = new Date(parseInt(date.getYear(),10)+1900,date.getMonth()+1,date.getDate(),0,0,0,0);
        millisUntilTomorrow = Date.parse(tomorrow12)-Date.parse(date);
        millisUntilNextMonth = Date.parse(NextMonth)-Date.parse(date);
        tokens.forEach((doc)=>
        {
            var val = doc.data();
            resTokenMap.set(doc.id,val.restaurantID); // for token verification
            resNameIdMap.set(val.name,val.restaurantID); // for restaurant name-token association
            resNameIdMap.set(val.restaurantID,val.name);// I am not worried about space am I ?
        })
        console.log("Tokens retrieved successfully");

/*window.setTimeout(updateTodayRecord //function dealing with the change of day 
,millisUntilTomorrow);
window.setTimeout(changeMonth //function dealing with the change of month        
,millisUntilNextMonth);*/
}
 }).catch((error)=> //handle tokens retrieval error
 {

     console.log("error : " + error);
 })

app.post('/Orders',jsonParser,function(request,response)
{
    console.log("got an order ! ");
    iitems = [];
body = request.body;
//order = JSON.parse(body);
//response.send("Got it !");
body.items.forEach(element => {
    iitems.push(element.name + "*" + element.quantity);
});
order = new Order(body.orderId,body.location,parseInt(body.totalValue,10),body.restaurant,body.status,iitems,body.uid);
restId = resNameIdMap.get(order.restaurant);
date = new Date();
dateStr = (date.getYear() +1900).toString() + "-" + date.getMonth() + "-" + date.getDate();
newOrderRef = Ordersref.child(restId).child(date.getMonth()).child(dateStr).child(order.orderId);
if(reqresMap.get(restId) == undefined)
{
    orders = pendingordersRestaurant.get(restId)
    if(orders == undefined)
    orders = [];
    orders.push(order);
   pendingordersRestaurant.set(restId,orders);
}
else
{
    Ordersref.child(restId).child(date.getMonth()).child(dateStr).once('child_added',(snapshot,newChildKey)=>
    {
            console.log("registerd a callback for restaurand with restId of : " + restId);
            res = reqresMap.get(restId);
            orderData = snapshot.val();
            responseOrder = new Order(body.orderId,orderData.location,orderData.totalValue,resNameIdMap.get(restId),orderData.status,orderData.items);
            responsOrderArray = [];
            responsOrderArray.push(responseOrder);
            res.send(JSON.stringify(responseOrderArray));
            updateOrderCountRecords(restId,responseOrder);  
                   
    });
   
}

newOrderRef.set({
   // id : order.orderId,
    location : order.location,
    totalValue: order.totalValue,
//better be restaurant Id created from secret token and uid and restaurant name execpt restauarant id is not available to the client !!
    items : order.items, 
    status : 0
}).then(()=>
{
    responseOrder = new Order(body.orderId,body.location,parseInt(body.totalValue,10),body.restaurant,body.status,body.items);
    console.log("set succeeded sending order back to client")
    response.send(JSON.stringify(responseOrder))
})


//order.addItem(orderitem);

/*order =  new Order(newOrderRef.key,body.location,parseInt(body.totalValue,10),body.restaurant,body.status,body.items);
//order.items = body.items;//because we have changed the form of items sent to the server (for svaing space)
console.log(order.id);
response.send(JSON.stringify(order));
console.log(order.totalValue)*/

//console.log(item.name);

//console.log(parseInt(item.price,10));
//console.log(item.quantity);

})
app.get("/Verify-Token/:token",jsonParser,function(request,response)
{
    token = request.params.token;
   
    if(resTokenMap.get(token) ==  undefined )
    {
       
        res = new callStatus(-1,"No such token");
        response.send(JSON.stringify(res));
    }
    else
    {
        res = new callStatus(0,"logged in successfully");
        response.send(JSON.stringify(res));
       
    }
    
})

app.listen(port,()=>
{

})
app.post('/Register',jsonParser,function(req,res)
{
body = req.body;

admin.auth().createUser({
    email:body.user_email,
    password:body.user_password
}).then((userRecord)=>
{
status = new callStatus(0,"User Created Successfully ");
res.send(JSON.stringify(status));
}).catch((error)=>
{
    console.log("register error : " + error)
})
status = new callStatus(-1,"Could not create user" + error);
res.send(JSON.stringify(status));
})

app.get('/get-orders/:restaurantId',jsonParser,function(request,response)
{
    restID = request.params.restaurantId;
    request.on("close",()=>
    {
        reqresMap.delete(restID);
    })
    if(pendingordersRestaurant.get(restID) != undefined)
    {
        response.send(pendingordersRestaurant.get(restID));
        pendingordersRestaurant.get(restID).forEach((doc)=>
        {
            updateOrderCountRecords(restID,doc);
        })
        pendingordersRestaurant.delete(restID);

    }
    if(resTokenMap.get(restID) == undefined) //verify restaurant ID is valid
    {

        console.log("restaurand with id " + request.params.restaurantId + "has requested orders" );
        reqresMap.set(request.params.restaurantId,response);
        //OrdersRef.child(request.params.restaurantId).on('child_added',)
    }
    
})

app.get("/get-AllOrders/:restaurantId",jsonParser,function(req,res)
{
    console.log("restaurant with restaurant id " + req.params.restaurantId + " has requested all orders")
   

        if(restaurantCacheMap.get(req.params.restaurantId) == undefined)
        {
            date = new Date();
            dateStr = (date.getYear() +1900).toString() + "-" + date.getMonth() + "-" + date.getDate();
            OrderCountRef.doc(req.params.restaurantId).get().then((snapshot)=>
            {
               data = snapshot.data();
                res.send(data);
                })
           
        }

})
app.get('/set-location/:delivererId',jsonParser,function(request,response)
{

})

app.get('/get-Delivery/:delivererId',jsonParser,function(request,response)
{

})
app.get('/get-Order-state/:restaurant/:orderId',jsonParser,function(request,response)
{
    resultStatus = pendingorderStateClient.get(id);
    if(resultStatus != undefined)
    {
        response.send(JSON.stringify(resultStatus))
    }     
    date = new Date();
    dateStr = (date.getYear() +1900).toString() + "-" + date.getMonth() + "-" + date.getDate();
    id = request.params.orderId;
    orderIdReqResMap.set(id,response);
    restaurant = request.params.restaurant;
    request.on("close",()=>
    {
        orderIdReqResMap.delete(id);
    })
    response.on('close',()=>{

    })
    restaurantId = resNameIdMap.get(restaurant);
    //get restaurant id from database
    ordersRef = Ordersref.child(restaurantId).child(dateStr).child(id);

   ordersRef.on('child_changed',(snapshot)=>
   {
      newOrder = snapshot.val();
    sstatus = new Status(newOrder.status);
    Res = orderIdReqResMap.get(id);
    if(Res != undefined)
    Res.send(JSON.stringify(sstatus));
    else
    {
        pendingorderStateClient.set(id,sstatus);
    }

   })
})
app.post('/set-Order-state/:restaurantId/:orderId/:state',jsonParser,function(request,response)
{
    restid = request.params.restaurantId;
    id = request.params.orderId;
    date = new Date();
    dateStr = dateStr = (date.getYear() +1900).toString() + "-" + date.getMonth() + "-" + date.getDate();
    state = request.params.state;
    if(state === undefined)
    {
        sstatus = new callStatus(-1,"Error : Unknown state , state is undefined");
        response.send(JSON.stringify(sstatus));
    }
    Ordersref.child(restid).child(dateStr).child(id).update({
        status : state
    }).then(()=>
    {
        sstatus = new callStatus(0,"State set successfully");
       response.send(JSON.stringify(sstatus));
    }).catch((error)=>{
        sstatus = new callStatus(-1,"Could not set state : " + error);
        response.send(JSON.stringify(sstatus));
    });


})
app.post('/set-restaurant-state/:restaurandId/:status',jsonParser,function(req,res)
{
    if(resNameIdMap.get(req.params.restaurantId) != undefined)
    {
        FirestoreDB.collection('Restaurants').doc(resNameIdMap.get(req.params.restaurantId)).update({status:req.params.status}).then(()=>
        {
            console.log("res state set sucess , restId : " + req.params.restaurantId)
    res.send(JSON.stringify(new callStatus(0,"State set successfully")));
    
        }).catch((error)=>
        {
            res.send(JSON.stringify(new callStatus(-1,"error setting state : " + error)));
        })
    }
   
 }
)

app.post('/set-available',jsonParser,function(request,response)
{
    body = request.body;
    deliverer = new Deliverer(body.id,body.location,body.status);
    res.send(deliverer);
})
app.post("/set-item-state/:restaurantId/:category/:item/:state",jsonParser,function(req,res)
{
    var name = resNameIdMap.get(req.params.restaurantId);
    console.log("name : " + name);
    console.log("item" + req.params.item);
    console.log("category" + req.params.category);
    console.log("state " + req.params.state);
    console.log("restId" + req.params.restaurantId);
    FirestoreDB.collection('Restaurants').doc(name).collection(req.params.category).doc(req.params.item).update
    ({available :parseInt( req.params.state,10)}).then((parma)=>
    {
        console.log("item state set success");
        res.send(new callStatus(0,"State set successfully "));
    }).catch((error)=>
    {
        console.log("item state set failed " + error);
        res.send(new callStatus(-1,"Could not set state " + error));
    })
})


/*app.get('/get-restaurants',jsonParser,function(req,res)
{
    stringobj = '[';
    docRef = db.collection("Restaurants").doc("PIZZERIA ZOOM").get().then((doc)=>
{   console.log(doc.data());
    stringobj = stringobj + doc.data().toString() ;
   
    console.log(stringobj)
}).catch((err)=>
console.log(err))
stringobj = stringobj + ']'
res.send(stringobj)
})*/

/*docRef = db.collection("Restaurants").doc("PIZZERIA ZOOM").get().then((doc)=>
{
    resobj = new Restaurant(doc.name,doc.wilaya,doc.location,doc.status)
    console.log('['+ doc.data().toString() + ']')
}).catch((err)=>
console.log(err))*/

/*class FoodItem
{
    constructor(name,price,photoUrl)
    {
        this.name = name;
        this.price = price;
        this.photoUrl = photoUrl;
    }
    toString()
    {
     return '{' + this.name +','+this.price + ',' + this.photoUrl+'}'   
    }
}*/
class Restaurant
{
    constructor(resname,wilaya,location,status)
    {
        this.resname = resname;
        this.wilaya = wilaya;
        this.location = location;
        this.status = status;
    }
    toString()
    {
     return '{' + this.name +','+this.wilaya + ',' + this.location + this.status +'}'   
    }
    
}
/*class FoodCategory
{
    constructor(name,FoodItems)
    {
this.name = name;
this.FoodItems = FoodItems;
    }
}*/
/*myFoodItemslist = [];
myFoodItemslist.push(new FoodItem("pizza viande haché",250,null));
myFoodItemslist.push(new FoodItem("pizza margurite",200,null));
myFoodItemslist.push(new FoodItem("pizza  poulet",250,null));
myFoodItemslist.push(new FoodItem("pizza  thon",250,null));
Pizzas = new FoodCategory("Pizzas",myFoodItemslist);
res = new Restaurant("PIZZERIA ZOOM","ORAN","12.122544,14.23654",1,myFoodItemslist)*/
/*var FoodItemConverter = {
    toFirestore: function(FoodItem) {
        return {
            name: FoodItem.name,
            price: FoodItem.price,
            photoUrl: FoodItem.PhotoUrl
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new FoodItem(data.name, data.price, data.photoUrl);
    }
 
};

var RestaurantConverter = {
    toFirestore: function(Restaurant) {
        return {
            name: Restaurant.name,
            wilaya: Restaurant.price,
            location: Restaurant.location,
            status:Restaurant.status
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new Restaurant(data.name, data.wilaya, data.location,data.status);
    }
};
app.get('/get-restaurants',function(req,res)
{
    db.collection("Restaurants").get().withConverter(RestaurantConverter).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            resobj = new Restaurant(doc.name,doc.wilaya,doc.location,doc.status);
            res.send(resobj.toString())
        });
    });
})
app.get('/:restaurant/get-foodCategories', function (req, res) {
    params = req.params;
    restaurant  = db.collection('Restaurants').doc(params.restaurant).get().then((doc)=>
{
    if(doc.exists())
    {
res.send(doc.data());
    }
    else
    {
        //handle document does not exist
    }
}).catch((error)=>
{
    //handle error
})
});
app.get('get-foodItems/:restaurant/:category',function(req,res)
{
    params = req.params;
    restaurant = parmas.restaurant;
    category = params.category;
    db.collection('Restaurants').doc(restaurant).withConverter(RestaurantConverter).get().then((doc)=>
    {
if(doc.exists())
{
    if(doc.name === restaurant)
    {
        categories  = doc.collection('categories');
        categories.get().then((doc)=>
        {
            res.send(doc.data());
        })
    }
}
    })
})
    restaurantname = restaurant.name;
    foodCategories = restaurant.collection('categories').doc('pizza');
    foodCategories.get().withConverter(FoodItemConverter).then(querySnapshot => {
        querySnapshot.forEach((doc)=>
        {

        }

       
    
    )

  })
  
db.collection("Clients").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
});
*/


