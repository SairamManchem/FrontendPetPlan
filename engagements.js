var table = new Tabulator("#tabulator", {
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 30,
    paginationSizeSelector: [5, 10, 15, 20, 25, 30],
    movableColumns: true,
    paginationCounter: "rows",
    placeholder: "No Data Set",
    columns: [
        { title: "Engagement Id", field: "id" },
        { title: "TouchPoint", field: "touchpoint" },
        {
            title: "StartDateTime",
            field: "startDateTime",
            // formatter: function(cell, formatterParams) {
            //     var value = cell.getValue();
            //     return value.split('T')[0];
            // },
            // visible: true,
            // download: true,
            // titleDownload: "Date&time Range"
        },
        {
            title: "EndDateTime",
            field: "endDateTime",
            // formatter: function(cell, formatterParams) {
            //     var value = cell.getValue();
            //     return value.split('T')[1];
            // },
            // visible: true,
            // download: false

        },
        { title: "Channelled count", field: "channeledCount", hozAlign: "right", sorter: "number" },
        { title: "Channelled to bold", field: "channeledToBoldCount" },
        { title: "Channelled to form", field: "channeledToFormCount", hozAlign: "center" },
        { title: "Negative feedback count", field: "negativeFeedbackCount" },
        { title: "Positive feedback count", field: "positiveFeedbackCount" }
    ],
});
document.getElementById("interactions-report").addEventListener("click", function() {
    document.location.href = "index.html";
});

document.getElementById("Main-page").addEventListener("click", function() {
    document.location.href = "main.html";
});

//Define variables for input elements
var fieldEl = document.getElementById("filter-field");
var typeEl = document.getElementById("filter-type");
var valueEl = document.getElementById("filter-value");



//Trigger setFilter function with correct parameters
function updateFilter() {
    var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
    var typeVal = typeEl.options[typeEl.selectedIndex].value;
    var filter = filterVal == "function" ? customFilter : filterVal;
    if (filterVal == "function") {
        typeEl.disabled = true;
        valueEl.disabled = true;
    } else {
        typeEl.disabled = false;
        valueEl.disabled = false;
    }
    if (filterVal) {
        table.setFilter(filter, typeVal, valueEl.value);
    }
}

//Update filters on value change
document.getElementById("filter-field").addEventListener("change", updateFilter);
document.getElementById("filter-type").addEventListener("change", updateFilter);
document.getElementById("filter-value").addEventListener("keyup", updateFilter);

//Clear filters on "Clear Filters" button click
document.getElementById("filter-clear").addEventListener("click", function() {
    fieldEl.value = "";
    typeEl.value = "=";
    valueEl.value = "";

    table.clearFilter();
});

document.getElementById("go").addEventListener("click", function() {
    var kbValue = document.getElementById("kb").value;
    var fromDate = document.getElementById("fromDate").value;
    var toDate = document.getElementById("toDate").value;
    const options = {
        method: 'POST',
        // url: 'https://petplaninsurancenode.onrender.com/reportPetPlan',
        url: 'https://petplaninsurancenodeserver.onrender.com/reportPetPlan',
        // url: 'http://localhost:3001/reportPetPlanEngagements',
        params: {
            kbValue: kbValue,
            fromDate: fromDate.split('T')[0],
            toDate: toDate.split('T')[0]
        }
    }
    if (kbValue && fromDate && toDate) {
        $("#loading").show();
        axios.request(options, { crossdomain: true }).then(response => {
            table.setData(response.data);
            $("#loading").hide();
        });

    } else {
        alert("One of these fields(kbValue,fromDate and toDate) are not filled,It should be Filled to perform API Request");
    }
});


document.getElementById("logout").addEventListener("click", function() {
    document.location.href = "login.html";
});


document.getElementById("downloadxlsx").addEventListener("click", function() {
    table.download("xlsx", "AllianzPetPlan_statistics.xlsx", { sheetName: "My Data" });
});

$("#daterange").val("FromDate=" + moment().startOf('day').toISOString() + "&ToDate=" + moment().endOf('day').toISOString());

$("#date_picker").dateRangePicker({
    startOfWeek: 'monday',
    separator: ' ~ ',
    format: 'DD.MM.YYYY',
    autoClose: true,
    // time: {
    //     enabled: true
    // },
    // defaultTime: moment().startOf('day'),
    // defaultEndTime: moment().endOf('day')
}).bind('datepicker-change', function(event, obj) {
    console.log('OBJ', obj);
    $("#fromDate").val(
        obj.date1.toISOString().split('T')[0]
    );
    $("#toDate").val(
        obj.date2.toISOString().split('T')[0]
    );
});