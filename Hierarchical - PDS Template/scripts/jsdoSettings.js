
var jsdoSettings = { 
      "serviceURI": "http://oemobiledemo.progress.com/OEMobileDemoServices",
      "catalogURIs": "http://oemobiledemo.progress.com/OEMobileDemoServices/static/SportsService.json",     
      "authenticationModel": "Anonymous",
      "resourceName": "CustomerOrders",
      "parentTableName": "ttCustomer",	//Please note that this tableName is being used by tableRef property when the 
    						         //resource is built on top of two tables. Say Customer and Order    
      "childTableName": "ttOrder",
      "parentDisplayFields": "CustNum,Name",
      "childDisplayFields": "OrderNum, OrderStatus"
};

