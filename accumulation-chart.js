// my first javascript. :)

////////////////////////////////////////
// general layout parameters (in pixels)

var rowH = 50;       // row height - keep constant and just overflow window if necessary
var yDiff = 80;      // spacing between bars

var xOffset = 150;   // offset to make space for candidate names
var yOffset = 50;    // offset to leave a margin at the top

var svgWidth = 960;  // width of display window
var svgHeight = 800  // height of display window

var end_separators = true; // whether to place separators at end of the bar

// for tooltips (which place a candidate was ranked)
var nth_list = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th","11th","12","13th","14th","15th"];

var selectedOption = d3.select("#selectButton").property("value"); // which election we're plotting
var selectedColorMode = "crank"; // the default is to color by rank as described in the paper
var selectedMaxCands = 100; // the default number of candidates to be willing to show
var rightToLeft = false;

// https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
function myTitleCase(mystr) {
    return mystr.toLowerCase()
	.split(' ')
	.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
	.join(' ');
}

// https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
// wrap text by adding newlines
function myWrap(s, w) {
	return s.replace(
	    new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n');
}

// newcontainer is defined to hold the scrollbars
var mysvg = d3.select('#newcontainer')
    .append("svg")
    .attr('id','mysvg')
    .call(d3.zoom().on("zoom", function () {
	mysvg.attr("transform", d3.event.transform)
    }))
    .append("g");

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

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

d3.select("#maxCandsMenu")
    .selectAll('myMaxOptions')
    .data(maxCands_keys)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    .property("selected", function(d){ return d === "100"; })
    .attr("fontSize","xx-large");

// console.log(selectedMaxCands);
// d3.select("maxCandsMenu").value="1000";
// d3.select("#selectButton").property("value")
//    selectedMaxCands = d3.select("maxCandsMenu").property("value");

///////////////////////////////////////////////////////////////////////////////
// we want to display different tooltips according to what our color scheme is
// our first group of functions just computes the string pertaining to the candidates
// and the places they were ranked
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

// all we need to know is the bottom candidate
function cand_tooltip_str(preflist) {
    var formlist = [myTitleCase(preflist[preflist.length-1])];
    formlist.push(" " + nth_list[preflist.length-1]);
    return formlist.join('');
}

// all we need to know is the first candidate
function first_tooltip_str(preflist) {
    var formlist = [myTitleCase(preflist[0])];
    formlist.push(" " + nth_list[0]);
    return formlist.join('');
}

// how we add tooltips to each rectangle we draw
// all that changes is the text mystr
function add_mouse(my_selection,mystr) {
    my_selection
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

////////////////////////////////////////////////////////////////////
// these functions draw the relevant rectangles

// every collection of ballots gets its own rectangle
// j runs from top to bottom
function default_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr) {
    if (rightToLeft) {
	leftX = newX;
	widthX = curX - newX;
    } else {
	leftX = curX;
	widthX = newX - curX;
    }
    for (j = 0; j < rks.length; j++) {
	var myselec = mysvg.append("rect")
	    .attr("x", leftX)
	    .attr("y", rkY)
	    .attr("width",Math.max(0,widthX))
	    .attr("height",rkH)
	    .attr("fill",colDict[rks[j]])
	add_mouse(myselec,mystr);
	rkY = rkY + rkH;
    };
}

// 
function cand_only_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr) {
    rkY = rkY + (rks.length-1)*rkH
    j = rks.length - 1
    if (rightToLeft) {
	leftX = newX;
	widthX = curX - newX;
    } else {
	leftX = curX;
	widthX = newX - curX;
    }
    // console.log("adding: ",newX,rkY,Math.max(0,curX-newX));
    var myselec = mysvg.append("rect")
	.attr("x", leftX)
	.attr("y", rkY)
	.attr("width",Math.max(0,widthX))
	.attr("height",rkH)
	.attr("fill",colDict[rks[j]])

    add_mouse(myselec,mystr);
    return newX;
}

// here we are coloring by the first-ranked candidate, so only need one rectangle
function first_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr) {
    rkY = rkY;
    j = 0;
    if (rightToLeft) {
	leftX = newX;
	widthX = curX - newX;
    } else {
	leftX = curX;
	widthX = newX - curX;
    }
    // console.log("adding: ",newX,rkY,Math.max(0,curX-newX));
    var myselec = mysvg.append("rect")
	.attr("x", leftX)
	.attr("y", rkY)
	.attr("width",Math.max(0,widthX))
	.attr("height",rkH)
	.attr("fill",colDict[rks[j]])
    add_mouse(myselec,mystr);
    return newX;
}

function draw_bar_round(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates) {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // now we want to fill in the votes that were accumulated during a given round.
    // "crank": Default mode of coloring by total ranking
    // console.log("In DBR: ",SortedCandidates);
    // console.log("In DBR filtered: ",filteredSegment);
    // console.log("In DBR other: ",row,key,value,xFactor,curX,curY);
    for (k = 0; k < SortedCandidates.length; k++) {
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    // this isn't pretty, but let's sort according to how low-ranked the candidate is
	    var tmprnk = rvalue.Ranks.split(",");
	    if ((k < tmprnk.length) && (tmprnk[k] == value[0].toString())) {
		// run through the pedigree
		var newX;
		if (rightToLeft) {
		    newX = curX - parseInt(rvalue.Number)*xFactor;
		} else {
		    newX = curX + parseInt(rvalue.Number)*xFactor;
		}
		var rks = rvalue.Ranks.split(",");
		var rkY = curY;
		var rkH = rowH/rks.length;
		
		console.log("newX: ",newX);
		// "cfirst": color by the first candidate on the ballot
		rvalue.FormattedRanks = default_tooltip_str(rks);
		var mystr = myTitleCase(value[0]) + " accumulated " + rvalue.Number.toLocaleString('en-US') +
		    " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks
		default_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr);
		curX = newX;
	    };
	};
    };
    return curX;
}

function draw_bar_round_cand_only(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates) {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // "ccand": color only the candidate to whom the ballot is contributing
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
	};

	// this could be cleaned up, but I think the string needs to be stored in filteredSegment....?
	var first_rect = true;
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    // this isn't pretty, but let's sort according to how low-ranked the candidate is
	    var tmprnk = rvalue.Ranks.split(",");
	    if ((k < tmprnk.length) && (tmprnk[k] == value[0].toString())) {
		rvalue.FormattedRanks = cand_tooltip_str(tmprnk);
		var mystr = myTitleCase(value[0]) + " accumulated " + votes_tot.toLocaleString('en-US') +
		    " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks;
		if (first_rect == true) {
		    if (rightToLeft) {
			newX = curX - votes_tot*xFactor;
		    } else {
			newX = curX + votes_tot*xFactor;
		    }
		    // newX = curX - votes_tot*xFactor;
		    curX = cand_only_ballots_add(mysvg,tmprnk,newX,rkY,curX,rkH,mystr);
		    first_rect = false;
		}
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
	};

	// now go back through and draw the appropriate rectangle with the appropriate aggregate vote count
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    // this isn't pretty, but let's sort according to how low-ranked the candidate is
	    var tmprnk = rvalue.Ranks.split(",");
	    if (tmprnk[0] == SortedCandidates[k][0]) {
		rvalue.FormattedRanks = first_tooltip_str(tmprnk);
		if (rightToLeft) {
		    newX = curX - parseInt(rvalue.Number)*xFactor;
		} else {
		    newX = curX + parseInt(rvalue.Number)*xFactor;
		}
		// newX = curX - parseInt(rvalue.Number)*xFactor;
		var mystr = myTitleCase(value[0]) + " accumulated " + votes_tot.toLocaleString('en-US') +
		    " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks;
		curX = first_ballots_add(mysvg,tmprnk,newX,rkY,curX,rkH,mystr);
	    };
	};
    };
    return curX;
}

///////////////////////////////////////////////////////////////////////////////
// code for limiting number of candidates to show
///////////////////////////////////////////////////////////////////////////////
function keep_first_k(KeepCands,SortedCands,mydata) {
    var new_data = [];
    var new_dict = {};

    for (i = 0; i < mydata.length; i++) {
	// ignore if not part of round that we're keeping
	if (KeepCands.indexOf(mydata[i]['Round']) == -1) {
	    continue;
	};
	var curCand = mydata[i]['Round']; // The candidate whose round we're in
	var has_seen_cur = false;         // Only decrease segment count for ones in current pedigree

	var rks = mydata[i]['Ranks'].split(',');
	var new_rks = []
	// var seenOther = False; // have we seen any deleted candidates yet?
	var segDec = 0;
// 	if (mydata['Segment'] == 1) {
// 	    segDec = 0;
// KeepCands.length == SortedCands.length
// 	} else {
// 	    segDec = 0;
// 	};

	for (j = 0; j < rks.length; j++) {
	    if (KeepCands.indexOf(rks[j]) > -1) {
		new_rks.push(rks[j]);
		// segDec += 1;
		// console.log("cC: ",typeof(curCand),curCand);
		if (curCand == rks[j]) {
		    has_seen_cur = true;
		};
	    // } else {
	    // 	if (has_seen_cur == false) {
	    // 	    segDec = segDec + 1;
	    // 	};
	    };
	};

	// console.log("really: ",KeepCands);
	// console.log("New KC: ",new_rks,new_rks[new_rks.length-1],new_rks[new_rks.length-2]);
	if (new_rks.length == 1) {
	    segDec = 1;
	} else {
	    // console.log("adding rks: ",new_rks);
	    segDec = KeepCands.indexOf(new_rks[new_rks.length-2])+2;
	};

	// make a dictionary to aggregate numbers
	var keystr = mydata[i]['Round'] + "-" + (segDec).toString() + "-" + new_rks.join(",");
	if (keystr in new_dict) {
	    new_dict[keystr] += mydata[i]["Number"];
	} else {
	    new_dict[keystr] = mydata[i]["Number"];
	};

    };
    
    // form back into an array
    var jj = 0;
    Object.keys(new_dict).forEach(function(key) {
	pieces = key.split("-");
	new_data.push({"Ballot": jj, "Round": pieces[0], "Segment": Number(pieces[1]), "Number": new_dict[key], "Ranks": pieces[2]});
	jj += 1;
    });

    // new_data.push({"Ballot": i, "Round": mydata[i]['Round'], "Segment": mydata[i]["Segment"]-segDec, \
    // "Number": mydata[i]["Number"], "Ranks": new_rks.join(",")});
    return new_data;
}

///////////////////////////////////////////////////////////////////////////////
// code for limiting number of candidates to show
///////////////////////////////////////////////////////////////////////////////
function replace_with_other(KeepCands,SortedCands,mydata) {
    var newdata = [];
    for (i = 0; i < mydata.length; i++) {
	// ignore if not part of round that we're keeping
	if (KeepCands.indexOf(mydata[i]['Round']) == -1) {
	    continue;
	};
	var rks = mydata[i]['Ranks'].split(',');
	var new_rks = []
	var seenOther = false; // have we seen any deleted candidates yet?
	var segDec = 0;
	for (j = 0; j < rks.length; j++) {
	    if (KeepCands.indexOf(rks[j]) > -1) {
		new_rks.push(rks[j]);
	    } else {
		if (seenOther == false) {
		    new_rks.push("Other");
		    seenOther = true;
		} else {
		    segDec = segdec - 1;
		};
	    };
	};
	
	// newdata.push({"Ballot": i, "Round": mydata[i]['Round']-segDec, 
    };
}

///////////////////////////////////////////////////////////////////////////////
// mydata is the list of dictionaries holding the ballot info
// mymeta is a dictionary holding info like "number of winners"
function make_chart(orig_data, mymeta) {

    // get the direction to put segments
    var form = document.getElementById("dirn")
    var form_val;
    if (form[1].checked) {
	rightToLeft = true;
    } else {
	rightToLeft = false;
    }
    // for(var i=0; i<form.length; i++){
    //   if(form[i].checked){
    //     form_val = form[i].id;}}

    // console.log("mc: ",selectedMaxCands);

    // reset everything before redrawing with new election and/or color scheme
    d3.selectAll("svg").remove();

    // console.log(mymeta);
    document.getElementById("data-note").innerHTML = elec_text(mymeta);

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
	.entries(orig_data);
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

    // console.log("blah: ",SortedCandidates,typeof(SortedCandidates));
    // the Candidates who are going to get their own line
    // var KeepCandidates = [];
    // for (jj = 0; jj < selectedMaxCands; jj++) {
    // 	console.log("cha: ",SortedCandidates[jj],typeof(SortedCandidates[jj]));
    // 	// KeepCandidates.push(SortedCandidates[jj][0]);
    // };
    var KeepCandidates = SortedCandidates.slice(SortedCandidates.length-selectedMaxCands).map(function(mykey) {
	return mykey[0];
    });

    // console.log("OC: ",SortedCandidates);
    // console.log("KC: ",KeepCandidates);
    // console.log(orig_data);
    var mydata;
    if (SortedCandidates.length > selectedMaxCands) {
	// run through mydata, replacing Candidates too low in the order with "Other"
	mydata = keep_first_k(KeepCandidates,SortedCandidates,orig_data);
	// console.log("orig: ", orig_data);
	// console.log("new: ", mydata);
	// Get total votes for each candidate
	CandidateTotals = d3.nest()
	    .key(function(d) { return d.Round; })
	    .rollup(function(v) { return d3.sum(v, function(d) { return d.Number; }) })
	    .entries(mydata);

	// Create items array
	SortedCandidates = Object.keys(CandidateTotals).map(function(mykey) {
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
	// console.log("SC: ",SortedCandidates);
    } else {
	mydata = orig_data;
    }
    // console.log(mydata);

    var col_arr;
    col_arr = [
	"#1f78b4","#a6cee3","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
	"#cab2d6","#6a3d9a","#b15928","#76cee3","#1f58b4","#92df8a","#33702c",
	"#9e9ac8","#807dba","#6a51a3","#4a1486","#9e9ac8","#807dba","#6a51a3","#4a1486",
	"#9e9ac8","#807dba","#6a51a3","#4a1486","#9e9ac8","#807dba","#6a51a3","#4a1486",
	"#9e9ac8","#807dba","#6a51a3","#4a1486","#9e9ac8","#807dba","#6a51a3","#4a1486"];

    // col_arr = [
    // 	"#1f78b4","#a6cee3","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
    // 	"#cab2d6","#6a3d9a","#ffff99","#b15928","#76cee3","#1f58b4","#92df8a","#33702c",
    // 	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486",
    // 	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486",
    // 	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];

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
	var curX;
	if (rightToLeft) {
	    curX = xOffset + parseInt(value[1])*xFactor; // how far bar extends to the right
	} else {
	    curX = xOffset;
	}

	var sep_arr = [];
	
	// put candidate total at right side of bar
	mysvg.append("text")
    	    .attr("x",xOffset + parseInt(value[1])*xFactor + 20)
    	    .attr("y",curY + rowH/2 + 10)
    	    .attr("font-size",24)
	    .attr("text-anchor","start")
    	    .text(value[1].toLocaleString('en-US')); 

	// Add tick mark at right side of bar
	if (end_separators) {
	    if (rightToLeft) {
		sep_arr.push(xOffset + parseInt(value[1])*xFactor);
	    } else {
		sep_arr.push(xOffset);
	    }
	}

	console.log("Starting x: ",curX);
	// run through segments
	// these correspond to the various groups in which the candidate accumulated more votes
	for (row = 1; row < numRows; row++) {
	    var filteredSegment = filteredRound.filter(function (a) { return parseInt(a.Segment) == row });

	    // console.log("loop: ",row,filteredSegment,selectedColorMode);
	    if (selectedColorMode == "crank") {
		curX = draw_bar_round(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else if (selectedColorMode == "cfirst") {
		curX = draw_bar_round_first(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else if (selectedColorMode == "ccand") {
		curX = draw_bar_round_cand_only(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    }

	    // Add in seperators between segments
	    if (end_separators || row < numRows-1) {
		sep_arr.push(curX)
	    }

	};
	// Add in label for candidate
	var candlabel = myWrap(myTitleCase(value[0]),8);
	var candlist = myTitleCase(value[0]).split(" ")
	candlabel1 = candlist[0]

	// console.log(colDict)
	// console.log(value[0])
	if (candlist.length > 1) {
	    mysvg.append("text")
		.attr("x",5)
		.attr("y",curY + rowH/4)
		.attr("font-size",24)
		.style('fill',colDict[value[0]])
		.style('font-weight','bold')
		.text(candlabel1);
	    candlabel2 = candlist[candlist.length-1]
	    mysvg.append("text")
		.attr("x",5)
		.attr("y",curY + 2*rowH/3)
		.attr("font-size",24)
		.style('fill',colDict[value[0]])
		.style('font-weight','bold')
		.text(candlabel2);
	} else {
	    mysvg.append("text")
		.attr("x",5)
		.attr("y",curY + rowH/2)
		.attr("font-size",24)
		.style('fill',colDict[value[0]])
		.style('font-weight','bold')
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

	sep_arr.push()
	// var rdAdj = 0;
	// if (!rightToLeft) {
	//     rdAdj = 1;
	// }
	for (jj = 0; jj < sep_arr.length; jj++) {
	    // console.log("wha",jj,curY,sep_arr)
	    mysvg.append("line")
		.attr("x1",sep_arr[jj])
		.attr("x2",sep_arr[jj])
		.attr("y1",curY-10)
		.attr("y2",curY+rowH+10)
		.attr("stroke","#555555")
		.attr("width",0.25);
	    // console.log("x",jj,sep_arr[jj+1],sep_arr[jj])
	    if (jj < sep_arr.length-1 && ((rightToLeft && sep_arr[jj]-sep_arr[jj+1] > 35) || (!rightToLeft && sep_arr[jj+1]-sep_arr[jj] > 35))) {
		// console.log("here i am",jj)
		mysvg.append("text")
		    .attr("x",(sep_arr[jj+1]+sep_arr[jj])/2)
		    .attr("y",curY + rowH + 12)
		    .attr("text-anchor","middle")
		    .attr("font-size",12)
		    .attr("fill","#999999")
		    .text("Rd " + (jj+1).toString());
	    }
		
	}
    };
}

// A function that update the chart
function update(selectedOption) {
    // console.log(elec_values);
    make_chart(elec_values(selectedOption), elec_meta(selectedOption));
}

// When the button is changed, run the updateChart function
d3.select("#selectButton").on("change", function(d) {
    // recover the option that has been chosen
    selectedOption = d3.select(this).property("value")
    d3.select("#maxCandsMenu")
	.property('value',"100");
    selectedMaxCands = "100";
    update(selectedOption)
})

// When the button is changed, run the updateChart function
d3.select("#colorMenu").on("change", function(d) {
    // run the updateChart function with this selected option
    selectedColorMode = color_dict[d3.select(this).property("value")];
    // console.log(selectedColorMode);
    selectedOption = d3.select("#selectButton").property("value");
    // selectedMaxCands = d3.select("maxCandsMenu").property("value");
    update(selectedOption);
})

// When the button is changed, run the updateChart function
d3.select("#maxCandsMenu").on("change", function(d) {
    // run the updateChart function with this selected option
    // selectedColorMode = color_dict[d3.select(this).property("value")];
    selectedOption = d3.select("#selectButton").property("value");
    selectedMaxCands = d3.select(this).property("value");
    update(selectedOption);
})

// When the button is changed, run the updateChart function
d3.select("#dirn").on("change", function(d) {
    selectedOption = d3.select("#selectButton").property("value");
    update(selectedOption);
})

// d3.select
// var dataDim = d3.select("#dimensions")
// 	dataDim.on("change", changeIt)
 

// console.log("aaa",elec_keys[0])
// initialize the chart to the first selection
update(elec_keys[0]);
