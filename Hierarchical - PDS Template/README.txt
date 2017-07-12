

This sample app demonstates how to display hierarchical data for a parent and child relationship using the Kendo UI ListView control. 
It also provides support for CRUD capabilities for the child rows.
It utilizes all capabilities found in the default Progress Data Service template. The resource which the Progress Data Service 
 
The sample makes use of the JSDO dialect for the Kendo UI DataSource to provide data to the app's default listview control, which, in turn, 
utilizes the JavaScript data object (JSDO) to access the data and operations of a resource provided by a remote data service.
The resource should represent a DataSet with the parent and child table and their relationship.

The app contains 2 JSDO DataSources, one representing the parent, and the other representing the child. 
Both JSDO DataSources use a single instance of a JSDO which is the client representation of the resource.

Child JSDO DataSource:
    - The child JSDO DataSource's readLocal property is set to true. This is so that the child data will be read from the existing JSDO memory, 
      reducing server calls to the backend to retreive data.
    - If the backend resource supports the Submit operation, then the child JSDO DataSource's autoSave property is set to false.
      This is done so that when the child JSDO DataSource's sync() is called (when a change occurs), the underlying JSDO saveChanges() method
      is not called. The app batches all changes to send as a single unit, and sends the changeset to the backend when the Submit button is selected.
    - If the backend resource does NOT support the Submit operation, then the child JSDO DataSource's autoSave property is set to true.
      When the user selects the Save button (after making an individual child row change), the child JSDO DataSource's sync() method is called,
      and in this scenario, the underlying JSDO saveChanges() method is called, and the individual row change is sent as a single unit.


jsdoSettings properties:
------------------------

serviceURI:  Set this to your remote data service. It's the URI of the Web application that hosts the remote data service for which to start 
             the user login session.
             Ex. http://Your-IP-Address:8980/MyMobileWebAppl

catalogURIs: Specify one (or more) JSDO Catalog pathnames that describe the Mobile services provided by the remote data service. 
If more than one is specified, this is an array of strings.
             
resourceName: The name of the resource (found in a JSDO catalog file) for which the underlying JSDO instance is created.

authenticationModel: Should be set to either: "anonymous", "basic", or "form". If not specified, it's defaulted to "anonymous". 
                    It specifies the type of authentication that the backend server requires.

parentTableName: Specifies the parent table in the resource

parentDisplayFields: Specify one (or more) field names found in the specified parent table. This field(s) will be displayed on the parent list page 
                    for each row retreived from the remote data service.

childTableName: Specifies the child table in the resource

childDisplayFields: Specify one (or more) field names found in the specified child table. This field(s) will be displayed on the parent list page 
                  for each row retreived from the remote data service.

Example jsdoSettings object:
var jsdoSettings = { 
      "serviceURI": "http://oemobiledemo.progress.com/CustOrderService",
      "catalogURIs": "http://oemobiledemo.progress.com/CustOrderService/static/CustOrderSubService.json",     
      "authenticationModel": "Anonymous",
      "resourceName": "CustOrderNSub",
      "parentTableName": "eCustomer",	 
      "childTableName":  "eOrder",
      "parentDisplayFields": "CustNum,Name",
      "childDisplayFields":  "OrderNum, OrderStatus"
};
