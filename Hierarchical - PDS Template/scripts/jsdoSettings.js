
var jsdoSettings = { 
      "serviceURI": "http://oemobiledemo.progress.com/CustOrderService",
      "catalogURIs": "http://oemobiledemo.progress.com/CustOrderService/static/CustOrderSubService.json",     
      "authenticationModel": "Anonymous",
      "resourceName": "CustOrderNSub",
      "parentTableName": "eCustomer",	//Please note that this tableName is being used by tableRef property when the 
    						         //resource is built on top of two tables. Say Customer and Order    
      "childTableName": "eOrder",
      "parentDisplayFields": "CustNum,Name",
      "childDisplayFields": "OrderNum, OrderStatus"
};

