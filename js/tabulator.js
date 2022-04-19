// https://jsperf.com/array-extending-push-vs-concat/5
Array.prototype.extend_forEach = function (array) {
  array.forEach(function (x) {
    this.push(x);
  }, this);
};

function emptyObject(obj) {
  for (var kj in obj) {
    if (obj.hasOwnProperty(kj)) delete obj[kj];
  }
}

function nav_go(el) {
  $(".container").hide();
  $(el).show();
}

var reportdata = []; //main data

var Folders = {};
var Departments = {};
var Operators = {};
var Websites = {};
var ChatWindows = {};
var StaticButtons = {};
var FloatingButtons = {};
var Invitations = {};
var Categories = {};
var Statuses = {};
var CustomFields1 = {};
var CustomFields2 = {};
var ChatType = {
  0: "The chat was initiated by clicking a chat button",
  2: "The chat was initiated by an agent inviting the customer",
  3: "The chat was initiated by clicking a chat button and unavailable",
  4: "The chat was the result of an auto-invitation",
  5: "The chat was initiated by clicking a chat button and blocked",
  6: "The chat was recovered after being unavailable",
  8: "The chat was initiated via the chat API"
};
var PersonType = {
  0: "Agent",
  1: "Customer",
  4: "System",
  5: "Rescue system",
  7: "Agent translated",
  8: "Customer translated"
};
var PageType = {
  0: "The last page type where the chat window is closed",
  1: "The main chat page",
  5: "The post-chat survey form",
  6: "The pre-chat survey form",
  7: "The unavailable email form",
  9: "The browser unsupported page",
  10: "The post-chat survey submitted notice page",
  11: "The unavailable email submitted notice page",
  12: "The no operators page shown when there\'s no unavailable email form",
  14: "The chat not validated page shown when validation fails"
};
var ChatStatusType = {
  0: "None",
  1: "Last page was the pre-chat form",
  2: "Last page was the chat page",
  3: "The pre-chat form was closed",
  4: "The chat was ended",
  5: "Last page was the post-chat form",
  6: "The post-chat form was submitted",
  7: "The chat was unavailable",
  8: "An unavailable email was sent",
  9: "The chat ended before it was answered",
  10: "The chat was blocked",
  11: "The chat was unavailable because of the ACD queue size",
  12: "The chat was unavailable due to agent hours",
  13: "The chat was blocked, and an unavailable email was sent",
  14: "The chat was unavailable because of the ACD queue size, and an unavailable email was sent",
  15: "The chat was unavailable due to agent hours, and an unavailable email was sent",
  18: "The chat was not validated and so was blocked"
};
var EndedReason = {
  0:	"Unknown",
  1:	"Agent ended",
  2:	"Customer ended",
  3:	"Disconnected (or customer closed the window in such a way that we did not get notified)"
};

var chatindex = 0;

$(function () {

  var last_request = "";

  //navigation
  $('.menu-link').bigSlide();
  $(".menu-link").click(function(){
    setTimeout(function(){
      $('.menu-link').bigSlide();
    },2500);
  });
  $("#nav_env").click(function () {
    nav_go("#env");
  });
  $("#nav_api").click(function () {
    nav_go("#API");
  });
  $("#nav_ini").click(function () {
    nav_go("#ini");
  });

  //trigger download of data.csv file
  $("#downloadcsv").click(function () {
    table.download("csv", last_request + ".csv");
  });
  //trigger download of data.xlsx file
  $("#downloadxlsx").click(function () {
    table.download("xlsx", last_request + ".xlsx");
  });

  //submit form, this will reset previous reportdata
  $('#go').click(function () {
    //reset table
    waitrequests = 0;
    reportdata.length = 0;
    table.clearData(); //
    last_request = "getInactiveChats"; 
    $("#loading").show();
    if (last_request == "getInactiveChats" && $("#allfolders").is(":checked")) {
      for (var f in Folders) {
        if (Folders.hasOwnProperty(f)) {
          APIRequest($('#region').val(), $('#accountId').val(), $('#apiKeyId').val(), $('#apiKey').val(), last_request, $('#daterange').val(), f, "");
          //region, accountId, apiKeyId, apiKey, requestType, daterange, folder, parameters
        }
      }
    } else APIRequest($('#region').val(), $('#accountId').val(), $('#apiKeyId').val(), $('#apiKey').val(), last_request, $('#daterange').val(), $('#folder').val(), $('#required_parameters').val());
  });

  Noty.setMaxVisible(20);

  var table = new Tabulator("#tabulator", {
    // height: "calc(100% - 17em)",
    pagination: "local",
    paginationSize: 32,
    paginationButtonCount: 32
    // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    //data: json.Data, //assign data to table
    //layout: "fitData", //fit columns to width of table 
    //layoutColumnsOnNewData:true,
    //columns: col_array,
    /*rowClick: function (e, row) { //trigger an alert message when the row is clicked
      alert("Row " + row.getData().id + " Clicked!!!!");
    },*/
  });
 
  //dynamic changes to input fields

  $("#allfolders").change(function () {
    $("#folder").parent().toggle(!$("#allfolders").is(":checked"));
  }).change();


  //set date range initially to just one day

  $("#daterange").val("FromDate=" + moment().startOf('day').toISOString() + "&ToDate=" + moment().endOf('day').toISOString());

  //date range picker

  $("#date_picker").dateRangePicker({
    startOfWeek: 'monday',
    separator: ' ~ ',
    format: 'DD.MM.YYYY HH:mm',
    autoClose: true,
    time: {
      enabled: true
    },
    defaultTime: moment().startOf('day'),
    defaultEndTime: moment().endOf('day')
  }).bind('datepicker-change', function (event, obj) {
    $("#daterange").val(
      "FromDate=" + obj.date1.toISOString() + "&ToDate=" + obj.date2.toISOString()
      //2014-01-01T00:00:00Z
    );
  });

  $("#daterange").parent().show();
  $("#required_parameters").parent().hide();
  $("#allfolders").parent().show();
  $("#date_picker").parent().show();
  $("#folder").parent().toggle(!$("#allfolders").is(":checked"));

  function testconf() {
    var conf = Cookies.getJSON("apiconf") || {};
    $('#region').val(conf.r);
    $('#accountId').val(conf.a);
    $('#apiKeyId').val(conf.i);
    $('#apiKey').val(conf.k);
    if (conf.a && conf.i && conf.k) {
      new Noty({
        layout: "center",
        timeout: 3000,
        text: 'Environment loaded correctly from cookie',
        type: "success"
      }).show();

      loadAPI("getFolders", "", Folders, "FolderID");
      loadAPI("getDepartments", "", Departments, "DepartmentID");
      loadAPI("getOperators", "", Operators, "LoginID");
      loadAPI("getSetupItems", "FolderType=14", ChatWindows, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=19", Websites, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=12", StaticButtons, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=29", Invitations, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=80", FloatingButtons, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=20", Categories, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=21", Statuses, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=32", CustomFields1, "SetupItemID");
      loadAPI("getSetupItems", "FolderType=33", CustomFields2, "SetupItemID");
    } else {
      new Noty({
        layout: "center",
        timeout: 5000,
        text: 'Environment not set correctly, please set environment using the Environment Setup page under the upper-left menu',
        type: "error"
      }).show();
    }
  }
  testconf(); //at load

  $("#save").click(function () {
    var region = $('#region').val();
    var accountId = $('#accountId').val();
    var apiKeyId = $('#apiKeyId').val();
    var apiKey = $('#apiKey').val();
    new Noty({
      layout: "center",
      timeout: 1000,
      text: 'attempting to save configuration in cookie',
      type: "info"
    }).show();
    Cookies.set("apiconf", {
      r: region,
      a: accountId,
      i: apiKeyId,
      k: apiKey
    }, {
      expires: 1000
    });
    testconf();
  });

  function loadAPI(method, params, obj, key1) {
    // this function calls an API with given method, then creates a global object specified by the variable obj that maps the key1 (typically an id) to a Name. In this case we are mapping an id to name (id)
    var region = $('#region').val();
    var accountId = $('#accountId').val();
    var apiKeyId = $('#apiKeyId').val();
    var apiKey = $('#apiKey').val();
    var auth = accountId + ':' + apiKeyId + ':' + (new Date()).getTime();
    var authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);
    var location = "https://api" + region + ".boldchat.com/aid/" + accountId + "/data/rest/json/v2/" + method + "?" + params + "&auth=" + authHash;
    new Noty({
      layout: "center",
      timeout: 3000,
      text: "...performing " + method + " API call",
      type: "info"
    }).show();
    $.ajax({
      type: 'GET',
      url: location,
      async: false,
      contentType: "application/json",
      dataType: 'jsonp',
      success: function (json) {
        if (json.Status == "success") {
          emptyObject(obj); //empty it at the beginning (bugfix 20/10/2019)
          if (typeof json.Data !== 'undefined') {
            if (json.Data.constructor !== Array) {
              json.Data = jQuery.makeArray(json.Data);
            }
            var dl = json.Data.length;
            for (var i = 0; i < dl; i++) {
              var id = json.Data[i][key1];
              obj[id] = json.Data[i].Name + " (" + id + ")";
            }
            //console.log(obj);
            if (obj == Folders) {
              $("#folder").html('<option value="" selected>Please select, or tick "All folders" </option>');
              for (var f in Folders) {
                if (Folders.hasOwnProperty(f)) {
                  $('#folder').append($('<option>', {
                    value: f,
                    text: Folders[f]
                  }));
                }
              }
            }
          }
        } else {
          new Noty({
            layout: "center",
            timeout: 5000,
            text: "Something is wrong in the environment, please set the correct environment by using the 'Environment' button - ERROR: " + json.Message,
            type: "error"
          }).show();
        }
      }
    });
  }

  function APIRequest(region, accountId, apiKeyId, apiKey, requestType, daterange, folder, parameters) {
    waitrequests++;
    var _auth = accountId + ':' + apiKeyId + ':' + (new Date()).getTime();
    var url = "https://api" + region + ".boldchat.com/aid/" + accountId + "/data/rest/json/v2/" + requestType + "?auth=" + _auth + ':' + CryptoJS.SHA512(_auth + apiKey).toString(CryptoJS.enc.Hex) + (folder ? "&FolderID=" + folder : "") + (parameters ? "&" + parameters : "") + "&" + daterange;
    $.ajax({
      type: 'GET',
      url: url,
      async: false,
      contentType: "application/json",
      dataType: 'jsonp',
      success: function (json) {
        if (json.Data) {
          if (json.Data.constructor !== Array) {
            json.Data = jQuery.makeArray(json.Data);
          }
          reportdata.extend_forEach(json.Data);
          var next2 = json.NextPage;
          var nextdates = "";
          if (typeof next2 !== 'undefined') {
            nextdates = "NextPage=" + next2;
          }
          if (json.Truncated) APIRequest(region, accountId, apiKeyId, apiKey, requestType, nextdates, folder, parameters);
        } else {
          new Noty({
            layout: "center",
            timeout: 10000,
            text: "ERROR: " + json.Message,
            type: "error"
          }).show();
          $("#loading").hide();
        }
        waitrequests--;
        if (waitrequests == 0) processTable();
      }
    });
  }

  function processTable() {
    //rendering table, all data retrieved or autonext was not checked
    // first process: nested objects
    new Noty({
      layout: "center",
      timeout: 1000,
      text: 'Got all data, now processing nested objects',
      type: "success"
    }).show();

    var record = reportdata[0] || {};
    var rl = reportdata.length;
    new Noty({
      layout: "center",
      timeout: 3000,
      text: "Query returned " + rl + " lines",
      type: "success"
    }).show();
    if ((rl > 0) && record.hasOwnProperty("Started")) {
      reportdata = reportdata.filter(
        function (s) {
          return (!!s.Started);
        }
      );
    }
    record = reportdata[0] || {}; //re-set the first record after filtering
    rl = reportdata.length; //recount!
    new Noty({
      layout: "center",
      timeout: 3000,
      text: "Report displays " + rl + " lines after filter",
      type: "success"
    }).show();
    for (var i = 0; i < rl; i++) {
      var obj = reportdata[i]; //single row
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          var nested = obj[k];
          if (typeof nested === 'object') {
            for (var kk in nested) {
              if (nested.hasOwnProperty(kk)) {
                reportdata[0][kk] = ""; //adding new field to table header
                reportdata[i][kk] = nested[kk]; //adding the value!        
              }
            }
            reportdata[i][k] = ""; //cleaning up original object
          }
        }
      }
    }
    new Noty({
      layout: "center",
      timeout: 1000,
      text: 'Finished processing nested objects',
      type: "success"
    }).show();

    /// second process, replacing IDs
    new Noty({
      layout: "center",
      timeout: 1000,
      text: 'Replacing Ids',
      type: "info"
    }).show();
    /*the tecnique to navigate the object is different in this case.
    we are going to check every header and if it contain a field that can be replaced, we replace the whole column it with the global objects
    */

    replacedata(reportdata);

    new Noty({
      layout: "center",
      timeout: 1000,
      text: 'Finished processing Id to names',
      type: "success"
    }).show();

    var col_array = [];

    if (rl > 0) {
      for (var key in record) {
        if (record.hasOwnProperty(key)) {
          col_array.push({
            title: key,
            field: key
          });
        }
      }
      table.setData(reportdata).then(function () {
        //run code after table has been successfuly updated        
        new Noty({
          layout: "center",
          timeout: 1000,
          text: 'Finished rendering table',
          type: "success"
        }).show();
      });
      table.setColumns(col_array);            
    }
    $("#loading").hide();
  }

  // function to scan the results and replace items

  function replacedata(arr) {
    var record = arr[0];
    var rl = arr.length;
    for (var kkk in record) {
      switch (kkk) {
        case "FolderID":
          for (i = 0; i < rl; i++) {
            arr[i].FolderID = Folders[arr[i].FolderID];
          }
          break;
        case "ParentFolderID":
          for (i = 0; i < rl; i++) {
            arr[i].ParentFolderID = Folders[arr[i].ParentFolderID];
          }
          break;
        case "PersonID":
          for (i = 0; i < rl; i++) {
            arr[i].PersonID = Operators[arr[i].PersonID];
          }
          break;
        case "OperatorID":
          for (i = 0; i < rl; i++) {
            arr[i].OperatorID = Operators[arr[i].OperatorID];
          }
          break;
        case "LastAssignedByOperatorID":
          for (i = 0; i < rl; i++) {
            arr[i].LastAssignedByOperatorID = Operators[arr[i].LastAssignedByOperatorID];
          }
          break;
        case "EndedBy":
          for (i = 0; i < rl; i++) {
            arr[i].EndedBy = Operators[arr[i].EndedBy];
          }
          break;
        case "DepartmentID":
          for (i = 0; i < rl; i++) {
            arr[i].DepartmentID = Departments[arr[i].DepartmentID];
          }
          break;
        case "InitialDepartmentID":
          for (i = 0; i < rl; i++) {
            arr[i].InitialDepartmentID = Departments[arr[i].InitialDepartmentID];
          }
          break;
        case "WebsiteDefID":
          for (i = 0; i < rl; i++) {
            arr[i].WebsiteDefID = Websites[arr[i].WebsiteDefID];
          }
          break;
        case "ChatWindowDefID":
          for (i = 0; i < rl; i++) {
            arr[i].ChatWindowDefID = ChatWindows[arr[i].ChatWindowDefID];
          }
          break;
        case "ChatButtonDefID":
          for (i = 0; i < rl; i++) {
            arr[i].ChatButtonDefID = StaticButtons[arr[i].ChatButtonDefIDChatButtonDefID] || FloatingButtons[arr[i].ChatButtonDefID];
          }
          break;
          case "UserCategoryID":
          for (i = 0; i < rl; i++) {
            arr[i].UserCategoryID = Categories[arr[i].UserCategoryID];
          }
          break;
          case "UserStatusID":
          for (i = 0; i < rl; i++) {
            arr[i].UserStatusID = Statuses[arr[i].UserStatusID];
          }
          break;
          case "CustomField1ID":
          for (i = 0; i < rl; i++) {
            arr[i].CustomField1ID = CustomFields1[arr[i].CustomField1ID];
          }
          break;
          case "CustomField2ID":
          for (i = 0; i < rl; i++) {
            arr[i].CustomField2ID = CustomFields2[arr[i].CustomField2ID];
          }
          break; 
        case "ChatType":
          for (i = 0; i < rl; i++) {
            arr[i].ChatType += " - " + ChatType[arr[i].ChatType];
          }
          break;
        case "LastMessagePersonType":
          for (i = 0; i < rl; i++) {
            arr[i].LastMessagePersonType += " - " + PersonType[arr[i].LastMessagePersonType];
          }
          break;
        case "PageType":
          for (i = 0; i < rl; i++) {
            arr[i].PageType += " - " + PageType[arr[i].PageType];
          }
          break;
        case "ChatStatusType":
          for (i = 0; i < rl; i++) {
            arr[i].ChatStatusType += " - " + ChatStatusType[arr[i].ChatStatusType];
          }
          break;
          case "EndedReasonType":
          for (i = 0; i < rl; i++) {
            arr[i].EndedReasonType += " - " + EndedReason[arr[i].EndedReasonType];
          }
          break;
      }
    }
  }
});