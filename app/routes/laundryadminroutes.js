module.exports=function(app){
let ladmin=require('../controllers/laundryadminControllers');
app.post('/registerAdmin',ladmin.registerAdmin);
app.post('/loginlaundryAdmin',ladmin.loginlaundryAdmin);
app.post('/getAdmindashboarddata',ladmin.getAdmindashboarddata);
app.post('/addlaundrytoAdmin',ladmin.addlaundrytoAdmin);
app.post('/getAdminLaundryList',ladmin.getAdminLaundryList);
app.post('/getOrderdetails',ladmin.getOrderdetails);
app.post('/getTodayAdminLaundryList',ladmin.getTodayAdminLaundryList);
app.post('/getTodayOrderdetails',ladmin.getTodayOrderdetails);

/*    app.post('/getAllLaundryList',ladmin.getAllLaundryList);
    app.post('/getAllbookingList',ladmin.getAllbookingList);
    app.post('/userRegisteredInOneYear',ladmin.userRegisteredInOneYear);
    app.get('/revenueGenerated',ladmin.revenueGenerated);
    app.get('/totalEarningAccordingToLaundry',ladmin.totalEarningAccordingToLaundry);
    app.get('/trackStatusOfOrder',ladmin.trackStatusOfOrder);
    app.get('/yearlyRevenueData',ladmin.yearlyRevenueData);
    app.get('/yearlyAddedUserRevenue',ladmin.yearlyAddedUserRevenue);
    app.get('/serviceItemListingToAdmin',ladmin.serviceItemListingToAdmin);
    app.get('/serviceCategoryListingToAdmin',ladmin.serviceCategoryListingToAdmin);
    
    // app.post('exportPdfOfAllUser',admin.exportPdfOfAllUser);
    app.post('/getLaundryServices',ladmin.getLaundryServices);
    app.post('/getLaundrySerivceItems',ladmin.getLaundrySerivceItems);
   
    app.post('/forgotPassword', ladmin.forgotPassword);
    app.post('/resetPassword',ladmin.resetPassword);
  */ 
}
