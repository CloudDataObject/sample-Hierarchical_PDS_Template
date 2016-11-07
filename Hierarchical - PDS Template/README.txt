This app uses pre-defined PDS (Progress Data Service) template which will allow us to connect to any of the remote (OpenEdge) backend services
 
It makes use of the JavaScript Data Object dialect of the Kendo UI DataSource to provide data to the app's default listview control, which, 
in turn, utilizes the JavaScript data object (JSDO) to access the data and operations of a Mobile resource provided by a remote data service.

In order to create and use the JSDO Dialect of the DataSource, and ultimately access the remote data service, the user must establish session with JSDO. 
The PDS template code instantiates an underlying progress.data.JSDOSession object providing this support. 

The jsdoSettings object (found in jsdoSettings.js) allows you to easily specify properties for the remote data service. 
In order to run your app, you must set the properties in the jsdoSettings object.

   - This sample uses the same JSDO instance for both parent and child datasources
   - Possess usage of readLocal and autoSave properties at JSDO datasource
   - Uses PDS template which is available as part of Telerik Platform
   - Possess JSDO 4.3 

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
                     
displayFields: Specify one (or more) field names found in the specified resource. This field(s) will be displayed on the list page 
               for each row retreived from the remote data service.


Example jsdoSetttings object for OpenEdge:
var jsdoSettings = {    
      "serviceURI": "http://oemobiledemo.progress.com/CustOrderService",
      "catalogURIs": "http://oemobiledemo.progress.com/CustOrderService/static/CustOrderSubService.json",     
      "authenticationModel": "Anonymous",
      "displayFields": "CustNum,Name",
      "resourceName": "Customer"
}; 
 
Example jsdoSetttings object for Rollbase:
Note: Use the allobjects.json catalog or define an object specific catalog as shown below using Progress Data Catalogs in Settings.

var jsdoSettings = {    
      "serviceURI": "https://www.rollbase.com/rest/jsdo",
      "catalogURIs": "https://www.rollbase.com/rest/jsdo/catalog/Contact.json",     
      "authenticationModel": "Form",
      "displayFields": "name",
      "resourceName": "Contact"
}; 
