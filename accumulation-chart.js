
// <form id="displayMode">
//   <input type='radio' id="showRanked" name="mode" checked>Color ballots by ranking</input>
//   <input type='radio' id="showRounds" name="mode">Color ballots by round accumulated</input>
//   <input type='radio' id="showFirst" name="mode">Color ballots by first choice</input>
// </form>

// var form = document.getElementById("dimensions")
// var form_val;
// for(var i=0; i<form.length; i++){
//     if(form[i].checked){
//         form_val = form[i].id;}}

// d3.selection.prototype.checked = function(value) {
//   return arguments.length < 1
//       ? this.property("checked")
//       : this.property("checked", !!value);
// };

var rowH = 50; // keep constant and just overflow if necessary
var yDiff = 80; // spacing between bars

var colorm = document.getElementsByName("colorMode");
var selectedOption = d3.select("#selectButton").property("value");
var selectedColorMode = "crank"; // color_dict[d3.select("#colorMenu").property("value")];
// console.log("asdf asdf",selectedColorMode.length);

// var asdf = d3.selectAll("input[type=radio]");
// console.log("....  ..  ...",asdf.length);

// asdf.on('change', function(d) {
//     console.log('button changed to ' + this.value);
//     selectedColorMode = this.value;
// });

// var checks = d3.selectAll("input[type=radiox]").checked(true);
// console.log("-----",checks[0]);

// for(var i = 0; i < colorm.length; i++) {
//    if(colorm[i].checked)
//        selectedColorMode = colorm[i].value;
//  }

var end_separators = false;

// my first javascript. :)
var svgWidth = 960; 
var svgHeight = 800

//var barPadding = 5;
var xOffset = 150;
var yOffset = 50;

// keeps tracking of which coloring mode to use
// hooks in to update everything if a different radio button is selected
// var dataCol = d3.select("#colorMode")
// dataCol.on("change", update)

// var chartDiv = document.getElementById("acc_chart");
//var svgWidth = 900; // chartDiv.clientWidth*5/6;

function myTitleCase(mystr) {
    return mystr.toLowerCase()
	.split(' ')
	.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
	.join(' ');
}

function wrapText(text, maxChars) {
        var ret = [];
        var words = text.split(/\b/);

        var currentLine = '';
        var lastWhite = '';
        words.forEach(function(d) {
            var prev = currentLine;
            currentLine += lastWhite + d;

            var l = currentLine.length;

            if (l > maxChars) {
                ret.push(prev.trim());
                currentLine = d;
                lastWhite = '';
            } else {
                var m = currentLine.match(/(.*)(\s+)$/);
                lastWhite = (m && m.length === 3 && m[2]) || '';
                currentLine = (m && m.length === 3 && m[1]) || currentLine;
            }
        });

        if (currentLine) {
            ret.push(currentLine.trim());
        }

        return ret.join("\n");
    }

// Dynamic Width (Build Regex)
function myWrap(s, w) {
	return s.replace(
	    new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n');
}

function zoomed() {
  gElem.attr("transform", d3.event.transform)
}

var zoom = d3.zoom().on("zoom", zoomed);

var mysvg = d3.select('#newcontainer')
    .append("svg")
    .attr('id','mysvg')
    .call(d3.zoom().on("zoom", function () {
	mysvg.attr("transform", d3.event.transform)
    }))
    .append("g");

var gElem = mysvg.append("g").call(zoom);

// for tooltips
var nth_list = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th","11th","12","13th","14th","15th"];

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// default to Maine data
var data = me_data;

////////////////////////////////////////////////////////////////////////////////
// dictionary of elections contained in elec-data.js
// keys are what shows up in button list; values are names of data
d3.select("#selectButton")
    .selectAll('myOptions')
    .data(elec_keys)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    .attr("fontSize","xx-large");

d3.select("#colorMenu")
    .selectAll('myColOptions')
    .data(color_keys)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    .attr("fontSize","xx-large");

///////////////////////////////////////////////////////////////////////////////
function default_tooltip_str(myrks) {

    var preflist = myrks;
    var formlist = [myTitleCase(preflist[0])];
    for (idx = 0; idx < preflist.length-1; idx++) {
	formlist.push(" " + nth_list[idx]);
	if (idx == preflist.length-2) {
	    formlist.push(",</br>");
	} else {
	    formlist.push(",</br>");
	}
	formlist.push(myTitleCase(preflist[idx+1]));
    }
    formlist.push(" " + nth_list[idx]);
    return formlist.join('');
}

function cand_tooltip_str(myrks) {
    var preflist = myrks;
    console.log("myr: ",myrks);
    var formlist = [myTitleCase(preflist[preflist.length-1])];
    formlist.push(" " + nth_list[preflist.length-1]);
    // //for (idx = 0; idx < preflist.length-1; idx++) {
    // var idx = preflist.length-2;
    // 	formlist.push(" " + nth_list[idx]);
    // 	if (idx == preflist.length-2) {
    // 	    formlist.push(",</br>");
    // 	} else {
    // 	    formlist.push(",</br>");
    // 	}
    // 	formlist.push(myTitleCase(preflist[idx+1]));
    // //}
    // formlist.push(" " + nth_list[idx]);
    return formlist.join('');
}

function first_tooltip_str(myrks) {
    var preflist = myrks;
    console.log("myr: ",myrks);
    var formlist = [myTitleCase(preflist[0])];
    formlist.push(" " + nth_list[0]);
    // //for (idx = 0; idx < preflist.length-1; idx++) {
    // var idx = preflist.length-2;
    // 	formlist.push(" " + nth_list[idx]);
    // 	if (idx == preflist.length-2) {
    // 	    formlist.push(",</br>");
    // 	} else {
    // 	    formlist.push(",</br>");
    // 	}
    // 	formlist.push(myTitleCase(preflist[idx+1]));
    // //}
    // formlist.push(" " + nth_list[idx]);
    return formlist.join('');
}

function default_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr) {
    for (j = 0; j < rks.length; j++) {
	mysvg.append("rect")
	    .attr("x", newX)
	    .attr("y", rkY)
	    .attr("width",Math.max(0,curX-newX))
	    .attr("height",rkH)
	    .attr("fill",colDict[rks[j]])
	    .on("mouseover", function(d) {		
		div.transition()		
		    .duration(200)		
		    .style("opacity", .9);		
		div.html(mystr) 
		    .style("left", (d3.event.pageX + 28) + "px")		
		    .style("top", (d3.event.pageY - 56) + "px");	
	    })					
	    .on("mouseout", function(d) {		
		div.transition()		
		    .duration(500)		
		    .style("opacity", 0);	
	    });
	rkY = rkY + rkH;
    };
}

function cand_only_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr) {
    rkY = rkY + (rks.length-1)*rkH
    j = rks.length - 1
    console.log("adding: ",newX,rkY,Math.max(0,curX-newX));
    mysvg.append("rect")
	.attr("x", newX)
	.attr("y", rkY)
	.attr("width",Math.max(0,curX-newX))
	.attr("height",rkH)
	.attr("fill",colDict[rks[j]])
	.on("mouseover", function(d) {		
	    div.transition()		
		.duration(200)		
		.style("opacity", .9);		
	    div.html(mystr) 
		.style("left", (d3.event.pageX + 28) + "px")		
		.style("top", (d3.event.pageY - 56) + "px");	
	})					
	.on("mouseout", function(d) {		
	    div.transition()		
		.duration(500)		
		.style("opacity", 0);	
	});
    return newX;
}

function first_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr) {
    rkY = rkY;
    j = 0;
    console.log("adding: ",newX,rkY,Math.max(0,curX-newX));
    mysvg.append("rect")
	.attr("x", newX)
	.attr("y", rkY)
	.attr("width",Math.max(0,curX-newX))
	.attr("height",rkH)
	.attr("fill",colDict[rks[j]])
	.on("mouseover", function(d) {		
	    div.transition()		
		.duration(200)		
		.style("opacity", .9);		
	    div.html(mystr) 
		.style("left", (d3.event.pageX + 28) + "px")		
		.style("top", (d3.event.pageY - 56) + "px");	
	})					
	.on("mouseout", function(d) {		
	    div.transition()		
		.duration(500)		
		.style("opacity", 0);	
	});
    return newX;
}

function roundacc_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr,row,SortedCandidates) {
    rkY = rkY;
    j = 0;
    console.log("adding: ",row,SortedCandidates[row-1][0],newX,rkY,Math.max(0,curX-newX));
    mysvg.append("rect")
	.attr("x", newX)
	.attr("y", rkY)
	.attr("width",Math.max(0,curX-newX))
	.attr("height",rkH)
	.attr("fill",colDict[SortedCandidates[row-1][0]])
	.on("mouseover", function(d) {		
	    div.transition()		
		.duration(200)		
		.style("opacity", .9);		
	    div.html(mystr) 
		.style("left", (d3.event.pageX + 28) + "px")		
		.style("top", (d3.event.pageY - 56) + "px");	
	})					
	.on("mouseout", function(d) {		
	    div.transition()		
		.duration(500)		
		.style("opacity", 0);	
	});
    return newX;
}

function round_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr,curColor) {
    console.log("here i am: ",row,colDict[row-1],colDict);
    // j = rks.length-1;
    mysvg.append("rect")
	.attr("x", newX)
	.attr("y", rkY)
	.attr("width",Math.max(0,curX-newX))
	.attr("height",rkH)
	.attr("fill",curColor)
	.on("mouseover", function(d) {		
	    div.transition()		
		.duration(200)		
		.style("opacity", .9);		
	    div.html(mystr) 
		.style("left", (d3.event.pageX + 28) + "px")		
		.style("top", (d3.event.pageY - 56) + "px");	
	})					
	.on("mouseout", function(d) {		
	    div.transition()		
		.duration(500)		
		.style("opacity", 0);	
	});
}

function draw_bar_round(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates) {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // default coloring scheme
    // now we want to fill in the votes that were accumulated during a given round.
    // if we're using the default coloring scheme, we keep everything as fine as possible.
    for (k = 0; k < SortedCandidates.length; k++) {
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    // this isn't pretty, but let's sort according to how low-ranked the candidate is
	    var tmprnk = rvalue.Ranks.split(",");
	    if ((k < tmprnk.length) && (tmprnk[k] == value[0].toString())) {
		var newX = curX - parseInt(rvalue.Number)*xFactor;
		// console.log("Round,row: ",value[0],row,newX,curX);

		// this is for default accumulation chart
		// run through the pedigree
		var rks = rvalue.Ranks.split(",");
		var rkY = curY;
		var rkH = rowH/rks.length;
		
		console.log("select color mode: ",selectedColorMode);
		if (selectedColorMode == "crank") {
		    rvalue.FormattedRanks = default_tooltip_str(rks);
		    var mystr = myTitleCase(value[0]) + " accumulated " + rvalue.Number.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks
		    default_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr);
		} else if (selectedColorMode == "cround") {
		    rvalue.FormattedRanks = default_tooltip_str(rks);
		    var mystr = myTitleCase(value[0]) + " accumulated " + rvalue.Number.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks
		    console.log("round: ",row,SortedCandidates[row],SortedCandidates[row]['key']);
		    if (row > 1) {
			round_ballots_add(mysvg,rks,newX,rkY,curX,rowH,mystr,colDict[SortedCandidates[row][0]]);
		    } else {
			round_ballots_add(mysvg,rks,newX,rkY,curX,rowH,mystr,colDict[SortedCandidates[row][0]]);
		    }
		} else if (selectedColorMode == "cfirst") {
		    rvalue.FormattedRanks = first_tooltip_str(rks);
		    var mystr = myTitleCase(value[0]) + " accumulated " + rvalue.Number.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks
		    console.log("round: ",row,SortedCandidates[row],SortedCandidates[row]['key']);
		    if (row > 1) {
			round_ballots_add(mysvg,rks,newX,rkY,curX,rowH,mystr,colDict[SortedCandidates[row][0]]);
		    } else {
			round_ballots_add(mysvg,rks,newX,rkY,curX,rowH,mystr,colDict[SortedCandidates[row][0]]);
		    }
		} else {
		    rvalue.FormattedRanks = cand_tooltip_str(rks);
		    var mystr = myTitleCase(value[0]) + " accumulated " + rvalue.Number.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks
		    cand_only_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr);
		}
		curX = newX;
	    };
	};
    };
    return curX;
}

function draw_bar_round_cand_only(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates) {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // default coloring scheme
    // now we want to fill in the votes that were accumulated during a given round.
    // we need to select ballots according to what place the given candidate is in
    for (k = 0; k < SortedCandidates.length; k++) {
	var votes_tot = 0;
	var rkY = curY;
	var rkH = rowH/(k+1);

	// first figure out the total number of votes here	
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    var tmprnk = rvalue.Ranks.split(",");
	    if ((k < tmprnk.length) && (tmprnk[k] == value[0].toString())) {
		votes_tot = votes_tot + rvalue['Number'];
	    };
	    console.log("tot votes: ",votes_tot," in round ",k);
	};

	// now go back through and draw the appropriate rectangle with the appropriate aggregate vote count
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    // this isn't pretty, but let's sort according to how low-ranked the candidate is
	    var tmprnk = rvalue.Ranks.split(",");
	    if ((k < tmprnk.length) && (tmprnk[k] == value[0].toString())) {
		rvalue.FormattedRanks = cand_tooltip_str(tmprnk);
		newX = curX - parseInt(rvalue.Number)*xFactor;
		var mystr = myTitleCase(value[0]) + " accumulated " + votes_tot.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks;
		curX = cand_only_ballots_add(mysvg,tmprnk,newX,rkY,curX,rkH,mystr);
	    };
	};
    };
    return curX;
}

// color according to first choice
function draw_bar_round_first(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates) {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // default coloring scheme
    // now we want to fill in the votes that were accumulated during a given round.
    // we need to select ballots according to what place the given candidate is in
    for (k = 0; k < SortedCandidates.length; k++) {
	var votes_tot = 0;
	var rkY = curY;
	var rkH = rowH;

	// first figure out the total number of votes here	
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    var tmprnk = rvalue.Ranks.split(",");
	    if (tmprnk[0] == SortedCandidates[k][0]) {
		votes_tot = votes_tot + rvalue['Number'];
	    };
	    console.log("tot votes: ",votes_tot," to candidate ",SortedCandidates[k][0]);
	};

	// now go back through and draw the appropriate rectangle with the appropriate aggregate vote count
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    // this isn't pretty, but let's sort according to how low-ranked the candidate is
	    var tmprnk = rvalue.Ranks.split(",");
	    if (tmprnk[0] == SortedCandidates[k][0]) {
		rvalue.FormattedRanks = first_tooltip_str(tmprnk);
		newX = curX - parseInt(rvalue.Number)*xFactor;
		var mystr = myTitleCase(value[0]) + " accumulated " + votes_tot.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks;
		curX = first_ballots_add(mysvg,tmprnk,newX,rkY,curX,rkH,mystr);
	    };
	};
    };
    return curX;
}

// color according to round accumulated
function draw_bar_round_roundacc(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates) {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // default coloring scheme
    // now we want to fill in the votes that were accumulated during a given round.
    // we need to select ballots according to what place the given candidate is in
    var votes_tot = 0;
    var rkY = curY;
    var rkH = rowH;

    // first figure out the total number of votes here	
    for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	var tmprnk = rvalue.Ranks.split(",");
	votes_tot = votes_tot + rvalue['Number'];
	// console.log("tot votes: ",votes_tot," in round ",SortedCandidates[k][0]);
    };

    // now go back through and draw the appropriate rectangle with the appropriate aggregate vote count
    for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	// this isn't pretty, but let's sort according to how low-ranked the candidate is
	var tmprnk = rvalue.Ranks.split(",");
	rvalue.FormattedRanks = first_tooltip_str(tmprnk);
	newX = curX - parseInt(rvalue.Number)*xFactor;
	var mystr = myTitleCase(value[0]) + " accumulated " + votes_tot.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString();
	curX = roundacc_ballots_add(mysvg,tmprnk,newX,rkY,curX,rkH,mystr,row,SortedCandidates);
    };

    return curX;
}

///////////////////////////////////////////////////////////////////////////////
function make_chart(mydata) {

    // var colorm = document.getElementById("colorscheme"); //.getElementsByName("colorMode");
    // var selectedColorMode = "crank";
    // var elem = document.getElementById("colorscheme");
    // console.log(elem);

    // var myNodelist = document.querySelectorAll("colorMode");
    // console.log("arg: ",myNodelist,colorm);
    // console.log("asfdasdfasdfasdfasdf: ",myNodelist.length);

    // console.log("mylen: ",colorm.length);
    // for(var i = 0; i < colorm.length; i++) {
    // 	if(colorm[i].checked)
    // 	    selectedColorMode = colorm[i].value;
    // }

    // d3.selectAll("svg > *").remove();

    d3.selectAll("svg").remove();

    // svgHeight = 1500
    var mysvg = d3.select('#newcontainer')
	.append("svg")
	.attr('id','mysvg')
	.call(d3.zoom().on("zoom", function () {
	    mysvg.attr("transform", d3.event.transform)
	}))
	.append("g");

    // Get total votes for each candidate
    var CandidateTotals = d3.nest()
	.key(function(d) { return d.Round; })
	.rollup(function(v) { return d3.sum(v, function(d) { return d.Number; }) })
	.entries(mydata);
    // console.log("New CandidateTotals",typeof(mydata),JSON.stringify(CandidateTotals));

    // Create items array
    var SortedCandidates = Object.keys(CandidateTotals).map(function(mykey) {
	return [CandidateTotals[mykey]['key'],CandidateTotals[mykey]['value']];
    });

    // Sort the array based on the second element
    SortedCandidates.sort(function(first, second) {
	if (first[0] == 'WriteIn') {
	    return -1;
	} else {
	    return first[1] - second[1];
	}
    });

    var col_arr;
    col_arr = [
	"#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
	"#cab2d6","#6a3d9a","#ffff99","#b15928","#76cee3","#1f58b4","#92df8a","#33702c",
	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486",
	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486",
	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];

	// "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5",
	// "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5",
	// "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"];

    // get maximum vote total - clunky!
    var maxVotes = 0;
    for (i = 0; i < SortedCandidates.length; i++) {
	if (parseInt(CandidateTotals[i]['value']) > maxVotes) {
	    maxVotes = parseInt(CandidateTotals[i]['value']);
	}
    }
    var xFactor = (svgWidth-2*xOffset)*1.0/maxVotes;
    
    var numRows = SortedCandidates.length;

    // make color dict for these candidates
    colDict = {};
    for (i = 0; i < SortedCandidates.length; i++) {
	colDict[SortedCandidates[SortedCandidates.length-i-1][0]] = col_arr[i];
    }

    var curY = yOffset + SortedCandidates.length*yDiff

    ////////////////////////////////////////////////////////////////////////////////
    // run through the candidates, printing bar for each one
    for (const [key, value] of Object.entries(SortedCandidates)) {
	// Round here refers to which candidate is being eliminated
	// we are choosing which bar we are working on
	var filteredRound = mydata.filter(function (a) { return a.Round === value[0]; });
	curY = curY - yDiff; 
	var curX = xOffset + parseInt(value[1])*xFactor; // how far bar extends to the right

	// put candidate total at right side of bar
	mysvg.append("text")
    	    .attr("x",curX + 20)
    	    .attr("y",curY + rowH/2 + 10)
    	    .attr("font-size",24)
	    .attr("text-anchor","start")
    	    .text(value[1].toLocaleString('en-US')); // CandidateTotals[value[0]]['value']);
	// console.log("rows in this order: ",value[1])

	// Add tick mark at right side of bar
	if (end_separators) {
	    mysvg.append("line")
		.attr("x1",curX)
		.attr("x2",curX)
		.attr("y1",curY+rowH)
		.attr("y2",curY+rowH+7)
		.attr("stroke","black")
		.attr("width",2);
	}

	// run through segments
	// these correspond to the various groups in which the candidate accumulated more votes
	for (row = 1; row < numRows; row++) {
	    var filteredSegment = filteredRound.filter(function (a) { return parseInt(a.Segment) == row });

	    if (selectedColorMode == "crank") {
		curX = draw_bar_round(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else if (selectedColorMode == "ccand") {
		curX = draw_bar_round_cand_only(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else if (selectedColorMode == "cfirst") {
		curX = draw_bar_round_first(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else {
		curX = draw_bar_round_roundacc(mysvg,numRows-row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    }

	    // Add in seperators between segments
	    if (end_separators || row < numRows-1) {
		mysvg.append("line")
		    .attr("x1",curX)
		    .attr("x2",curX)
		    .attr("y1",curY+rowH)
		    .attr("y2",curY+rowH+7)
		    .attr("stroke","black")
		    .attr("width",2);
	    }

	};
	    // Add in label for candidate
	var candlabel = myWrap(myTitleCase(value[0]),8);
	var candlist = myTitleCase(value[0]).split(" ")
	candlabel1 = candlist[0]

	if (candlist.length > 1) {
	    mysvg.append("text")
		.attr("x",5)
		.attr("y",curY + rowH/4)
		.attr("font-size",24)
		.text(candlabel1);
	    candlabel2 = candlist[candlist.length-1]
	    mysvg.append("text")
		.attr("x",5)
		.attr("y",curY + 2*rowH/3)
		.attr("font-size",24)
		.text(candlabel2);
	} else {
	    mysvg.append("text")
		.attr("x",5)
		.attr("y",curY + rowH/2)
		.attr("font-size",24)
		.text(candlabel1);
	}

	    if (key < (SortedCandidates.length)-1) {
		mysvg.append("text")
		    .attr("x",5)
		    .attr("y",curY + 4*rowH/4)
		    .attr("font-size",18)
		    .text("Lost round " + (parseInt(key)+1).toString());
	    } else
	    {
		mysvg.append("text")
		    .attr("x",5)
		    .attr("y",curY + 4*rowH/4)
		    .attr("font-size",18)
		    .text("Winner");
	    }

    };
}

// A function that update the chart
function update(selectedOption) {
    make_chart(elec_dict[selectedOption]);
}

// d3.select("#colorMode").on("change", function(d) {
//     selectedOption = d3.select("selectButton").property("value");
//     selectedColorMode = d3.select(this).property("value");
//     update(selectedOption);
// });

// When the button is changed, run the updateChart function
d3.select("#selectButton").on("change", function(d) {
    // recover the option that has been chosen
    selectedOption = d3.select(this).property("value")
    // console.log("selected option: ",selectedOption);
    // run the updateChart function with this selected option
    // selectedColorMode = d3.select("#colorMode").property("value");
    update(selectedOption)
//    if (selectedOption == '2013 Minneapolis, MN mayoral') {
//	svgHeight = 1200
	// svgWidth = 1300
//    }
})

// When the button is changed, run the updateChart function
d3.select("#colorMenu").on("change", function(d) {
    // recover the option that has been chosen
    // var selectedOption = d3.select(this).property("value")
    // console.log("selected option: ",selectedOption);
    // run the updateChart function with this selected option
    selectedColorMode = color_dict[d3.select(this).property("value")];
    selectedOption = d3.select("#selectButton").property("value")
    update(selectedOption)
//    if (selectedOption == '2013 Minneapolis, MN mayoral') {
//	svgHeight = 1200
	// svgWidth = 1300
//    }
})

// When the button is changed, run the updateChart function
// d3.select("#resetButton").on("click", function(d) {
//     //svg.call(zoom.transform, d3.zoomIdentity.scale(1));
//     console.log("resetting");
//   gElem.transition()
//     .duration(750)
//     .call(zoom.transform, d3.zoomIdentity);
// })

// $("#resetButton").click(() => {
//   gElem.transition()
//     .duration(750)
//     .call(zoom.transform, d3.zoomIdentity);
// });

// initialize the chart to the first selection

update(elec_keys[0]);
