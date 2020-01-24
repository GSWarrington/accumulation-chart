// Copyright (c) 2019 Bridget Eileen Tenner and Gregory S. Warrington 

////////////////////////////////////////
// general layout parameters (in pixels)

var rowH = 50;       // row height - keep constant and just overflow window if necessary
var yDiff = 80;      // spacing between bars

var xOffset = 180;   // offset to make space for candidate names on the left
var yOffset = 50;    // offset to leave a margin at the top

var svgWidth = 1500; // width of display window
var svgHeight = 800  // height of display window

var end_separators = true; // whether to place separators at end of the bar

// for tooltips (which place a candidate was ranked)
// TODO: this should be turned into a function so it's robust
var nth_list = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th","11th","12","13th","14th","15th","16th","17th","18th","19th","20th","21st","22nd","23rd","24th","25th","26th","27th","28th","29th","30th"];

var selectedOption = d3.select("#selectButton").property("value"); // which election we're plotting
var selectedColorMode = "crank";                                   // the default is to color by rank as described in the paper
var selectedMaxCands = 100;                                        // the default number of candidates to be willing to show
var rightToLeft = false;                                           // rightToLeft=true means earliest rounds to the right

////////////////////////////////////////////////////////////////////////////////
// utility functions
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
// Page setup
////////////////////////////////////////////////////////////////////////////////

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
// Populate dropdowns
////////////////////////////////////////////////////////////////////////////////
d3.select("#selectButton")
    .selectAll('myOptions')
    .data(elec_keys)
    .enter()
    .append('option')
    .text(function (d) { return d; })          // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    .attr("fontSize","xx-large");

d3.select("#colorMenu")
    .selectAll('myColOptions')
    .data(color_keys)
    .enter()
    .append('option')
    .text(function (d) { return d; })          // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    .attr("fontSize","xx-large");

d3.select("#maxCandsMenu")
    .selectAll('myMaxOptions')
    .data(maxCands_keys)
    .enter()
    .append('option')
    .text(function (d) { return d; })          // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    .property("selected", function(d){ return d === "100"; })
    .attr("fontSize","xx-large");

///////////////////////////////////////////////////////////////////////////////
// Tooltips
///////////////////////////////////////////////////////////////////////////////

// A tooltip is associated to each block of votes that appears in a
// bar for a candidate These blocks change according to how the votes
// are being colored, but all the following functions care about is
// the pedigree of votes in the current block --- i.e., the candidates
// shown and their rankings.

// TODO: Combine into one that adjusts depending on coloring mode

// when coloring by ranking
function default_tooltip_str(preflist) {
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
// Rectangles
////////////////////////////////////////////////////////////////////

// These functions draw the individual rectangles that make up each
// bar. In particular, the functions below draw the vertical stack of
// smaller rectangles corresponding to a given block of votes. In the
// default coloring, this might consist of several small rectangles
// whose total height is that of the bar. If we're coloring by
// candidate, this will consist of a single rectangle whose height
// might be much less than the height of the bar.

// rks = rankings of candidates for this block. Last candidate in this
//   list will be the candidate to whom the ballots are contributing to
// newX = X value after this block has been drawn (so X value that will
//   be used for starting the next block).
// rkY = starting y value for this rectangle
// curX = X value for where to draw the block. If we're drawing from L to R
//   then it's the left edge, otherwise it's the right edge.
// rkH = How tall to make this individual rectangle
// mystr = What to use for the tooltip

// TODO: Combine functions into one that adjusts depending on coloring mode

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

// when we're only showing the single candidate who's receiving this ballot
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
function segment_ballots_add(mysvg,rks,newX,rkY,curX,rkH,mystr) {
    rkY = rkY;
    j = 0;
    if (rightToLeft) {
	leftX = newX;
	widthX = curX - newX;
    } else {
	leftX = curX;
	widthX = newX - curX;
    }
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
    var myselec = mysvg.append("rect")
	.attr("x", leftX)
	.attr("y", rkY)
	.attr("width",Math.max(0,widthX))
	.attr("height",rkH)
	.attr("fill",colDict[rks[j]])
    add_mouse(myselec,mystr);
    return newX;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Draw all rectangles for a given round
///////////////////////////////////////////////////////////////////////////////////////////////////

// We have different functions depending on how the bars are being colored.
// row = I'm not sure why this is called "row". It's really the tabulation round we're currently working on
// key = I don't believe this is used in these functions. Index giving order of elimination (starting at 0)?
// value = Array consisting of the candidate who was eliminated this round along with total number of
//   votes at time of elimination?
// xFactor = Scaling based on maximum length of all bars
// curX = Starting X coordinate for this segment of the bar. If RtoL, then will be the rightmost X
//   x coordinate of what we wish to draw
// curY = Y coordinate for this bar
// filteredSegment = Data corresponding to this particular segment
// SortedCandidates = ALl candidates, in order of elimination

// TODO: Combine into one function that adjusts depending on coloring mode

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
		
		// console.log("newX: ",newX);
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

function draw_bar_round_segment(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates) {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // "csegment": color indicates candidate; group by segment
    // now we want to fill in the votes that were accumulated during a given round.
    // we need to select ballots according to what place the given candidate is in
    for (k = 0; k < 1; k++) {
	var votes_tot = 0;
	var rkY = curY;
	var rkH = rowH;

	// first figure out the total number of votes here	
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    votes_tot = votes_tot + rvalue['Number'];
	};

	// this could be cleaned up, but I think the string needs to be stored in filteredSegment....?
	var first_rect = true;
	for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
	    // this isn't pretty, but let's sort according to how low-ranked the candidate is
	    var tmprnk = rvalue.Ranks.split(",");
	    var mystr = myTitleCase(value[0]) + " accumulated " + votes_tot.toLocaleString('en-US') +
		" votes in Round " + rvalue.Segment.toString();
	    if (first_rect == true) {
		if (rightToLeft) {
		    newX = curX - votes_tot*xFactor;
		} else {
		    newX = curX + votes_tot*xFactor;
		};
		// newX = curX - votes_tot*xFactor;
		console.log("Blah",[value[0]]);
		console.log("tmp",tmprnk);
		curX = segment_ballots_add(mysvg,[value[0]],newX,rkY,curX,rkH,mystr);
		first_rect = false;
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

// There are two ways to ignore the candidates who are eliminated
// early on. The first is to sweep them all into an "Other" category
// that gets it's own bar in the accumulation chart. This is what the
// non-functional, commented code for the function
// "replace_with_other" addresses. The second way is that taken by
// "keep_first_k" below which simply erases any candidate who is not
// one of the final k.

// TODO: Make sensible for multi-winner elections.
// TODO: Make "replace_with_other" functional and add ability to select

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

	for (j = 0; j < rks.length; j++) {
	    if (KeepCands.indexOf(rks[j]) > -1) {
		new_rks.push(rks[j]);
		// segDec += 1;
		// console.log("cC: ",typeof(curCand),curCand);
		if (curCand == rks[j]) {
		    has_seen_cur = true;
		};
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

    return new_data;
}

///////////////////////////////////////////////////////////////////////////////
// code for limiting number of candidates to show
///////////////////////////////////////////////////////////////////////////////
// function replace_with_other(KeepCands,SortedCands,mydata) {
//     var newdata = [];
//     for (i = 0; i < mydata.length; i++) {
// 	// ignore if not part of round that we're keeping
// 	if (KeepCands.indexOf(mydata[i]['Round']) == -1) {
// 	    continue;
// 	};
// 	var rks = mydata[i]['Ranks'].split(',');
// 	var new_rks = []
// 	var seenOther = false; // have we seen any deleted candidates yet?
// 	var segDec = 0;
// 	for (j = 0; j < rks.length; j++) {
// 	    if (KeepCands.indexOf(rks[j]) > -1) {
// 		new_rks.push(rks[j]);
// 	    } else {
// 		if (seenOther == false) {
// 		    new_rks.push("Other");
// 		    seenOther = true;
// 		} else {
// 		    segDec = segdec - 1;
// 		};
// 	    };
// 	};
	
//     };
// }

///////////////////////////////////////////////////////////////////////////////
// Main function to create the chart
///////////////////////////////////////////////////////////////////////////////

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

    // reset everything before redrawing with new election and/or color scheme
    d3.selectAll("svg").remove();

    // console.log(mymeta);
    // Display info about the chosen election and where the data came from
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

    // Get total votes for each candidate
    var halfper = 0;
    var candCast = d3.nest()
	.key(function(d) { return d.Round; })
	.rollup(function(v) { return d3.sum(v, function(d) { if (d.Segment == 1) { return d.Number; }})})
	.entries(orig_data);
    for (jj=0; jj < candCast.length; jj++) {
	halfper = halfper + candCast[jj]['value'];
    }

    // Create items array
    var SortedCandidates = Object.keys(CandidateTotals).map(function(mykey) {
	return [CandidateTotals[mykey]['key'],CandidateTotals[mykey]['value']];
    });

    // Sort the array based on the second element
    // This determines order of bars for single-winner elections
    SortedCandidates.sort(function(first, second) {
	if (first[0] == 'WriteIn') {
	    return -1;
	} else {
	    return first[1] - second[1];
	}
    });

    // If there are multiple winners, we need to go to metadata to
    // determine order to draw the rows rather than relying on the
    // total votes for each candidate.

    // Get candidate order from metadata
    // console.log("asdf 0",SortedCandidates.length,CandidateTotals.length,"asdfasdfasdf");
    if (elec_nwinners(mymeta) > 1) {
	SortedCandidates = [];
	order_arr = elec_order(mymeta);
	console.log("Outputting sorted");
	for (jj = 0; jj < CandidateTotals.length; jj++) {
	    console.log(order_arr[jj]);
	    SortedCandidates.push([order_arr[jj][0],order_arr[jj][2],order_arr[jj][1],order_arr[jj][3]]);
	    console.log(SortedCandidates[SortedCandidates.length-1]);
	}
    };

    // Find out who we actually want to display in the chart
    var KeepCandidates = SortedCandidates.slice(SortedCandidates.length-selectedMaxCands).map(function(mykey) {
	return mykey[0];
    });

    ///////////////////////////////////////////////////////////////////////////////////////////
    // If we don't want to display all candidates, reorganize SortedCandidates data accordingly
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

    // color for each candidate
    var col_arr;
    col_arr = [
	"#1f78b4","#a6cee3","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
	"#cab2d6","#6a3d9a","#b15928","#76cee3","#1f58b4","#92df8a","#33702c",
	"#9e9ac8","#807dba","#6a51a3","#4a1486","#9e9ac8","#807dba","#6a51a3","#4a1486",
	"#9e9ac8","#807dba","#6a51a3","#4a1486","#9e9ac8","#807dba","#6a51a3","#4a1486",
	"#9e9ac8","#807dba","#6a51a3","#4a1486","#9e9ac8","#807dba","#6a51a3","#4a1486"];

    // get maximum vote total - clunky!
    var maxVotes = 0;
    // console.log("asdf",SortedCandidates.length,CandidateTotals.length,"asdfasdfasdf");
    console.log("Cand Totals III----------------------------------");
    for (jj=0; jj < CandidateTotals.length; jj++) {
	console.log(CandidateTotals[jj]);
    }
    for (i = 0; i < SortedCandidates.length; i++) {
	if (parseInt(CandidateTotals[i]['value']) > maxVotes) {
	    maxVotes = parseInt(CandidateTotals[i]['value']);
	}
    }

    // var halfper = 0
    // console.log("total: ",halfper);
    // scale so that maximum-length bar fits in window
    var xFactor = (svgWidth-2*xOffset)*1.0/maxVotes;
    
    var numRows = SortedCandidates.length;

    // make color dict for these candidates
    colDict = {};
    for (i = 0; i < SortedCandidates.length; i++) {
	colDict[SortedCandidates[SortedCandidates.length-i-1][0]] = col_arr[i];
    }

    // y-value for first bar to draw
    var curY = yOffset + SortedCandidates.length*yDiff

    // if (row == 1) {
    // halfper = halfper + 

    // Add in line showing 50 percent of votes cast in single-winner elections
    console.log("een: ",elec_nwinners(mymeta));
    if (elec_nwinners(mymeta) == 0) {
	scaleper = xOffset + halfper * xFactor/2
	mysvg.append("line")
    	    .attr("x1",scaleper)
    	    .attr("x2",scaleper)
    	    .attr("y1",yDiff/3)
    	    .attr("y2",curY)
    	    .attr("stroke","#777777")
    	    .attr("width",10);

	mysvg.append("text")
    	    .attr("x",scaleper)
    	    .attr("y",yDiff/4)
    	    .attr("font-size",24)
    	    .attr("fill","#777777")
    	    .attr("text-anchor","middle")
    	    .text("50% of ballots cast"); 

	mysvg.append("text")
    	    .attr("x",scaleper)
    	    .attr("y",curY+20)
    	    .attr("font-size",24)
    	    .attr("fill","#777777")
    	    .attr("text-anchor","middle")
    	    .text(Math.round(halfper/2).toLocaleString('en-US'));
    }

    ////////////////////////////////////////////////////////////////////////////////
    // run through the candidates, printing bar for each one
    ////////////////////////////////////////////////////////////////////////////////
    for (const [key, value] of Object.entries(SortedCandidates)) {
	
	// console.log("ppppp",key,"val: ",value); // ,"tr: ",tr,"rd: ",rd);
	// Round here refers to which candidate is being eliminated
	// we are choosing which bar we are working on
	// Set up positions
	var filteredRound = mydata.filter(function (a) { return a.Round === value[0]; });
	curY = curY - yDiff; 
	var curX;
	if (rightToLeft) {
	    curX = xOffset + parseInt(value[1])*xFactor; // how far bar extends to the right
	} else {
	    curX = xOffset;
	}

	var sep_arr = [];
	
	// In a multi-winner election, we draw a horizontal line to separate out the winners 
	// Check if this is where we need to do it
	if (elec_nwinners(mymeta) > 1 && key > 0 && 
	    value.length >= 3 && value[2] == "Elected" && SortedCandidates[parseInt(key)-1][2] == "Lost") {
	    mysvg.append("line")
		.attr("x1",0)
		.attr("x2",1500)
		.attr("y1",yDiff+curY-13)
		.attr("y2",yDiff+curY-13)
		.attr("stroke","#777777")
		.attr("width",10);
	}

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

	//////////////////////////////////////////////////
	// run through segments
	// this is where bar actually gets drawn
	// these correspond to the various groups in which the candidate accumulated more votes
	// TODO: Change name of "row" variable since misleading, it's keeping track of segment
	for (row = 1; row < numRows; row++) {
	    var filteredSegment = filteredRound.filter(function (a) { return parseInt(a.Segment) == row });

	    // console.log("loop: ",row,filteredSegment,selectedColorMode);
	    if (selectedColorMode == "crank") {
		curX = draw_bar_round(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else if (selectedColorMode == "cfirst") {
		curX = draw_bar_round_first(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else if (selectedColorMode == "ccand") {
		curX = draw_bar_round_cand_only(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    } else if (selectedColorMode == "csegment") {
		curX = draw_bar_round_segment(mysvg,row,key,value,xFactor,curX,curY,filteredSegment,SortedCandidates);
	    }

	    // Add in seperators between segments
	    if (end_separators || row < numRows-1) {
		sep_arr.push(curX)
	    }
	};

	/////////////////////////////////
	// Add in label for each candidate
	var candlabel = myWrap(myTitleCase(value[0]),8);
	var candlist = myTitleCase(value[0]).split(" ")
	candlabel1 = candlist[0]

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

	/////////////////////////////////////////////////////////////////////////////////////
	// Explain what happened to this candidate in this round (i.e., elected, eliminated)
	if (elec_nwinners(mymeta) > 1) {
	    mysvg.append("text")
		.attr("x",5)
		.attr("y",curY + 4*rowH/4)
		.attr("font-size",18)
		.text(SortedCandidates[key][2] + " round " + SortedCandidates[key][3].toString());
		// .text(SortedCandidates[key][2] + " round " + (parseInt(key)+1).toString());
	} else {
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
	}

	/////////////////////////////////////////////////////////////
	// Draw the separators
	sep_arr.push()
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

/////////////////////////////////////////////////////////////////////////////
// Code for triggering updates to chart based on selections
/////////////////////////////////////////////////////////////////////////////

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

// initialize the chart to the first selection
update(elec_keys[0]);
