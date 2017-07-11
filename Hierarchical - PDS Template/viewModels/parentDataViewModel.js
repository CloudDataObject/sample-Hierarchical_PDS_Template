//'use strict';
(function (parent) {
    var parentDataViewModel = kendo.observable({
        jsdoDataSource: undefined,
        jsdoModel: undefined,
        selectedRow: {},
        resourceName: undefined,
        addMode: false,
        useSubmit: undefined,
        currentOperation: undefined,
        doListRefresh: false,
        selectedCustNum: undefined,
        
        // The order of the firing of events is as follows:
                  
        onShow: function(e) {
            var parentDataViewModel = app.viewModels.parentDataViewModel,
                clistView;

            clistView = $("#mainListView").data("kendoMobileListView");
            if (clistView === undefined) {
                parentDataViewModel.onInit(this);
            } else if (clistView.dataSource && clistView.dataSource.data().length === 0) {
                clistView.dataSource.read();
            }

            // Set list title to resource name
            if (app.viewModels.parentDataViewModel.resourceName !== undefined) {
                app.changeTitle("All Customers");
            }

            parentDataViewModel.displayListButtons(e.view, true);
        },
           
        onInit: function(e) {    
            var parentDataViewModel = app.viewModels.parentDataViewModel;

            console.log("In 'onInit' of 'parentDataViewModel.js' file");
            try {
                app.views.parentListView = e.view;
                // Create Data Source
                parentDataViewModel.createJSDODataSource();
                
                if (jsdoSettings && jsdoSettings.parentDisplayFields) {   
                	fieldNames = jsdoSettings.parentDisplayFields.split(",").join("#</br> #:");
            	}
                
                // Create list
                // if (jsdoSettings && jsdoSettings.displayFields) {
                if (fieldNames){
                     $("#mainListView").kendoMobileListView({
                        dataSource: parentDataViewModel.jsdoDataSource,
                        autoBind: false,
                        pullToRefresh: true,
                        appendOnRefresh: false,
                        endlessScroll: true,
                        virtualViewSize: 100,
                        template: "<a href='views/childViews/childListView.html'>" + "#: " + fieldNames + " #</a>",

                        click: function(e) {
                            // console.log("e.dataItem._id " + e.dataItem._id);
                            parentDataViewModel.set("selectedRow", e.dataItem);
                            parentDataViewModel.selectedCustNum = e.dataItem.CustNum;
                        }
                    });
                }
                else {
                    console.log("Warning: jsdoSettings.parentDisplayFields not specified");
                }

                if (parentDataViewModel.useSubmit === false) {
                    view.footer.find("#submitBtn").css("visibility", "hidden");
                    view.footer.find("#errorBtn").css("visibility", "hidden");
                }
            }
            catch (ex) {    
                console.log("Error in initListView: " + ex);        
            }
        },

        createJSDODataSource: function( ) {
            try { 
                // create JSDO
                if (jsdoSettings && jsdoSettings.resourceName) {   
                    this.jsdoModel = new progress.data.JSDO({ name : jsdoSettings.resourceName,
                        autoFill : false, events : {
                            'afterFill' : [ {
                                scope : this,
                                fn : function (jsdo, success, request) {
                                    // afterFill event handler statements ...
                                }
                            } ],
                            'beforeFill' : [ {
                                scope : this,
                                fn : function (jsdo, success, request) {
                                    // beforeFill event handler statements ...
                                }
                            } ]
                        }
                    });

                    this.useSubmit = this.jsdoModel._hasSubmitOperation;
                    // this.jsdoModel.useRelationships = false;	//This should not have any on JSDO impact with respect to readLocal

                    this.jsdoDataSource = new kendo.data.DataSource({
                        type: "jsdo",
                        // TO_DO - Enter your filtering and sorting options
                        serverFiltering: true,
                        serverSorting: true,
                        serverPaging: true,
                        //filter: { field: "State", operator: "startswith", value: "MA" },
                        //sort: [ { field: "Name", dir: "desc" } ],
                        batch: parentDataViewModel.useSubmit,
                        transport: {
                            jsdo: this.jsdoModel,
                            tableRef: jsdoSettings.parentTableName
                        },
                        error: function(e) {
                            console.log("Error: ", e);
                        }
                    });
                    this.resourceName = jsdoSettings.resourceName;
                }
                else {
                    console.log("Warning: jsdoSettings.resourceName not specified");
                }
           }
           catch(ex) {
               app.viewModels.parentDataViewModel.createDataSourceErrorFn({errorObject: ex});
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
            //that.jsdoModel = undefined;
            //that.jsdoDataSource = undefined;
            if (that.jsdoModel) {
                that.jsdoModel.addRecords([], progress.data.JSDO.MODE_EMPTY);
            }
            clistView = $("#mainListView").data("kendoMobileListView");
            if (clistView && clistView.dataSource) {
                // Clear ListView
                clistView.dataSource.data([]);
                clistView.refresh();
            }
       },
                
          onShowErrorListView: function(e) {
            var errorListView;
            
           	errorListView = $("#submitErrorsListView").data("kendoMobileListView");
            if (errorListView !== undefined) {
            	errorListView.dataSource.read();                
            }
           
    	},
        
        onInitErrorListView: function(e) {      
            var parentDataViewModel = this.model,
                jsdo = parentDataViewModel.jsdoModel,
                errorDataSource;
           
            try {
                errorDataSource = new kendo.data.DataSource({
                    transport: {
        				read: function (options) { 	
            				options.success(jsdo[app.viewModels.childDataViewModel.jsdoDataSource.transport.tableRef].getErrors());
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

        
        //Functions for Detail View - This may not be triggered for now for the Customer page because there is no implementation to see details of customer
        
        onShowDetailView: function(e) {        
            console.log("In 'onShowDetailView' of 'parentDataViewModel.js' file")
        	var parentDataViewModel = this.model;
        	parentDataViewModel.displayListButtons(e.view, false);        
    	},
                                         
         displayListButtons: function(view, show) { 
             console.log("In 'displayListButtons' of 'parentDataViewModel.js' file")
            var parentDataViewModel = app.viewModels.parentDataViewModel,
                childDataViewModel = app.viewModels.childDataViewModel,
                jsdo = parentDataViewModel.jsdoModel,
                childDataSource = app.viewModels.childDataViewModel.jsdoDataSource,
                enableSubmit = false,
                enableErrors = false;
            
            if (show) {                
                if (parentDataViewModel.useSubmit === true) {
                    view.footer.find("#submitBtn").css("visibility", "visible");
                    view.footer.find("#errorBtn").css("visibility", "visible");
                    
                    if (childDataSource) {
                        // Determine if childDataSource data items have any pending changes
                        if (childDataViewModel.hasChanges) {
                    		enableSubmit = true;
                            enableErrors = false;
                		}
                        else if (jsdo && jsdo[childDataSource.transport.tableRef].getErrors().length > 0) {
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
                view.footer.find("#submitBtn").css("visibility", "hidden");
                view.footer.find("#errorBtn").css("visibility", "hidden");
            } 
        },
        
        //Refresh operations in the 'All Customers' screen
        
        refresh: function(e) {    
            var parentDataViewModel = app.viewModels.parentDataViewModel,
                jsdoDataSource = parentDataViewModel.jsdoDataSource;
            
            // Determine if jsdoDataSource data items have any pending changes
            if (jsdoDataSource.hasChanges()) {
                $("#confirmRefresh").data("kendoMobileModalView").open();
            	e.preventDefault();
            }
            else {
                parentDataViewModel.finishRefresh();
            }
        },
        
        continueRefresh: function() {
            var parentDataViewModel = app.viewModels.parentDataViewModel;
          	$("#confirmRefresh").data("kendoMobileModalView").close();
            parentDataViewModel.finishRefresh();
      	},

      	cancelRefresh: function() {
          $("#confirmRefresh").data("kendoMobileModalView").close();
      	},
        
        finishRefresh: function() {
        	var parentDataViewModel = app.viewModels.parentDataViewModel,
                jsdoDataSource = parentDataViewModel.jsdoDataSource,
                view = app.views.parentListView,
                clistView;
        
        	try {
                if (jsdoDataSource.hasChanges()) {
                    // Cancel pending changes in the data source
                    jsdoDataSource.cancelChanges();
                      
                }
                
                // Ensure that submit and error buttons are disabled
                if (parentDataViewModel.useSubmit) {
                	view.footer.find("#submitBtn").data("kendoMobileButton").enable(false); 
                	view.footer.find("#errorBtn").data("kendoMobileButton").enable(false);
                }
                
                parentDataViewModel.doRead(false);
                clistView = $("#empListView").data("kendoMobileListView");
                if (clistView) {
                   clistView.scroller().reset();
                }
        	}
            catch(ex) {
            	console.log("Error in finishRefresh: " + ex);
            } 
    	},
        
         doRead: function(readLocal) {
             var parentDataViewModel = app.viewModels.parentDataViewModel,
                jsdoDataSource = parentDataViewModel.jsdoDataSource;
            
            // readLocal property tells jsdoDataSource transport where to get data from underlying jsdo,
            // either from local jsdo memory or from its corresponding back end service
        	jsdoDataSource.transport.readLocal = readLocal;
            // Reads the data (based upon readlocal property setting)
            jsdoDataSource.read();
     	},
        
        // navView - specify view to navigate to
        backToView: function(navView) {
            var parentDataViewModel = app.viewModels.parentDataViewModel;
                
            // Reset to default, which is false
           	parentDataViewModel.addMode = false;
            
            app.mobileApp.navigate(navView);
        },
        
        submit: function(operation) {
            console.log("Calling Submit() located in 'Customer' Page...");

            // Parent and child share the same jsdo
            var parentDataViewModel = app.viewModels.parentDataViewModel,
                childDataViewModel = app.viewModels.childDataViewModel,
                parentDataSource = parentDataViewModel.jsdoDataSource,
                childDataSource = childDataViewModel.jsdoDataSource,
                promise;
            
            try {
                // If Submit button is enabled, then we know there are child row changes
                // Note: Can't use childDataSource.hasChanges() since we already did a sync()
                if (childDataSource) {
                    // If the parentDataSource had changes, then calling parentDataSource.sync() would
                    // send both parent and child changes to the backend
                	promise = parentDataViewModel.jsdoModel.saveChanges(true);  
                
                    promise.done( function(jsdo, success, request) {
                        var view = app.views.parentListView;
                    
                        try {
                    	    navigator.notification.alert("Submit was successful");        
                    	    view.footer.find("#submitBtn").data("kendoMobileButton").enable(false);
                    	    view.footer.find("#errorBtn").data("kendoMobileButton").enable(false);

                            app.viewModels.childDataViewModel.hasChanges = false;
                        }
                        catch(ex) {
               			    console.log("Error in submit, promise.done(): " + ex); 
            		    }
                    });

                    promise.fail( function(jsdo , success, request) {
               		    var view = app.views.parentListView,
                            parentDataViewModel = app.viewModels.parentDataViewModel,
                            errorMsg;
                   
                   	    try {
                    	    errorMsg = parentDataViewModel.normalizeError(request);
                        
                            // Only enable the Error button if row error(s) occurred. The error listview is how 
                            // multiple row errors are displayed to user
                            if (jsdo && jsdo[childDataSource.transport.tableRef].getErrors().length > 0) {
                                errorMsg += "\n\nPlease use Errors button to see a list of errors.";
                                view.footer.find("#errorBtn").data("kendoMobileButton").enable(true);
                            }
						
                    	    view.footer.find("#submitBtn").data("kendoMobileButton").enable(false);
                        
                            // modalview uses asynchronous model, so specify code here to be run after 
                    	    // display of error message to user
                    	    app.closeDisplayMessageFn = 
                        	    function() {
                       			    var parentDataViewModel = app.viewModels.parentDataViewModel,
                                        childDataViewModel = app.viewModels.childDataViewModel,
                			    	    childDataSource = childDataViewModel.jsdoDataSource;
                        		
                   				    // On failure, deleted rows remain in childDataSource._destroyed array;
                            	    // Calling cancelChanges() clears out _destroyed array
                    			    childDataSource.cancelChanges();
                    			    childDataViewModel.doRead(true); 
                                    childDataViewModel.hasChanges = false;
 							     };
                        
                    	    app.showError("ERROR while saving changes:\n\n" + errorMsg);
                        }
                        catch(ex) {
                            console.log("Error in submit, promise.fail(): " + ex); 
                       } 	
                    }); // end promise.fail
                }
            }
            catch(ex) {
               console.log("Error in submit: " + ex); 
            } 
        },        
        
        normalizeError: function (request) {        
        	var errorMsg = "",
                jsdo = request.jsdo,
           	    response = request.response,
                childDataSource = app.viewModels.childDataViewModel.jsdoDataSource,
                lastErrors = jsdo[childDataSource.transport.tableRef].getErrors();            
            
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
        
    });    
    
    parent.parentDataViewModel = parentDataViewModel;
    
})(app.viewModels);
