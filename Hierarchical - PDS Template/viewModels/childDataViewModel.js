//'use strict';

(function (parent) {
    var childDataViewModel = kendo.observable({
        jsdoDataSource: undefined,
        jsdoModel: undefined,
        selectedRow: {},
        origRow: {},
        resourceName: undefined,
        addMode: false,
        hasChanges: false,  // keep track for submit
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

            clistView = $("#childListView").data("kendoMobileListView");
            if (clistView === undefined) {
                app.viewModels.childDataViewModel.onInit(this);
            } else if (clistView.dataSource && clistView.dataSource.data().length === 0) {
                clistView.dataSource.read();
            } 
            else {
            	    app.viewModels.childDataViewModel.createJSDODataSource();    
            }
                                   
            // Set list title to some name
            if (app.viewModels.childDataViewModel.resourceName !== undefined) {
                app.changeTitle("Orders of Customer");
            }
        },
        
         onInitMessageModalView: function(e) {
            console.log("I am in onInitMessageModalView");
        },
           
        onInit: function(e) {    
            try {
                app.views.childDetailView = e.view;
                // Create Data Source
                app.viewModels.childDataViewModel.createJSDODataSource();
                
                if (jsdoSettings && jsdoSettings.childDisplayFields) {   
                	fieldNames = jsdoSettings.childDisplayFields.split(",").join("#</br> #:");
                }
                
                // Create list
                if (fieldNames) {
                     $("#childListView").kendoMobileListView({
                        dataSource: app.viewModels.childDataViewModel.jsdoDataSource,
                        autoBind: false,
                        pullToRefresh: true,
                        appendOnRefresh: false,
                        endlessScroll: true,
                        virtualViewSize: 100,
                        template: "<a href='views/childViews/childDetailView.html'>" + "#: " + fieldNames + " #</a>",

                        click: function(e) {
                            // console.log("e.dataItem._id " + e.dataItem._id);
                            app.viewModels.childDataViewModel.set("selectedRow", e.dataItem);
                            // app.viewModels.parentDataViewModel.selectedCustNum = e.dataItem;
                            // alert("Selected Order Number:" +e.dataItem.OrderNum);
                        }
                    });
                }
                else {
                    console.log("Warning: jsdoSettings.childDisplayFields not specified");
                }
            }
            catch (ex) {    
                console.log("Error in initListView: " + ex);        
            }
        },
        
        createJSDODataSource: function() {
            var parentDataViewModel = app.viewModels.parentDataViewModel,
                childDataViewModel = app.viewModels.childDataViewModel;

            try { 
                // create JSDO
                if (jsdoSettings && jsdoSettings.resourceName) {   
                    
                    // Note: Instead of creating new JSDO instance using the same JSDO which is being used by parent table
                    this.jsdoModel = parentDataViewModel.jsdoModel;
                    
                    if (this.jsdoDataSource == undefined) {
                        this.jsdoDataSource = new kendo.data.DataSource({                        
                            type: "jsdo",
                            // TO_DO - Enter any sorting options
                            //serverSorting: true,                            
                            //sort: [ { field: "OrderNum", dir: "desc" } ],
                            batch: parentDataViewModel.useSubmit,
                            filter: { field: "CustNum", operator: "eq", value: parentDataViewModel.selectedCustNum },
                            transport: {
                                jsdo: this.jsdoModel,
                                tableRef: jsdoSettings.childTableName,
                                readLocal: true,
                                // If there is a submit operation, then childDataSource's autoSave should be false, so all child row changes can be batched together,
                                // and updates will be sent to backend when Submit btn is selected (which forces call to jsdo.saveChanges(true)).
                                // If there is no submit operation, then the app will send over changes a single row at a time. so we want autoSave to
                                // be true, so that we can call childDataSource.sync()
                                autoSave: !parentDataViewModel.useSubmit
                            },
                            error: function(e) {
                                console.log("Error: ", e);
                            },
                            
                            change: function(e){
                                if (e.action === "itemchange") {
                                    console.log("Order Details modified ...")
                                }
                            }                            
                        });                           
                    }
                    else {
                    	childDataViewModel.jsdoDataSource.filter({field: "CustNum", operator: "eq", value: parentDataViewModel.selectedCustNum});
                    	// this.jsdoDataSource.transport.options = {jsdo: app.viewModels.parentDataViewModel.jsdoModel, tableRef: jsdoSettings.childTableName, readLocal: true};
                        this.jsdoDataSource.transport.readLocal = true;
                        this.jsdoDataSource.transport.autoSave = !parentDataViewModel.useSubmit;                        
                        $('#childListView').getKendoMobileListView().refresh();
                        $('#childListView').getKendoMobileListView().setDataSource(childDataViewModel.jsdoDataSource);
                    }
                                     
                    // alert("DEBUG ::: JSDO DataSource Filter Options" +(JSON.stringify(app.viewModels.childDataViewModel.jsdoDataSource.filter())));                                       
                    
                    this.resourceName = jsdoSettings.resourceName;
                }
                else {
                    console.log("Warning: jsdoSettings.resourceName not specified");
                }
           }
           catch(ex) {
               app.viewModels.childDataViewModel.createDataSourceErrorFn({errorObject: ex});
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
        
        clearData: function () {
            var that = this,
                clistView; 
            
            if (that.jsdoModel) {
                that.jsdoModel.addRecords([], progress.data.JSDO.MODE_EMPTY);
            }
            clistView = $("#childListView").data("kendoMobileListView");
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
            var childDataViewModel = app.viewModels.childDataViewModel,
                parentDataViewModel = app.viewModels.parentDataViewModel
                jsdoDataSource = childDataViewModel.jsdoDataSource;

            $("#modalview-confirm").data("kendoMobileModalView").close();
            // Removes the specified data item from the data source
            jsdoDataSource.remove(childDataViewModel.selectedRow);
            
            if (parentDataViewModel.useSubmit === false) {
                childDataViewModel.doSync("delete");
            }
            else {
                childDataViewModel.doListRefresh = true;
                childDataViewModel.backToView("#childList");
            }
        },
        
         // Called when user selects "Cancel" button in Delete modal view
        cancelDelete: function(e) {    
            // User canceled delete, so nothing to do but remove dialog
            $("#modalview-confirm").kendoMobileModalView("close");
            
        },               
        
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
          ///////// ::: Functions for Detail view ::: //////////////
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
               
        // Called for editDetail view's data-show event
        onShowDetailView: function(e) {
            var parentDataViewModel = app.viewModels.parentDataViewModel;
            
        	parentDataViewModel.displayListButtons(e.view, false);
        },
        
        
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
          ///////// ::: Functions for editOrderDetail view ::: //////////////
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
        
        // Called for editOrderDetail view's data-init event
        onInitEditDetailView: function(e) { 
            var childDataViewModel = this.model,
                parentDataViewModel = app.viewModels.parentDataViewModel; 
            
            // If backend does not have a submit, then CUD operations will be sent to be when button selected
            if (!parentDataViewModel.useSubmit) {       
            	$("#editDetailDoneButton").html("Save");
            }
            app.views.childDetailView = e.view;
        },
        
         // Called for editDetail view's data-show event
        onShowEditDetailView: function(e) {
             var newRow,
                 childDataViewModel = this.model,
                 parentDataViewModel = app.viewModels.parentDataViewModel,
                 tabstrip,
                 errorMsg = undefined;    
            
            if (e.view.params.addMode && e.view.params.addMode === "true") {
                childDataViewModel.addMode = true;
                parentDataViewModel.displayListButtons(e.view, false);
                // Add a data item to the data source
                newRow = this.jsdoDataSource.add({});
                
                if (newRow) {
                	// Copy default values, if any..
                    childDataViewModel.set("selectedRow", newRow);   
            	}
            	else {
                    errorMsg = "Error adding new record";
            	}
            }
            else {
                e.view.footer.find("#deleteBtn").css("visibility", "visible");
                
            	// Save in case user hits Cancel button
                childDataViewModel.copyRow(childDataViewModel.selectedRow, childDataViewModel.origRow);
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
                childDataViewModel.onEditDetailView = true;
            
            	tabstrip = e.view.footer.find("#navigateTab").data("kendoMobileTabStrip");
            	// Clear out selected tab, so user can't reselect it while on editView
  				tabstrip.clear();
            }
        },
        
        // Called for editDetail view's data-hide event
        onHideEditDetailView: function(e) {
            childDataViewModel.onEditDetailView = false;
            
            e.view.footer.find("#deleteBtn").css("visibility", "hidden");
        },
        
        // Called when user selects "Cancel" button in editDetail view
        cancelEditDetail: function(e) {
            var childDataViewModel = app.viewModels.childDataViewModel,
                parentDataViewModel = app.viewModels.parentDataViewModel
                jsdoDataSource = childDataViewModel.jsdoDataSource;
            
         	if (childDataViewModel.addMode === true) {
            	// Remove record just added to jsdoDataSource 
                jsdoDataSource.remove(childDataViewModel.selectedRow);
				childDataViewModel.backToView("#childList");
            } 
            else {
                if (parentDataViewModel.useSubmit === false) {
                    // Determine if jsdoDataSource data items have any pending changes
                    if (jsdoDataSource.hasChanges()) {
                        // Cancel pending changes in the data source
                        jsdoDataSource.cancelChanges();
                        
                        // Reget current row, now with orig data, to restore orig data to controls
                        var dataItem = jsdoDataSource.get(childDataViewModel.selectedRow.id);
                        childDataViewModel.set("selectedRow", dataItem); 
                    }
                }
                else {
                    // We don't call cancelChanges() when doing submit. Don't want to lose any
                	// possible prior changes to this row
                    
                    // This will update the DataSource as well as selectedRow object with the original values
                    childDataViewModel.updateSelectedRow(childDataViewModel.origRow);
                }
                
                childDataViewModel.backToView("#childDetail"); 
            }    
        },
        
         // Called when user selects "Done" button in editOrderDetails view/page
        doneEditDetail: function(e) {
        	var parentListView = app.views.parentListView,
                childDataViewModel = app.viewModels.childDataViewModel,              
                parentDataViewModel = app.viewModels.parentDataViewModel
                jsdoDataSource = childDataViewModel.jsdoDataSource;
            
            if (parentDataViewModel.useSubmit === false) {
                childDataViewModel.doSync(childDataViewModel.addMode ?  "create" : "update" );
            }
            else {
                
                // As we are operating on two tables (parent and child), perform sync operation when only child records are updated
                // i.e., store them to JSDO memory (for time being) via .sync and use main Submit for sending back to server.
                // Note: In this case changes will not be sent to Server upon invoking .sync as we are using readLocal=TRUE
                
                if (jsdoDataSource.hasChanges()){
                    
                    console.log("There are changes made to Child Records - Orders ...")
                    jsdoDataSource.sync();
                    parentListView.footer.find("#submitBtn").data("kendoMobileButton").enable(true);
                    // Keep track for enabling Submit button
                    childDataViewModel.hasChanges = true;
                }                
                
                childDataViewModel.doListRefresh = true;
                childDataViewModel.backToView("views/childViews/childListView.html");        
            } 
        },
        
        // navView - specify view to navigate to
        backToView: function(navView) {
            var childDataViewModel = app.viewModels.childDataViewModel;
                
            // Reset to default, which is false
           	childDataViewModel.addMode = false;
            
            app.mobileApp.navigate(navView);
        },        
        
        // Called when useSubmit property is set to false, so only single row is involved.
        // It calls the DataSource sync() function (for individual create/update/delete operation)
		doSync: function(operation) {    
            var childDataViewModel = app.viewModels.childDataViewModel,
                parentDataViewModel = app.viewModels.parentDataViewModel,
                jsdoDataSource = childDataViewModel.jsdoDataSource,
                promise;
            
            try { 
                childDataViewModel.currentOperation = operation;
                
                // sync() saves the data item change (either update, delete, or create),
                // since jsdoDataSource is configured to a remote data service, change is 
                // sent to remote data service
                promise = jsdoDataSource.sync();
                promise.done( function() {
                    var dataItem;
                    
                    console.log(operation + " was successful");
                    childDataViewModel.doListRefresh = true;
                    
                     if (operation === "delete" || operation === "update") {
                    	childDataViewModel.backToView("#childList");
                    }
                    else {
                        // Reject selected row, in case backend updated its data
                       	dataItem = jsdoDataSource.get(childDataViewModel.selectedRow.id);
                       
                        // TO_DO: Need to investigate further. EmpNum field is set on backend, returned to client.
                        // So here trying to bind new data to control so its will be displayed in detailView and editDetailView.
                        // But empNum is not always displayed in control, once user hits "Save" button.
                        childDataViewModel.updateSelectedRow(dataItem);
                        
                        //childDataViewModel.backToView("#childDetail"); 
                        //childDataViewModel.backToView("views/OrdersofCustomer/orderDetails.html"); 
                    }
                   	
                });

               	promise.fail( function(xhr) {
               		var errorMsg;                   
                   	errorMsg = parentDataViewModel.normalizeError(xhr.request);   
                    errorMsg = "ERROR on " + operation + " operation:\n\n" + errorMsg;
                    console.log(errorMsg);
                    
                    // modalview uses asynchronous model, so specify code here to be run after 
                    // display of error message to user
                    app.closeDisplayMessageFn = 
                        function() {
                       		var childDataViewModel = app.viewModels.childDataViewModel,
                			    jsdoDataSource = childDataViewModel.jsdoDataSource,
                                saveSelectedRow = {},
                                dataItem;
                        
                        	if (childDataViewModel.currentOperation === "delete") {
                                // Calling cancelChanges(); deleted row remains in jsdoDataSource._destroyed array; need to remove
                                jsdoDataSource.cancelChanges();
                                childDataViewModel.backToView("#list");
                    		}
                        	else if (childDataViewModel.currentOperation === "update") {
                                // Save edited data. After we resync dataSource with jsdo, want to put back
                                // edits into controls, so user can modify
                				childDataViewModel.copyRow(childDataViewModel.selectedRow, saveSelectedRow);
                                
                                // On failure of datasource.sync(), pending changes persist, so read data from jsdo,
                                // cancelChanges() won't do this for updates once sync() is done
                                // (since jsdoDataSource._pristineData no longer has orig data)
                                childDataViewModel.doRead(true);
                                
                                // reget current row
                                dataItem = jsdoDataSource.get(childDataViewModel.selectedRow.id);
                                childDataViewModel.set("selectedRow", dataItem); 
                                
                                childDataViewModel.updateSelectedRow(saveSelectedRow);
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
             var childDataViewModel = app.viewModels.childDataViewModel,
                 jsdoDataSource = childDataViewModel.jsdoDataSource;
            
            // readLocal property tells jsdoDataSource transport where to get data from underlying jsdo,
            // either from local jsdo memory or from its corresponding back end service
        	jsdoDataSource.transport.readLocal = readLocal;
            // Reads the data (based upon readlocal property setting)
            jsdoDataSource.read();
     	},
        
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://        
        ////////////// Utility Functions //////////////
        // NOTE: These functions are used as part of Update and Delete operations
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
        
        updateSelectedRow: function(sourceRow) {
           var childDataViewModel = app.viewModels.childDataViewModel,
               schema = childDataViewModel.jsdoModel[this.jsdoDataSource.transport.tableRef].getSchema(),
           	   field,
               i;
            
            for (i = 0; i < schema.length; i++) {
                field = schema[i].name;
                childDataViewModel.set("selectedRow." + field, sourceRow[field]); 
            }
        },        
        
        copyRow: function(source, target) {
           var childDataViewModel = app.viewModels.childDataViewModel,
               schema = childDataViewModel.jsdoModel[this.jsdoDataSource.transport.tableRef].getSchema(),
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
                    	app.viewModels.childDataViewModel.copyRow(source[field], newObject);
                    	target[field] = newObject;
                	}
                	else
                    	target[field] = source[field];
  				}
            }
        }   
        
    });    
    
    parent.childDataViewModel = childDataViewModel;     
    
})(app.viewModels);
