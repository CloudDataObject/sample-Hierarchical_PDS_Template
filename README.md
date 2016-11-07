# sample-Hierarchical_PDS_Template
This app demonstrates the usage of hierarchical data using Keno UI List View control with JSDO and JSDO dialect

The app is accessible by either selecting the “Try in AppBuilder” button, or you can manually download the zip file by selecting the “Download ZIP” button above. Note: The app is not compatible with the Telerik Platform Views service.

<a href="https://platform.telerik.com/#appbuilder/clone/https://github.com/CloudDataObject/sample-Hierarchical_PDS_Template">Try in AppBuilder</a>

This app can be cloned in the Telerik Platform (by selecting above button) to build a Hybrid Mobile App. You can explore and modify the code, and build and run it on Android and iOS devices.

This sample is a fully functional CRUD app utilizing all capabilities found in the default Progress Data Service template. It makes use of the JavaScript Data Object dialect of the Kendo UI DataSource to provide data to the app's default listview control, which, in turn, utilizes the JavaScript data object (JSDO) to access the data and operations of a Mobile resource provided by a remote data service.

The app can support anonymous, form, or basic authentication to an OpenEdge or Rollbase server using the JSDO Session management, depending upon the corresponding backend's authentication model. The current configuration of the sample app supports the anonymous model.

In addition, it provides the user with the ability to perform CUD operations (create, update, and delete) across parent and child datasources.

This sample uses the same JSDO instance for both parent and child datasources
Possess usage of readLocal and autoSave properties at JSDO datasource
Uses PDS template which is available as part of Telerik Platform
Possess JSDO 4.3
For more information, download the sample app to the Telerik Platform, and see its README.txt.

## Running the Sample

With the Telerik Platform, you can deploy apps in the device simulator and on device wirelessly or via cable connection. For more information about running apps, see [Running Your App][Running Your App].

To test the LiveSync JavaScript API sample, choose one of the following deployment methods.

Build your project for the companion app and deploy it via QR code. Build your project as an application package with the Debug build configuration. 

## License

This sample is licensed under the Apache License, Version 2.0. For more information, see [License][License].

[License]: https://github.com/CloudDataObject/sample-Hierarchical_PDS_Template/blob/master/LICENSE
[Running Your App]: http://docs.telerik.com/platform/appbuilder/testing-your-app/run-your-app
