/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/search', 'N/record', 'N/format'], function(search, record, format) {
    function afterSubmit(context) {
        var currentRecord = context.newRecord;
        var oldRecord = context.oldRecord;
        var expirationDate = currentRecord.getValue({
            fieldId: "expirationdate"
        });
        var expDate = format.parse({
            value: expirationDate,
            type: format.Type.DATE
        });
        if(expDate > new Date()){               //to Good status
            runSearch(oldRecord, "quantityonhand", 6, 1);
        }
        else if(expDate < new Date()){          //to Expired status
            runSearch(oldRecord, "quantityavailable", 1, 6);
        }
    }
    function runSearch(oldRecord, quantityType, oldStatus, newStatus){
        var lot = oldRecord.getValue({
            fieldId: "id"
        });
        var lotName = oldRecord.getValue({
            fieldId: "inventorynumber"
        });
        var item = oldRecord.getValue({
            fieldId: "item"
        });
        var itemName = oldRecord.getText({
            fieldId: "itemname"
        });
        var quantitySearch = search.load({          //load search for inventory number's bin quantities
            id: 'customsearchedit_quantity'
        });
        var itemFilter = search.createFilter({          //add filters to find all bins for specific inventory number
            name: "itemid",
            operator: search.Operator.IS,
            values: [itemName]
        });
        quantitySearch.filters.push(itemFilter);
        var lotFilter = search.createFilter({
            name: "inventorynumber",
            join: "inventoryNumberBinOnHand",
            operator: search.Operator.IS,
            values: [parseInt(lotName)]
        });
        quantitySearch.filters.push(lotFilter);
        quantitySearch.run().each(function(result){         //for each search result, try to create inventory status change
            if(result != null && result != ''){
                var quantity = result.getValue({
                    name: quantityType,
                    join: "inventoryNumberBinOnHand"
                });
                if (quantity > 0){
                    var location = result.getValue({
                        name: "location",
                        join: "inventoryNumberBinOnHand"
                    });
                    var bin = result.getValue({
                        name: "binnumber",
                        join: "inventoryNumberBinOnHand"
                    });
                    createInventoryStatusChange(location, oldStatus, item, lot, bin, quantity, newStatus);
                }
            }
            return true;
        });
    }
    function createInventoryStatusChange(location, prevStatus, itemId, lotNum, binNum, quantity, newStatus){
        var parentRecord = record.create({                  //create inventory status change record
            type: record.Type.INVENTORY_STATUS_CHANGE,
            isDynamic: true
        });
        parentRecord.setValue({
            fieldId: 'location',
            value: parseInt(location)
        });
        parentRecord.setValue({
            fieldId: "previousstatus",
            value: parseInt(prevStatus)
        });
        parentRecord.setValue({
            fieldId: "revisedstatus",
            value: parseInt(newStatus)
        });
        parentRecord.selectNewLine({
            sublistId: "inventory"
        });
        parentRecord.setCurrentSublistValue({
            sublistId: "inventory",
            fieldId: "item",
            value: parseInt(itemId)
        });
        parentRecord.setCurrentSublistValue({
            sublistId: "inventory",
            fieldId: "quantity",
            value: parseInt(quantity)
        });

        var subRecordData = createSubrecord(parentRecord, lotNum, binNum, quantity);        //create inventory detail subrecord

        if(subRecordData.added){
            log.error("Saving Record");
            subRecordData.parentRecord.commitLine({       //save record and subrecord if all fields were completed
                sublistId: "inventory"
            });
            subRecordData.parentRecord.save();
        }
        else{
            log.error("Unable to commit subrecord");
            subRecordData.parentRecord.cancelLine({           //delete subrecord if fields not complete
                sublistId:"inventory"
            });
        }
    }
    function createSubrecord(parentRecord, lotNum, binNum, quantity){
        var subRecord = parentRecord.getCurrentSublistSubrecord({       //create inventory detail subrecord
            sublistId: "inventory",
            fieldId: "inventorydetail"
        });
        subRecord.selectNewLine({
            sublistId: "inventoryassignment"
        });
        log.error("Lot", lotNum);
        try{
            subRecord.setCurrentSublistValue({      //try to add lot number
                sublistId: "inventoryassignment",
                fieldId: "issueinventorynumber",
                value: parseInt(lotNum)
            });
        }
        catch(err){
            log.error("Lot Number not an option");      //break if lot number not added
            return {
                "added": false,
                "parentRecord": parentRecord,
                "subRecord": subRecord
            };
        }
        var index = subRecord.getCurrentSublistIndex({
            sublistId: "inventoryassignment"
        });
        try{            //try to add bin number
            subRecord.getSublistField({             //check if bin number field exists
                sublistId: "inventoryassignment",
                fieldId: "binnumber",
                line: index
            });
            try{
                subRecord.setCurrentSublistValue({      //add bin number if it exists
                    sublistId: "inventoryassignment",
                    fieldId: "binnumber",
                    value: parseInt(binNum)
                });
            }
            catch(err){
                log.error("Bin number not an option");      //break if bin number not added
                return {
                    "added": false,
                    "parentRecord": parentRecord,
                    "subRecord": subRecord
                };
            }
        }
        catch(err){
            log.error("Bin number not needed");
        }
        try{
            subRecord.setCurrentSublistValue({              //set quantity if valid
                sublistId: "inventoryassignment",
                fieldId: "quantity",
                value: parseInt(quantity)
            });
            subRecord.commitLine({
                sublistId: "inventoryassignment"
            });
        }
        catch(err){
            log.error("Invalid Quantity");          //break if quantity invalid
            return {
                "added": false,
                "parentRecord": parentRecord,
                "subRecord": subRecord
            };
        }
        return {                    //return with added = true
            "added": true,
            "parentRecord": parentRecord,
            "subRecord": subRecord
        };
    }
    return {
        afterSubmit: afterSubmit
    }
});
