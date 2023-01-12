# NetSuite-Set-Lot-Status-On-Edit
## Project Overview
<img width="949" alt="editStatus" src="https://user-images.githubusercontent.com/94419306/212151556-1f6380d2-5f79-440f-9e2e-a192b22a55ba.png">

### Purpose
This project automatically sets an inventory number's inventory details to Expired/Good when their expiration date is changed using the Inventory Status Change record. It is a User Event script that executes after the changes to the Inventory Number record are saved.

### Features
- Dynamic Fields
- Saved Searches
- Record Creation
### Prerequisites
- SuiteScript/JavaScript
  - Modules: N/search, N/record, N/format
  - SuiteScript Types: User Event Script
  - API Version: 2.x
  - JSDoc Tags
- Saved Searches
## Project Setup
### Saved Searches
Be sure to note the saved search ID.
- **Search for Edit Expired Quantity:**
    - **Function:** finds the quantity available for each bin for the changed inventory number; item and lot number filters are applied to this to find the bin quantity
    - **Search Type:** Item
    - **Criteria:** Inventory Number/Bin on Hand: On Hand is greater than 0
    - **Result Columns:** Name, Inventory Number/Bin on Hand: Inventory Number, Inventory Number/Bin on Hand: Bin Number, Inventory Number/Bin on Hand: Location, Inventory Number/Bin on Hand: Available, Inventory Number/Bin on Hand: On Hand
    - **Sort By:** Name
    - **Filters:** Inventory Detail: Status, Name, Inventory Number/Bin on Hand: Inventory Number, Inventory Number/Bin on Hand: Bin Number, Inventory Number: Expiration Date, Inventory Number/Bin on Hand: Location
    - **Permissions:** Public
### Uploading to NetSuite
- **Adding a SuiteScript to the File Cabinet:** navigate Customization>Scripting>Scripts>New; next to the "Script File" dropdown, press the plus sign to upload a new SuiteScript file; select the NetSuite folder that you want to store the SuiteScript files in; under "Select File," press the "Choose File" button; select the SuiteScript file that you want to upload and press open; save and press the blue "Create Script Record" button; name the file, input a relevant ID, and save
### Adding New Inventory Status
- **Adding Expired Status to Inventory Status List:** navigate List>Supply Chain>Inventory Statuses>New; input the name of the new Inventory Status as "Expired"; uncheck the boxes labeled "Making Inventory Available for Commitment" and "Make Inventory Available for Allocation and Planning"; save the new record by pressing the blue button
## File Descriptions
### edit_expired_lot.js
- **Programming Languages:** JavaScript, SuiteScript 2.0
- **SuiteScript Type:** User Event Script, afterSubmit
- **Description:** sets the status of inventory details of the changed Inventory Number record using an Inventory Status Change record
- **Catering the Code to Your NetSuite:**
    - Changing the Saved Search IDs: whenever there is a search load instance (search.load), change the parameter "id" to the correct search ID
- **Deploying SuiteScript:** go to the SuiteScript file; press the "Deploy Script" button; enter a name and relevant ID; change the status to "Testing"; under "Execute As Role," choose "Administrator" so that the code will get full access to NetSuite and will not create any permissions errors; under "Applies To," select the record type that you want the button to appear on (I used Inventory Number); once the code has been tested, change the status to "Released" and select who can use the button under the "Audience" subtab (selecting "All Roles" will make all users able to use it)

## References
### Helpful Links
- **SuiteScript 2.0:** https://docs.oracle.com/cd/E60665_01/netsuitecs_gs/NSAPI/NSAPI.pdf
- **SuiteScript Modules:** https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/set_1502135122.html
## Extra Tips
- Choose to execute as the administrator role when deploying the SuiteScripts to make sure everyone has full permissions
- Be sure to check the global permission in all of the saved searches
- Go back to the script deployments to check that their status is "Released" and that their audience includes all roles
