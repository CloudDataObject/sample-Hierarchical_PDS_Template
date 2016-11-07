//'use strict';

(function (parent) {
    var Orders_of_Cust_dataViewModel = kendo.observable({
        jsdoDataSource: undefined,
        jsdoModel: undefined,
        selectedRow: {},
        origRow: {},
        resourceName: undefined,
        addMode: false,
        useSubmit: undefined,
        currentOperation: undefined,
        onEditDetailView: false,
        doListRefresh: false,
        
        // ::: The order of the firing of events is as follows :::
        
        //   before-show: Should we JSDO Instance everytime whenever accessing child records for a selected parent? or use existing instance
        //   init: This is called only once for the first time. i.e., in the parent listView, once user selects a customer record, 
        			// respective child (Order) records are retrieved
        //   show
           
/*  beforeshow
	init -> createJSDODataSource -> createDataSourceErrorFn (If required)
	clearData (First time clears data)
	onShowDetailView (Yet to use. This is required when opening details of an Order when selected in the child page listView)
	displayListButtons */
        
        onBeforeShow: function() {
            var clistView;   

            clistView = $("#orderofcustomerView").data("kendoMobileListView");
            if (clistView === undefined) {
                app.viewModels.Orders_of_Cust_dataViewModel.onInit(this);
            } else if (clistView.dataSource && clistView.dataSource.data().length === 0) {
                clistView.dataSource.read();
            } 
            else {
            	    app.viewModels.Orders_of_Cust_dataViewModel.createJSDODataSource();    
            }
                                   
             // Set list title to some name
                if (app.viewModels.Orders_of_Cust_dataViewModel.resourceName !== undefined) {
                    app.changeTitle("Orders of Customer");
                }
        },
        
         onInitMessageModalView: function(e) {
            console.log("I am in onInitMessageModalView");
        },
           
        onInit: function(e) {    
            try {
                // Create Data Source
                app.viewModels.Orders_of_Cust_dataViewModel.createJSDODataSource();
                app.views.listView = e.view;
                
                if (jsdoSettings && jsdoSettings.displayFields1) {   
                	fieldNames = jsdoSettings.displayFields1.split(",").join("#</br> #:");
                }
                
                // Create list
                // if (jsdoSettings && jsdoSettings.displayFields1) {
                if (fieldNames){
                     $("#orderofcustomerView").kendoMobileListView({
                        dataSource: app.viewModels.Orders_of_Cust_dataViewModel.jsdoDataSource,
                        autoBind: false,
                        pullToRefresh: true,
                        appendOnRefresh: false,
                        endlessScroll: true,
                        virtualViewSize: 100,
                        // template: "#:" + jsdoSettings.displayFields1.split(",").join("#</br> #:") + "#", 
                         // template: "<a href='views/detailView.html'>" + "#: " + fieldNames + " #</a>",
                         template: "<a href='views/OrdersofCustomer/orderDetails.html'>" + "#: " + fieldNames + " #</a>",

                        click: function(e) {
                            // console.log("e.dataItem._id " + e.dataItem._id);
                            app.viewModels.Orders_of_Cust_dataViewModel.set("selectedRow", e.dataItem);
                            // selectedCustNum = e.dataItem;
                            // alert("Selected Order Number:" +e.dataItem.OrderNum);
                        }
                    });
                }
                else {
                    console.log("Warning: jsdoSettings.displayFields1 not specified");
                }
            }
            catch (ex) {    
                console.log("Error in initListView: " + ex);        
            }
        },
        
        createJSDODataSource: function() {
            try { 
                // create JSDO
                if (jsdoSettings && jsdoSettings.resourceName) {   
                    
                    // Note: Instead of creating new JSDO instance using the same JSDO which is being used by parent table
                    this.jsdoModel = jsdo_for_orders;
                    // this.useSubmit = this.jsdoModel._hasSubmitOperation;
                    
                    if (this.jsdoDataSource == undefined) {
                        this.jsdoDataSource = new kendo.data.DataSource({                        
                            type: "jsdo",
                            // TO_DO - Enter your filtering and sorting options
                            //serverFiltering: true,
                            //serverSorting: true,                            
                            //sort: [ { field: "Name", dir: "desc" } ],
                            batch: Orders_of_Cust_dataViewModel.useSubmit,
                            filter: { field: "CustNum", operator: "eq", value: selectedCustNum },
                            transport: {
                                // jsdo: this.jsdoModel,
                                jsdo: jsdo_for_orders,
                                tableRef: jsdoSettings.tableName1,
                                readLocal: true,
                                autoSave: false
                            },
                            error: function(e) {
                                console.log("Error: ", e);
                            },
                            
                            change: function(e){
                                if (e.action === "itemchange") {
                                    console.log("Order Details got modified ...")
                                }
                            }                            
                        });                           
                    }
                    else {
                    	app.viewModels.Orders_of_Cust_dataViewModel.jsdoDataSource.filter({field: "CustNum", operator: "eq", value: selectedCustNum});
                    	// this.jsdoDataSource.transport.options = {jsdo: jsdo_for_orders, tableRef: jsdoSettings.tableName1, readLocal: true};
                        this.jsdoDataSource.transport.readLocal = true;
                        this.jsdoDataSource.transport.autoSave=false;
                        var mylistView = $("#orderofcustomerView").data("kendoMobileListView");                        
                        $('#orderofcustomerView').getKendoMobileListView().refresh();
                        $('#orderofcustomerView').getKendoMobileListView().setDataSource(app.viewModels.Orders_of_Cust_dataViewModel.jsdoDataSource);
                    }
                                     
                    // alert("DEBUG ::: JSDO DataSource Filter Options" +(JSON.stringify(app.viewModels.Orders_of_Cust_dataViewModel.jsdoDataSource.filter())));                                       
                    
                    this.resourceName = jsdoSettings.resourceName;
                }
                else {
                    console.log("Warning: jsdoSettings.resourceName not specified");
                }
           }
           catch(ex) {
               app.viewModels.Orders_of_Cust_dataViewModel.createDataSourceErrorFn({errorObject: ex});
           } 
        },   
        
         createDataSourceErrorFn: function(info) {
            var msg = "Error on create DataSource";
            app.showError(msg);
            if (info.errorObject !== undefined) {
                msg = msg + "\n" + info.errorObject;
            }
            console.log(msg);
        },
        
        displayListButtons: function(view, show) { 
            var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
                jsdo = Orders_of_Cust_dataViewModel.jsdoModel,
                jsdoDataSource = Orders_of_Cust_dataViewModel.jsdoDataSource,
                enableSubmit = false,
                enableErrors = false;
            
            if (show) {
                
                if (Orders_of_Cust_dataViewModel.useSubmit === true) {
                    view.footer.find("#submitBtn").css("visibility", "visible");
                    view.footer.find("#errorBtn").css("visibility", "visible");
                    
                    if (jsdoDataSource) {
                        // Determine if jsdoDataSource data items have any pending changes
                        if (jsdoDataSource.hasChanges()) {
                    		enableSubmit = true;
                            enableErrors = false;
                		}
                        // else if (jsdo && jsdo.getErrors().length > 0) {
                        else if (jsdo && jsdo[app.viewModels.Orders_of_Cust_dataViewModel.jsdoDataSource.transport.tableRef].getErrors().length > 0) {                        
                    		enableErrors = true;
                		} 
                    }
                    view.footer.find("#submitBtn").data("kendoMobileButton").enable(enableSubmit);
                    view.footer.find("#errorBtn").data("kendoMobileButton").enable(enableErrors);
                    //Always show border
                    $('.buttonDiv').css('border','solid').css('border-width','1px').css('border-color', 'rgba(0,0,0,0.1)');

                }
            }
            else {
                // If useSubmit is false, don't bother hiding buttons. They're never displayed in this case
                if (Orders_of_Cust_dataViewModel.useSubmit === true) {
                    view.footer.find("#submitBtn").css("visibility", "hidden");
                    view.footer.find("#errorBtn").css("visibility", "hidden");
                }
            } 
        },                
        
        clearData: function () {
            var that = this,
                clistView; 
            //that.jsdoModel = undefined;
            //that.jsdoDataSource = undefined;
            if (that.jsdoModel) {
                that.jsdoModel.addRecords([], progress.data.JSDO.MODE_EMPTY);
            }
            clistView = $("#orderofcustomerView").data("kendoMobileListView");
            if (clistView && clistView.dataSource) {
                // Clear ListView
                clistView.dataSource.data([]);
                clistView.refresh();
            }
       },        
        
        verifyDoDelete: function(e) {
        	// Must ask user if they really want to delete current record
           	$("#modalview-confirm").data("kendoMobileModalView").open();    
        },
        
        // Called when user selects "Delete" button in Delete modal view
        deleteRow: function(e) {
            var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
                jsdoDataSource = Orders_of_Cust_dataViewModel.jsdoDataSource;

            $("#modalview-confirm").data("kendoMobileModalView").close();
            // Removes the specified data item from the data source
            jsdoDataSource.remove(Orders_of_Cust_dataViewModel.selectedRow);
            
            if (Orders_of_Cust_dataViewModel.useSubmit === false) {
                Orders_of_Cust_dataViewModel.doSync("delete");
            }
            else {
                Orders_of_Cust_dataViewModel.doListRefresh = true;
                Orders_of_Cust_dataViewModel.backToView("#mainList");
            }
        },
        
         // Called when user selects "Cancel" button in Delete modal view
        cancelDelete: function(e) {    
            // User canceled delete, so nothing to do but remove dialog
            $("#modalview-confirm").kendoMobileModalView("close");
            
        },        
        
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
          ///////// ::: Functions for errorDetail view ::: //////////////
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
        
        onInitErrorListView: function(e) {      
            var Orders_of_Cust_dataViewModel = this.model,
                jsdo = Orders_of_Cust_dataViewModel.jsdoModel,
                errorDataSource;
           
            try {
                errorDataSource = new kendo.data.DataSource({
                    transport: {
        				read: function (options) { 	
            				// options.success(jsdo.getErrors());
                            options.success(jsdo[app.viewModels.Orders_of_Cust_dataViewModel.jsdoDataSource.transport.tableRef].getErrors());
                            
        				}
    				}
                });

            	$("#submitErrorsListView").kendoMobileListView({
                	dataSource: errorDataSource,
                    pullToRefresh: true,
                	appendOnRefresh: false,
                    // error is property in object(s) returned from jsdo.getErrors()
                    template: "#: error #"
            	});
                
        	}
        	catch (ex) {    
            	console.log("Error in onInitErrorListView: " + ex);        
        	}
    	},
        
        onShowErrorListView: function(e) {
            var errorListView;
            
           	errorListView = $("#submitErrorsListView").data("kendoMobileListView");
            if (errorListView !== undefined) {
            	errorListView.dataSource.read();                
            }
           
    	},          
        
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
          ///////// ::: Functions for Detail view ::: //////////////
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
               
        // Called for editDetail view's data-show event
        onShowDetailView: function(e) {
            var Orders_of_Cust_dataViewModel = this.model;
            
            console.log("From onShowDetailView");
            
        	Orders_of_Cust_dataViewModel.displayListButtons(e.view, false);
        },
        
        
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
          ///////// ::: Functions for editOrderDetail view ::: //////////////
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
        
        // Called for editOrderDetail view's data-init event
        onInitEditDetailView: function(e) { 
            var Orders_of_Cust_dataViewModel = this.model; 
            
            // If backend does not have a submit, then CUD operations will be sent to be when button selected
            if (!Orders_of_Cust_dataViewModel.useSubmit) {       
            	$("#editDetailDoneButton").html("Save");
            }
            app.views.editOrderDetailView = e.view;
        },
        
         // Called for editDetail view's data-show event
        onShowEditDetailView: function(e) {
             var newRow,
                 Orders_of_Cust_dataViewModel = this.model,
                 tabstrip,
                 errorMsg = undefined;    
            
            if (e.view.params.addMode && e.view.params.addMode === "true") {
                Orders_of_Cust_dataViewModel.addMode = true;
                Orders_of_Cust_dataViewModel.displayListButtons(e.view, false);
                // Add a data item to the data source
                newRow = this.jsdoDataSource.add({});
                
                if (newRow) {
                	// Copy default values, if any..
                    Orders_of_Cust_dataViewModel.set("selectedRow", newRow);   
            	}
            	else {
                    errorMsg = "Error adding new record";
            	}
            }
            else {
                e.view.footer.find("#deleteBtn").css("visibility", "visible");
                
            	// Save in case user hits Cancel button
                Orders_of_Cust_dataViewModel.copyRow(Orders_of_Cust_dataViewModel.selectedRow, Orders_of_Cust_dataViewModel.origRow);
            }
            
            if (errorMsg) {
                // modalview uses asynchronous model, so specify code here to be run after 
                // display of error message to user
                app.closeDisplayMessageFn = 
                    function() {
                		$("#editDetailDoneButton").data("kendoMobileButton").enable(false);
                    };

                app.showError(errorMsg);
            }
            else {
                Orders_of_Cust_dataViewModel.onEditDetailView = true;
            
            	tabstrip = e.view.footer.find("#navigateTab").data("kendoMobileTabStrip");
            	// Clear out selected tab, so user can't reselect it while on editView
  				tabstrip.clear();
            }
        },
        
        // Called for editDetail view's data-hide event
        onHideEditDetailView: function(e) {
            Orders_of_Cust_dataViewModel.onEditDetailView = false;
            
            e.view.footer.find("#deleteBtn").css("visibility", "hidden");
        },
        
        // Called when user selects "Cancel" button in editDetail view
        cancelEditDetail: function(e) {
            var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
                jsdoDataSource = Orders_of_Cust_dataViewModel.jsdoDataSource;
            
         	if (Orders_of_Cust_dataViewModel.addMode === true) {
            	// Remove record just added to jsdoDataSource 
                jsdoDataSource.remove(Orders_of_Cust_dataViewModel.selectedRow);
				Orders_of_Cust_dataViewModel.backToView("#list");
            } 
            else {
                if (Orders_of_Cust_dataViewModel.useSubmit === false) {
                    // Determine if jsdoDataSource data items have any pending changes
                    if (jsdoDataSource.hasChanges()) {
                        // Cancel pending changes in the data source
                        jsdoDataSource.cancelChanges();
                        
                        // Reget current row, now with orig data, to restore orig data to controls
                        var dataItem = jsdoDataSource.get(Orders_of_Cust_dataViewModel.selectedRow.id);
                        Orders_of_Cust_dataViewModel.set("selectedRow", dataItem); 
                    }
                }
                else {
                    // We don't call cancelChanges() when doing submit. Don't want to lose any
                	// possible prior changes to this row
                    
                    // This will update the DataSource as well as selectedRow object with the original values
                    Orders_of_Cust_dataViewModel.updateSelectedRow(Orders_of_Cust_dataViewModel.origRow);
                }
                
                Orders_of_Cust_dataViewModel.backToView("#detail"); 
            }    
        },
        
         // Called when user selects "Done" button in editOrderDetails view/page
        doneEditDetail: function(e) {
        	var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,              
              
                jsdoDataSource = Orders_of_Cust_dataViewModel.jsdoDataSource;
            
            if (Orders_of_Cust_dataViewModel.useSubmit === false) {
                Orders_of_Cust_dataViewModel.doSync(Orders_of_Cust_dataViewModel.addMode ?  "create" : "update" );
            }
            else {
                
                // As we are operating on two tables (parent and child), perform sync operation when only child records are updated
                // i.e., store them to JSDO memory (for time being) via .sync and use main Submit for sending back to server.
                // Note: In this case changes will not be sent to Server upon invoking .sync as we are using readLocal=TRUE
                
                if (jsdoDataSource.hasChanges()){
                    
                    console.log("There are changes made to Child Records - Orders ...")
                    jsdoDataSource.sync();
                    // Orders_of_Cust_dataViewModel.doSync("update");
                }                
                
                Orders_of_Cust_dataViewModel.doListRefresh = true;                
                Orders_of_Cust_dataViewModel.backToView("views/OrdersofCustomer/ordersofCustomer.html"); 
            } 
        },
        
        // navView - specify view to navigate to
        backToView: function(navView) {
            var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel;
                
            // Reset to default, which is false
           	Orders_of_Cust_dataViewModel.addMode = false;
            
            app.mobileApp.navigate(navView);
        },        
        
        // Called when useSubmit property is set to false, so only single row is involved.
        // It calls the DataSource sync() function (for individual create/update/delete operation)
		doSync: function(operation) {    
            var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
                jsdoDataSource = Orders_of_Cust_dataViewModel.jsdoDataSource,
                promise;
            
            try { 
                
                Orders_of_Cust_dataViewModel.currentOperation = operation;
                
                // sync() saves the data item change (either update, delete, or create),
                // since jsdoDataSource is configured to a remote data service, change is 
                // sent to remote data service
                promise = jsdoDataSource.sync();
                promise.done( function() {
                    var dataItem;
                    
                    console.log(operation + " was successful");
                    Orders_of_Cust_dataViewModel.doListRefresh = true;
                    
                     if (operation === "delete" || operation === "update") {
                    	Orders_of_Cust_dataViewModel.backToView("#mainList");
                    }
                    else {
                        // Reject selected row, in case backend updated its data
                       	dataItem = jsdoDataSource.get(Orders_of_Cust_dataViewModel.selectedRow.id);
                       
                        // TO_DO: Need to investigate further. EmpNum field is set on backend, returned to client.
                        // So here trying to bind new data to control so its will be displayed in detailView and editDetailView.
                        // But empNum is not always displayed in control, once user hits "Save" button.
                        Orders_of_Cust_dataViewModel.updateSelectedRow(dataItem);
                        
                        //dataViewModel.backToView("#detail"); 
                        Orders_of_Cust_dataViewModel.backToView("views/OrdersofCustomer/orderDetails.html"); 
                    }
                   	
                });

               	promise.fail( function(xhr) {
               		var errorMsg;                   
                   	errorMsg = Orders_of_Cust_dataViewModel.normalizeError(xhr.request);   
                    errorMsg = "ERROR when doing " + operation + " operation:\n\n" + errorMsg;
                    console.log(errorMsg);
                    
                    // modalview uses asynchronous model, so specify code here to be run after 
                    // display of error message to user
                    app.closeDisplayMessageFn = 
                        function() {
                       		var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
                			    jsdoDataSource = Orders_of_Cust_dataViewModel.jsdoDataSource,
                                saveSelectedRow = {},
                                dataItem;
                        
                        	if (Orders_of_Cust_dataViewModel.currentOperation === "delete") {
                                // Calling cancelChanges(); deleted row remains in jsdoDataSource._destroyed array; need to remove
                                jsdoDataSource.cancelChanges();
                                Orders_of_Cust_dataViewModel.backToView("#list");
                    		}
                        	else if (Orders_of_Cust_dataViewModel.currentOperation === "update") {
                                // Save edited data. After we resync dataSource with jsdo, want to put back
                                // edits into controls, so user can modify
                				Orders_of_Cust_dataViewModel.copyRow(Orders_of_Cust_dataViewModel.selectedRow, saveSelectedRow);
                                
                                // On failure of datasource.sync(), pending changes persist, so read data from jsdo,
                                // cancelChanges() won't do this for updates once sync() is done
                                // (since jsdoDataSource._pristineData no longer has orig data)
                                Orders_of_Cust_dataViewModel.doRead(true);
                                
                                // reget current row
                                dataItem = jsdoDataSource.get(Orders_of_Cust_dataViewModel.selectedRow.id);
                                Orders_of_Cust_dataViewModel.set("selectedRow", dataItem); 
                                
                                Orders_of_Cust_dataViewModel.updateSelectedRow(saveSelectedRow);
                            }                        	
                    };
                    app.showError(errorMsg);   
                    
                }); // end promise.fail
           
            }
            catch(ex) {
               console.log("Error in doSync: " + ex);  
            } 
        },
        
        doRead: function(readLocal) {
             var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
                jsdoDataSource = Orders_of_Cust_dataViewModel.jsdoDataSource;
            
            // readLocal property tells jsdoDataSource transport where to get data from underlying jsdo,
            // either from local jsdo memory or from its corresponding back end service
        	jsdoDataSource.transport.readLocal = readLocal;
            // Reads the data (based upon readlocal property setting)
            jsdoDataSource.read();
     	},
        
        normalizeError: function (request) {        
        	var errorMsg = "",
                jsdo = request.jsdo,
           	    response = request.response,
                // lastErrors = jsdo.getErrors();
              lastErrors = jsdo[app.viewModels.Orders_of_Cust_dataViewModel.jsdoDataSource.transport.tableRef].getErrors();
            
            /* Try to get the error string from _error object. Then check if
             * it was a data error, otherwise see if the error came as a string in the body. 
             * If nothing is set, then just get the native statusTest */        
            
            if (response && response._errors && response._errors.length > 0) {   
                errorMsg = response._errors[0]._errorMsg;
            }
            else if (lastErrors.length === 1) {
                errorMsg = lastErrors[0].error;
			}
            else if (lastErrors.length > 1) {
                errorMsg = "Submit failed with " + lastErrors.length + (lastErrors.length == 1 ? " error." : " errors.");
			}
            
            if (errorMsg === "") {
                if (request.xhr.responseText.substring(0,6) !== "<html>")  {
                    errorMsg = request.xhr.responseText;
                }  
                if (errorMsg === "") {
                    errorMsg = request.xhr.statusText;
                }      
            }   
            
            return errorMsg;   
		},
        
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://        
        		////////////// Utility Functions //////////////
        	// NOTE: These functtions are used as part of Update and Delete operations
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
        
        updateSelectedRow: function(sourceRow) {
           var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
               schema = Orders_of_Cust_dataViewModel.jsdoModel[this.jsdoDataSource.transport.tableRef].getSchema(),
           	   field,
               i;
            
            for (i = 0; i < schema.length; i++) {
                field = schema[i].name;
                Orders_of_Cust_dataViewModel.set("selectedRow." + field, sourceRow[field]); 
            }
        },        
        
        copyRow: function(source, target) {
           var Orders_of_Cust_dataViewModel = app.viewModels.Orders_of_Cust_dataViewModel,
               schema = Orders_of_Cust_dataViewModel.jsdoModel[this.jsdoDataSource.transport.tableRef].getSchema(),
           	   field,
               i;
            
            if (source === undefined) {
                return;
            }

            for (i = 0; i < schema.length; i++) {
                field = schema[i].name;
                
                if (source.hasOwnProperty(field)) {
                    if (source[field] === undefined || source[field] === null) {
                    	target[field] = source[field];
                	}
                	else if (source[field] instanceof Date) {
                    	target[field] = source[field];
                	}        
                	else if (typeof source[field] === 'object') {
                    	var newObject = source[field] instanceof Array ? [] : {};
                    	app.viewModels.Orders_of_Cust_dataViewModel.copyRow(source[field], newObject);
                    	target[field] = newObject;
                	}
                	else
                    	target[field] = source[field];
  				}
            }
        }   
        
    });    
    
    parent.Orders_of_Cust_dataViewModel = Orders_of_Cust_dataViewModel;    
    
    
})(app.viewModels);
