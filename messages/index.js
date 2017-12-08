// This loads the environment variables from the .env file
//require('dotenv-extended').load();
//final_versionv4.0

var builder = require('botbuilder');
var restify = require('restify');
var path = require('path');
var database = require(path.join(__dirname, "./Database.js"));
var env = require('dotenv');
var Table = require('cli-table');
var phone = require('phone-regex');
var email = require('regex-email');
var ProgressBar = require('progress');
var botbuilder_azure = require('botbuilder-azure');
//var Lowercase = require('lower-case');

env.config();

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

if (useEmulator) {
    //var restify = require('restify');
    //var server = restify.createServer();
    //server.listen(3978, function() {
    //    console.log('test bot endpont at http://localhost:3978/api/messages');
    //});
    var server = restify.createServer();
    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log('%s listening to %s', server.name, server.url);
    });
    
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

// Setup Restify Server
//var server = restify.createServer();
//server.listen(process.env.port || process.env.PORT || 3978, function () {
//    console.log('%s listening to %s', server.name, server.url);
//});

// Create connector and listen for messagesnpm install arraylist
//var connector = new builder.ChatConnector({
  //  appId: process.env.MICROSOFT_APP_ID,
  //  appPassword: process.env.MICROSOFT_APP_PASSWORD
//});

//server.post('/api/messages', connector.listen());
var HelpMessage = '';
var UserNameKey;
var UserWelcomedKey;
// var urls = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8f41d0fb-d7f1-4f6f-87e4-d3ece31ba8c0?subscription-key=3576f9b91fdf4762b5a0dd790e68a1af&verbose=true&timezoneOffset=5.5&q=";
// var emailMessage ="-----Original Message----- From: ORD Dario Hernandez [mailto:dhernandez@worldcourier.com] Sent: Montag, 17. Juli 2017 16:32 To: WERNER, WILLIAM ; SLAVIC, ZEMKA SWISS ; SESTIC, MIRJANA ; MCREDMOND, DANIEL Cc: ORD Operations Subject: MAWB#724-61316824 JOB#4686 XPRESSO SERVICE Please provide us with a booking as per the following information: MAWB: 724-61316824 Pieces: 4 pieces Weight: 158.8 KGS Dims: 3 @ 33x18x19 IN & 1 @ 16x16x16 IN Commodity: RESEARCH SAMPLES / UN1845,DRY ICE,9 – 1 X 15 KGS & 3 X 30 KGS Routing: ORD – ZRH Flights: LX 009 / 17 JULY Service: XPRESSO Screened: YES If you need anything further, please feel free to contact us Dario Hernandez World Courier, an AmerisourceBergen company Operations Agent ORD 3737 N. 25th Avenue Schiller Park, IL, 60176 Tel: 1-630-694-9077 Fax: 1-630-694-9070 www.worldcourier.com _____ World Courier, Inc. Registered office: 1313 Fourth Avenue, New Hyde Park, New York, 11040, USA. This e-mail, including any attachments, may contain confidential and/or privileged information. It is for the sole use of the intended recipient. If you have received it in error, please notify the sender immediately and delete it from your system. Any unauthorised copying, disclosure, distribution, use or retention of this e-mail or the information in it is strictly forbidden. Please note we reserve the right to monitor all e-mail communication for quality assurance, policy compliance and/or security purposes. Play your part in saving the environment - please do not print this e-mail unless absolutely necessary "

// Setup bot with default dialog
var bot = new builder.UniversalBot(connector, [ 
    (session, next) => {
        // is user's name set? 
        var userName = session.userData[UserNameKey];
        if (!userName) {
           return session.beginDialog('greet');
        }
        // has the user been welcomed to the conversation?
        if (!session.privateConversationData[UserWelcomedKey]) {
          //  session.privateConversationData[UserWelcomedKey] = true;
            //session.send('Welcome back to Swiss Cargo AWB/Flight search.', "" , "", HelpMessage);
            return session.beginDialog('greet');
        }
       
        

        else {
            //if(session.message.text.length !=11)
           // {
              //session.beginDialog('GetUserData');
             //}
            // else{
               session.beginDialog('MainMethod');
               
             // }
        }
    }
]);
bot.localePath(path.join(__dirname, './locale'));



bot.dialog('GetUserData', [  
    (session, args) => 
    { 
        var list  =[];
        var list2 =[];
        var list3 =[];   

        var input =  session.userData[UserNameKey];
      
        var Mobcheck  =  phone().test(input);
        var EmailCheck = email.test(input);
        if(Mobcheck){var Mobile = input;}
        else if(EmailCheck){{var Email = input;}}
        //else{builder.Prompts.text(session,'PLease enter valid phone number or Email ID')}
        database.awb.forEach(function(element) {
            if(element.EmailId.toString()== Email || element.Mobile.toString()== Mobile ){
                 list.push(element.key)   
                for(var i=0 ; i<list.length;i++)
                {
                    if(element.key.toString()== list[i]){                        
                        list2.push(element.ShipmentDelivered)
                    }

                }
                            
            }            
        })
         //console.log(list2);
         //console.log( list2.find["Yet to deliver"]);
         var list3_no = list3.length;
         for(var i =0; i<list2.length;i++)
         { 
           if(list2[i] =="Yet to deliver")  
           {
               list3[i] =list[i];
               list3_no++;
           }
         }
        
         list3_no = list3.length;

         if(list.length>0)
         {
          //list[list3.length+1] = 'None of the above';
          list3[list3_no+1]='None of the above';
          builder.Prompts.choice(session, 'Aha! Here are the AWB numbers on your name. Can you please select any one from list?', list3,{ listStyle: builder.ListStyle.button });
          //builder.Prompts.choice(session, 'Not from the list', ['Not from the list'],{ listStyle: builder.ListStyle.button });
        }

        else{            
            builder.Prompts.text(session,'Oh! I could not find an AWB number for the details that you entered. Is it possible to check and please enter the valid AWB number?')// try to add choices
        }
   
      
        
    },function (session, result) {
       
        var notlist = session.message.text;
        var list1 =[2]
        if(notlist =='None of the above' )
        {       
          list1[0]='Track By AWB Number';
          list1[1]= 'Track By Flight Number';
          builder.Prompts.choice(session, 'Can you please select any one option from the list below:', list1,{ listStyle: builder.ListStyle.button }),
          function (session, result) {
            var intent  = session.message.text.split('=');
            if(intent[1]=="Track By AWB Number"){
            builder.Prompts.text(session, 'Oh! If you could not find the number in the above list, I request you to kindly enter AWB/Flight number to search')
           }       
              //LuisAjax(session.message.text,session);          
          }          
        
        }
       else {

             LuisAjax(session.message.text,session);
        }
    }
    
]),
// Greet dialogbu
bot.dialog('greet', new builder.SimpleDialog(function (session, results) {
    var Search  = session.message.text; 
    console.log(session.message.text);
    session.send("Out put of Search " + Search);
    var custUser = Search;
    var name= "";
    var company="";

    var Mobcheck  =  phone().test(custUser);
    var EmailCheck = email.test(custUser);
    session.send("Out put of custUser " + custUser);
    session.send("Out put of regx  Mobcheck " + EmailCheck);
    session.send("Out put of regx  Mobcheck " + Mobcheck);
    console.log(custUser);
        if(Mobcheck || EmailCheck){
    database.awb.forEach(function(element) {
       if(element.EmailId == custUser ||element.Mobile== custUser){            
           name=element.Name;
           company=element.Company;
       }
   })
   session.userData[UserNameKey]=custUser;
}
    /* if(Search =="Exit")
    {
       session.endDialog("Thank you! It was nice speaking to you. Have a nice day");
       
    } */
    if(Search =="Discontinue")
    {
    session.endConversation("Thank you! It was nice speaking to you. Have a nice day...");
    //session.reset('greet');
    }
    else if(Search =="Continue"){
           //builder.Prompts.text(session,"Please enter AWB number");
           
        session.beginDialog("EndMethod");
           
    }

    else if(Search=="Track By AWB Number"){
         session.send("Can you please enter the AWB number?")
       
    }

    else if(Search=="Track By Flight Number"){
       return session.endConversation("Can you please enter the Flight number?(....Work in Progress....)")} 
     
else{
   var intent  = Search.split('=');
   //  var childId = results.childId.split(':');
    if (results && results.response) {

         // var Search  = session.message.text; 
         var intent  = Search.split('=');

   
       // var list1 =[]
          //list1.push('Track By AWB Number');  
         // list1.push('Track By Flight Number');
  
             
                 
        if(session.userData[UserNameKey]!=""|| session.userData[UserNameKey]!= undefined){
            
           session.privateConversationData[UserWelcomedKey] = true;

                 
            var thumbnail = new builder.ThumbnailCard(session);           
        //  thumbnail.title(results.response);
          thumbnail.images([builder.CardImage.create(session, "https://i3ltrackbotdemo.blob.core.windows.net/images/Swiss.PNG")]);
         // thumbnail.images([builder.CardImage.create(session,"C:/Users/Public/Pictures/Sample Pictures/Swiss.PNG")]);
       
        
          var text = 'Welcome '+ name +' from '+company+'.\n I would request you to kindly select the below options for more details'; 
          thumbnail.text(text);
          thumbnail.tap(new builder.CardAction.openUrl(session,"https://www.swissworldcargo.com/about_us/company/our_story"));
          thumbnail.buttons([new builder.CardAction.dialogAction(session," ","Track Shipment","Track Shipment"),new builder.CardAction.openUrl(session,"https://www.swissworldcargo.com/en/web/20184/station-info","Contact US")])
      
          var messagess = new builder.Message(session).attachments([thumbnail]);
           
          session.send(messagess);
          session.send(session.message.text);
         }
           //session.endDialog('Welcome to Swiss Cargo AWB/Flight search.Welcome %s! %s', HelpMessage);
     }
     else if(intent[1]=="Track Shipment"){
        session.beginDialog('GetUserData');       
           //builder.Prompts.choice(session, 'Please select any one from list', list1,{ listStyle: builder.ListStyle.button });     
     }
     else if (!session.privateConversationData[UserWelcomedKey]){
          var thumbnail = new builder.ThumbnailCard(session);
          thumbnail.title("Welcome to Swiss World Cargo");

          thumbnail.images([builder.CardImage.create(session,'https://i3ltrackbotdemo.blob.core.windows.net/images/image-humanoid.PNG')]);
          //thumbnail.images([builder.CardImage.create(session,"C:/Users/Public/Pictures/Sample Pictures/girl-icon.PNG")]);          
         // thumbnail.images([builder.CardImage.create(session,"C:/Users/Public/Pictures/Sample Pictures/Swiss.PNG")]);
          var text = '\n\rHey, I am Alan from Swiss World Cargo. \r\n Email-id: alan@swisscargo.com.\r\nCan you please provide your email address or phone number?';
          thumbnail.text(text);
          thumbnail.tap(new builder.CardAction.openUrl(session,"https://www.swissworldcargo.com/about_us/company/our_story"));
          //thumbnail.buttons([new builder.CardAction.dialogAction(session," ","",""),new builder.CardAction.openUrl(session,"https://www.swissworldcargo.com/en/web/20184/station-info","Contact US")])      
          var messagess = new builder.Message(session).attachments([thumbnail]);
         // session.send(messagess);
         builder.Prompts.text(session, messagess);
    //builder.Prompts.text(session, 'Please enter your email address or phone number?', {retryPrompt : "Please enter your Name or Mobile Number..."});
   }

   else{
    LuisAjax(session.message.text,session);
   }
}

  }));

bot.dialog('MainMethod', [  
    (session, args) => 
    { 
        LuisAjax(session.message.text,session);
    }
]);

bot.dialog('EndMethod', [  
    (session, args) => 
    { 
     if (session.message.text.length >= 11){           
        LuisAjax(session.message.text,session);
        //session.reset();
       }
      else{
           // session.cancelDialog();
            session.send("Please enter a valid awb number ?");
      }
    
    }
]);
// AWB Search
bot.dialog('Note.Search', [  
    (session, args) => 
    {       
        session.sendTyping();
        var AWBNumber = args==undefined ? session.message.text.replace(/\s/g, '') : args;
        var match = false;
        var userName = session.userData[UserNameKey];      
        var tableHTML="";
        var list =[2];
        //list.push("Exit");
        list[0] = ("Discontinue");
        list[1] = ("Continue");
        if(AWBNumber.length!=11)
            session.send('Invalid AWB Number format. Please enter valid AWB number in format 1XX12XXXX78');
        else{
            database.awb.forEach(function(element) {
                if(element.key.toString()== AWBNumber){
                    //session.endDialogWithResult({response :element.value});                
                    // var tableHTML = '<table style="padding:10px;border:1px solid black;"><tr ><th style="background-color:#c6c6c6;width:100px;hight:200px">Shipment Ready For Carriage </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.shipmentready +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Departed</th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.shipmentdeparted +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Flight Departure </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.flightdeparture +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Flight Arrival</th><td style="background-color:#008000";width:4px></td > <td align="center">'+element.FlightArrival +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Arrived </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.ShipmentArrived +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Ready For Pick-Up  </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.ShipmentReadyForPUp +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Delivered </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.ShipmentDelivered +'</td><td align="center">'+element.Itemcount +'</td></tr></table>';
                //     if(ShipmentDelivered=="Yet to deliver")
                //    {
                //    tableHTML = '<table style="padding:10px;border:1px solid black;"><tr><td>AWB Number :'+element.key+'<td><td><img src='+"C:/Users/19242/Pictures/abb.PNG"+'></img></td></tr></table><table style="padding:10px;border:1px solid black;"><tr ><th style="background-color:#c6c6c6;width:100px;hight:200px">Shipment Ready For Carriage </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.shipmentready +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Departed</th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.shipmentdeparted +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Flight Departure </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.flightdeparture +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6;width:100px;hight:200px">&nbsp</th> <td align="center"></td><td align="center"></td></tr><tr ><th style="background-color:#c6c6c6;width:100px;hight:200px"> &nbsp</th></td> <td align="center"></td><td align="center"></td></tr><tr ><th style="background-color:#c6c6c6;width:100px;hight:200px">&nbsp  </th> <td align="center"></td><td align="center"></td></tr><tr ><th style="background-color:#c6c6c6;width:100px;hight:200px"></th><td style=width:4px"></td > <td align="center">'+element.ShipmentDelivered +'</td><td align="center">'+element.Itemcount +'</td></tr></table>';
                      //tableHTML = '<table style="padding:10px;border:1px solid black;"><tr><td>AWB Number :'+element.key+'<td><td><img src='+"https://i3ltrackbotdemo.blob.core.windows.net/images/abb.PNG"+'></img></td></tr></table><table style="padding:10px;border:1px solid black;"><tr ><td style="background-color:#c6c6c6;width:100px;hight:200px">Shipment Ready For Carriage </td><td style="background-color:#008000;width:3px;border-left: 1px solid black;border-right: 1px solid black;"></td > <td align="center">'+element.shipmentready +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><td style="background-color:#c6c6c6">Shipment Departed</td><td style="background-color:#008000;width:3pxp;border-left: 1px solid black;border-right: 1px solid black;"></td > <td align="center">'+element.shipmentdeparted +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><td style="background-color:#c6c6c6">Flight Departure </td><td style="background-color:#008000;width:3px;border-left: 1px solid black;border-right: 1px solid black;"></td > <td align="center">'+element.flightdeparture +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:;width:100px;hight:200px">&nbsp</th> <td align="center" style="width:3px;border-left: 1px solid black;border-right: 1px solid black;"></td><td align="center"></td></tr><tr ><th style="background-color:;width:100px;hight:200px"> &nbsp</th></td> <td align="center></td><td align="center style="width:3px;border-left: 1px solid black;border-right: 1px solid black;"></td></tr><tr ><th style="background-color:;width:100px;hight:200px">&nbsp  </th> <td align="center"; style="width:3px;border-left: 1px solid black;border-right: 1px solid black;"></td><td align="center";></td></tr><tr ><th style="background-color:;width:100px;hight:200px"></th><td style="width:3px;border-left: 1px solid black;border-right:  1px solid black;"></td > <td align="center">'+element.ShipmentDelivered +'</td><td align="center">'+element.Itemcount +'</td></tr></table>';
                      session.send("Shipment Ready For Carriage\t: " + element.shipmentready + "\t" +element.Itemcount+"<br />" +'Shipment Departed \t\t: '+element.shipmentdeparted +'\t' +element.Itemcount + "<br/>"+"Flight Departure :\t\t "+ element.flightdeparture +'\t' +element.Itemcount + "<br/>"+"Flight Arrival \t\t\t: "+ element.FlightArrival +'\t' +element.Itemcount + "<br/>"+"Shipment Arrived \t\t:"+ element.ShipmentArrived +'\t' +element.Itemcount +"<br/>"+"Shipment Ready For Pick-Up \t: "+element.ShipmentReadyForPUp +'\t' +element.Itemcount+"<br/>" +"Shipment Delivered \t\t: "+ element.ShipmentDelivered +'\t' +element.Itemcount);                
                      //    }
                // else{
                //      tableHTML = '<table style="padding:10px;border:1px solid black;"><tr ><th style="background-color:#c6c6c6;width:100px;hight:200px">Shipment Ready For Carriage </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.shipmentready +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Departed</th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.shipmentdeparted +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Flight Departure </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.flightdeparture +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Flight Arrival</th><td style="background-color:#008000";width:4px></td > <td align="center">'+element.FlightArrival +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Arrived </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.ShipmentArrived +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Ready For Pick-Up  </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.ShipmentReadyForPUp +'</td><td align="center">'+element.Itemcount +'</td></tr><tr ><th style="background-color:#c6c6c6">Shipment Delivered </th><td style="background-color:#008000;width:4px"></td > <td align="center">'+element.ShipmentDelivered +'</td><td align="center">'+element.Itemcount +'</td></tr></table>';
                //     }
                        
                     //var message = {
                     //   type: 'message',
                     //   textFormat: 'xml', 
                     //   text: tableHTML
                     //};   

                    // var tableHTML = '<table style="padding:10px;border:1px solid black;"><tr style="background-color:#c6c6c6"><th>Countries</th><th>Capitals</th><th>Population</th><th>Language</th></tr><tr><td>USA</td><td>Washington D.C.</td><td>309 million</td><td>English</td></tr><tr><td>Sweden</td><td>Stockholm</td><td>9 million</td><td>Swedish</td></tr></table>';
                    // var message = {
                    //     type: 'message',
                    //     textFormat: 'xml', 
                    //     text: tableHTML
                    // };
                 //   session.cancelDialog();
                    //session.userData[UserNameKey] ="";
                    //session.send(message);

                   // session.send('Thank You! I hope I could help you in tracking your shipment. For all other information, request you to kindly contact directly over the phone.');
                   builder.Prompts.choice(session, 'Please select any one from list ?', list,{ listStyle: builder.ListStyle.button }),
                 ///  function(session,result){
                  //  var check = session.message.text();
                   // if(check =="contu"){
                       ///// session.beginDialog("")
   // }
                // }
                  //console.log(table);  
                  // session.cancelDialog();
                  
                  

                    match = true;
                } 
                
            }, this);
        
              if(!match) 
            session.send('AWB not found. Please enter valid AWB number');
        }
    }
]).triggerAction({ matches: 'Note.Search' });

// Flight Search
bot.dialog('Note.Flight', [  
    (session, args) => 
    {       
        session.sendTyping();
        var FlightNumber = args==undefined ? session.message.text.replace(/\s/g, '') : args;

        var match = false;
        var userName = session.userData[UserNameKey];
        if(FlightNumber.length>6)
            session.send('Invalid Flight Number format. Please enter valid Flight number upto 4 digit');
        else{
            database.flight.forEach(function(element) {
                if(element.key.toString()== FlightNumber){
                    //session.endDialogWithResult({response :element.value});
                    session.endDialog(element.value);
                    session.send('Please enter AWB/Flight number to search');
                    match = true;
                } 
            }, this);
            if(!match) 
            session.send('Flight not found. Please enter valid Flight number');
        }
        
    }
]).triggerAction({ matches: 'Note.Flight' });

function LuisAjax(statement,session){
    var HttpsProxyAgent = require('https-proxy-agent');  
    var request = require('request');  
    var proxy = 'http://10.6.13.87:8080';  
    var agent = new HttpsProxyAgent(proxy);  
    if(statement.length==11)
    statement = "Please find the my awb " + statement;
    else
    statement=statement;
    request({  
        uri: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8f41d0fb-d7f1-4f6f-87e4-d3ece31ba8c0',
        method: "POST",
        body : "'" + statement.toString() + "'",
        parameters: {
            'verbose': true,
            'timezoneOffset': 5.5,
            'subscription-key': '3576f9b91fdf4762b5a0dd790e68a1af',
        },
        headers: {
            'Ocp-Apim-Subscription-Key' : '3576f9b91fdf4762b5a0dd790e68a1af',
        },
        //agent: agent,
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, body) {    
        var luisresult = JSON.parse(body);
        if(luisresult.topScoringIntent.intent=='Note.Search'){
            if(   luisresult.entities[0] != undefined){
                var args = luisresult.entities[0].entity.replace(/\s/g, '');
                session.beginDialog('Note.Search',args);
                }
                else{session.send("Please enter Valid AWB/Flight number to search");}
            
        }
        else if(luisresult.topScoringIntent.intent=='Note.Flight'){

            if(   luisresult.entities[0] != undefined){
                var args = luisresult.entities[0].entity.replace(/\s/g, '');
                session.beginDialog('Note.Flight',args);
            }
            else{session.send("Please enter Valid AWB/Flight number to search");}
            
        }
        else if(luisresult.topScoringIntent.intent=='None'){

            var Search  = session.message.text; 
            var intent  = Search.split('=');
    
            if(intent[1]=="Track AWB")
            {
               // session.userData[UserNameKey] = "Test";
               return session.endDialog('Please enter Swiss Cargo AWB Number /Email ID to track ?');
            }
    
            else if(intent[1]=="Track Flight")
            {
               // session.userData[UserNameKey] = "Test";
                return session.endDialog('Please enter Flight number to track ?');
            }
            else{
            session.send("Please enter Valid AWB/Flight number to search");
            var thumbnail = new builder.ThumbnailCard(session);
            thumbnail.title("Swiss Cargo 'Contact US'");
            thumbnail.images([builder.CardImage.create(session,"https://i3ltrackbotdemo.blob.core.windows.net/images/Swiss.PNG")]);
            var text = '\n Please click here for any other queries';
            thumbnail.text(text);
            thumbnail.tap(new builder.CardAction.openUrl(session,"https://www.swissworldcargo.com/en/web/20184/station-info"));
            var messagess = new builder.Message(session).attachments([thumbnail]);
            session.send(messagess);
        }
        }
    }); 
}





// (session, args, next) => 
// {   
//     var AWBNumber = session.message.text.match(/\d[\d\.]*/g);
//     if (AWBNumber == null)
//         session.send('Please enter AWB number');
//     else{
//         //const query = builder.EntityRecognizer.findEntity(session.message.text, 'awb');
//         session.privateConversationData["textsearch"] = session.message.text;
//         builder.Prompts.choice(
//             session,"Please confirm AWB number is correct?",
//             database.availableAWB,
//             { listStyle: builder.ListStyle.button }
//         )
//     }   
// },

// var regexp = require('node-regexp');
// var re = regexp()
// .either('airway','awb','bill','look for','find','search','help')
// .ignoreCase()
// .toRegExp()
// var boolval = re.test(statement);
//AWBNumber = statement.match(/\d[\d\.]*/g);


// reset bot dialog
// bot.dialog('reset', function (session) {
//     // reset data
//     delete session.userData[UserNameKey];
//     delete session.conversationData[CityKey];
//     delete session.privateConversationData[CityKey];
//     delete session.privateConversationData[UserWelcomedKey];
//     session.endDialog('Ups... I\'m suffering from a memory loss...');
// }).triggerAction({ matches: /^reset/i });    



// LUIS
//Enable Conversation Data persistence
// var globalTunnel = require('global-tunnel');

// globalTunnel.initialize({
//     tunnel: 'both',
//     host: '10.6.13.87',
//     port: 8080
//   }); 
// var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
// recognizer.onEnabled((context,callback)=>{
//     if(context.dialogStack().length>0)
//         callback(null,false);
//     else
//         callback(null,true);
// });
// bot.recognizer(recognizer);
// globalTunnel.end(); 
//Main Method
