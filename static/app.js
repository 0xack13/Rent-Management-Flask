
var tableToExcel = (function () {
        var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        return function (table, name, filename) {
            if (!table.nodeType) table = document.getElementById(table)
            var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }

            document.getElementById("dlink").href = uri + base64(format(template, ctx));
            document.getElementById("dlink").download = filename;
            document.getElementById("dlink").click();

        }
    })()

function formatCurrency(value) {
    return value.toFixed(2) + " ريال سعودي";
}

jQuery(document).ready(function() {
    function renter(data) {
        this.id = ko.observable(data.id);
        this.renterName = ko.observable(data.renterName);
        this.rentAmount = ko.observable(data.rentAmount);
        this.rentAmountDate = ko.observable(data.rentAmountDate);         
        this.edit = function() {
	        console.log(this.id());
	        //...
    	}
    }
 
    function ViewModel() {
        var self = this;

        // create an empty observable array...will fill with data on line 19
        self.rentersArray = ko.observableArray([]); 
        self.rentsByRenterArray = ko.observableArray([]);
        self.distinctRenters = ko.observableArray([]);
        self.editingItem = ko.observable();
        //self.selectionChanged = ko.observable();
        self.grandTotal = ko.computed(function() {
            var total = 0;
            $.each(self.rentsByRenterArray(), function() { total += this.rentAmount() })
            return total;
        }, this);
 

        self.selectionChanged = function(event) {
         //alert("the other selection changed");
         self.listRentsByRenters();
        };
    	
    	self.isItemEditing = function(itemToTest) {
        	return itemToTest == self.editingItem();
    	};
        
        self.editFruit = function (fruit) {
        if (self.editingItem() == null) {           
            // shows the edit fields
            self.editingItem(fruit);
        }
    	};

    	self.removeFruit = function (fruit) {
        if (self.editingItem() == null) {
            self.rentersArray.remove(fruit);

            return $.ajax({
			    url: '/todo/api/v1.0/tasks/' + fruit.id(),
			    contentType: 'application/json',
			    type: 'DELETE',
			    success: function(data) {
				console.log("Successfully deleted the record!");
				return;
			    },
			    error: function() {
				return console.log("Failed");
			    }
			});

        }
    	};

        self.listRentsByRenters = function (fruit) {
            var searchtext = $("#testdrop").val();
            var y = $("#year").val();
            var m = $("#month").val();
            var d = $("#day").val();
            console.log(searchtext);
            return  $.getJSON('/renters/api/listRentsByRentersAPI/' + searchtext + '/' + d + '/' + m + '/' + y, {
            returnformat: 'json'
            }, function(allData) {
                var array = [];
                console.log(allData.renters);
                var mappedData= jQuery.map(allData.renters, function(item) { return new renter(item) });
                self.rentsByRenterArray(mappedData);
                console.log("GetJSON rentsByRenterArray: " + self.rentsByRenterArray() );
                return;
            });
        };

    	self.applyFruit = function (fruit) {       
	        //  hides the edit fields
	        self.editingItem(null);
        	return $.ajax({
			    url: '/todo/api/v1.0/tasks/' + fruit.id(),
			    contentType: 'application/json',
			    type: 'PUT',
			    data: JSON.stringify({
				'renterName': fruit.renterName(),
				'rentAmount': fruit.rentAmount(),
				'rentAmountDate': fruit.rentAmountDate()
			    }),
			    success: function(data) {
				console.log("Successfully updated the record!");
				return;
			    },
			    error: function() {
				return console.log("Failed");
			    }
			});
    	};

    	self.cancelEdit = function (fruit) {       
        //  hides the edit fields
        self.editingItem(null);
        console.log("Cancelled " + fruit.id());
        console.log("Cancelled " + fruit.renterName());
    	};


        // page.php below is a link to the php page that contains your JSON created above
        jQuery.getJSON('/renters/api/listRentersAPI', {
            returnformat: 'json'
            }, function(allData) {
                var array = [];
                console.log(allData.renters);
                $.each(allData.renters, function (value, value2) {
                    array.push(value2.renterName);
                    console.log("This is within: " + value2.renterName);
                });
                console.log(array);
                self.distinctRenters(array);
                self.listRentsByRenters();
            });

        // Working part
        var searchtext = $("#droptext").val();
        var y = $("#year").val();
        var m = $("#month").val();
        var d = $("#day").val();
        console.log(searchtext);
        jQuery.getJSON('/renters/api/listRentsByRentersAPI/' + searchtext + '/' + d + '/' + m + '/' + y, {
            returnformat: 'json'
            }, function(allData) {
                var array = [];
                console.log(allData.renters);
                console.log("rentsByRenterArray: " + array);
                var mappedData= jQuery.map(allData.renters, function(item) { return new renter(item) });
                self.rentsByRenterArray(mappedData);
            });

        // page.php below is a link to the php page that contains your JSON created above
        jQuery.getJSON('/renters/api', {
            returnformat: 'json'
            }, function(allData) {
                var mappedData= jQuery.map(allData.renters, function(item) { return new renter(item) });
                self.rentersArray(mappedData);
            });
        }
 
	ko.applyBindings(new ViewModel());
});

