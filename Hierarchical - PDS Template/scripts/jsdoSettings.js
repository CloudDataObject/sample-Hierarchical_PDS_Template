var jsdoSettings = { 

      "serviceURI": "http://oemobiledemo.progress.com/CustOrderService",
      "catalogURIs": "http://oemobiledemo.progress.com/CustOrderService/static/CustOrderSubService.json",     
      "authenticationModel": "Anonymous",
      "displayFields": "CustNum,Name",
      "resourceName": "CustOrderNSub",
      "tableName": "eCustomer",	//Please note that this tableName is being used by tableRef property when the 
    							//resource is built on top of two tables. Say Customer and Order    
      "tableName1": "eOrder",
      "displayFields1": "OrderNum, OrderStatus"
    
};
