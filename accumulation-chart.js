// <form id="colorMode">
//   <input type='radio' id="showRanked" name="mode" checked>Show ballots by ranking</input>
//   <input type='radio' id="showRounds" name="mode">Show ballots by round only</input>
// </form>
//   <script>

// var form = document.getElementById("dimensions")
// var form_val;
// for(var i=0; i<form.length; i++){
//     if(form[i].checked){
//         form_val = form[i].id;}}

var end_separators = false;

// my first javascript. :)
var svgWidth = 960; 
var svgHeight = 800

//var barPadding = 5;
var xOffset = 150;
var yOffset = 50;

// keeps tracking of which coloring mode to use
// hooks in to update everything if a different radio button is selected
var dataCol = d3.select("#colorMode")
dataCol.on("change", update)

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

// // Static Width (Plain Regex)
// function myWrap(s, w) {
//     return s.replace(/(?![^\n]{1,32}$)([^\n]{1,32})\s/g, '$1\n');
// }

function zoomed() {
  gElem.attr("transform", d3.event.transform)
}

//var container = d3.select('#acc_chart').append('div')
//    .attr('id','container')

// var svg = d3.select('#newcontainer')
//     .append('svg')
//     .append('circle')
//     .attr('id','mybg')
//     .attr("cx", 25)
//     .attr("cy", 25)
//     .attr("r", 25)
//     .style("fill", "purple");

// var svg = d3.select('#acc_chart')
// var svg = d3.select('#acc_chart')
//     .append('svg')
//     .attr('id','svg')
// //    .attr("width", svgWidth)
// //    .attr("height", svgHeight)

// var svg = d3.select('#newcontainer')
//     .append('svg')

// var svg = d3.select('#newcontainer')
//     .append('svg');

var zoom = d3.zoom().on("zoom", zoomed);

    // .attr("width", svgWidth)
    // .attr("height", svgHeight)

var mysvg = d3.select('#newcontainer')
    .append("svg")
    .attr('id','mysvg')
    .call(d3.zoom().on("zoom", function () {
	mysvg.attr("transform", d3.event.transform)
    }))
    .append("g");

var gElem = mysvg.append("g").call(zoom);

// for tooltips
var nth_list = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// svg.append("rect")
//     .attr("width", "100%")
//     .attr("height", "100%")
//     .attr("fill", "#F7FD9");

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
    .attr("fontSize","xx-large")

//	.attr("width", svgWidth)
//	.attr("height", svgHeight)

///////////////////////////////////////////////////////////////////////////////
function make_chart(mydata) {

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

    // console.log("ht: ",svgHeight);

    // think we can do this through css now
    // mysvg.append("rect")
    // 	.attr("width", "100%")
    // 	.attr("height", "100%")
    // 	.attr("fill", "#E7E9E9");

    // console.log("svg: ",svg.width);

    // for (i = 0; i < 2; i++) {
    // 	console.log("new arr: ",i,mydata[i]);
    // }

    // for (var key in mydata) {
    // 	console.log("now: ",key,mydata[key]);
    // }
    
    // console.log("data now looks like: ",mydata);

    // console.log(mydata);
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
    // console.log(JSON.stringify(SortedCandidates));

    // Sort the array based on the second element
    SortedCandidates.sort(function(first, second) {
	if (first[0] == 'WriteIn') {
	    return -1;
	} else {
	    return first[1] - second[1];
	}
    });

//	  col_arr = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","green","red","orange","blue","brown","pink","yellow","gray","white"]
//	  col_arr = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58","green","red","orange","blue","brown","pink","yellow","gray","white"]

    var col_arr;
    col_arr = [
	"#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
	"#cab2d6","#6a3d9a","#ffff99","#b15928","#76cee3","#1f58b4","#92df8a","#33702c",
	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486",
	"#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];

	// "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5",
	// "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5",
	// "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"];

// "#bb9a99","#a31a1c","#bdbf6f","#bf7f00","#9ab2d6","#6a3d6a","#afff99","#a15928",
//	"#769ee3","#1f18b4","#92df5a","#30702c","#bb6a99","#731a1c","#9dbf6f","#9f7f00","#6ab2d6","#6a3d3a","#8fff99","#815928"];

    // var col_arr;
    // if (SortedCandidates.length <= 5) {
    // 	col_arr = ["#081d58","#225ea8","#41b6c4","#c7e9b4","#ffffd9"];
    // } else {
    // 	col_arr = ["#081d58","#253494","#225ea8","#1d91c0","#41b6c4","#7fcdbb","#c7e9b4","#edf8b1","#ffffd9","green","red","orange","blue","brown","pink","yellow","gray","white"];
    // }

    // // Sort the array based on the second element
    // SortedCandidates.sort(function(first, second) {
    // 	return first[1] - second[1];
    // });
    // console.log(JSON.stringify(SortedCandidates));

    // get maximum vote total - clunky!
    var maxVotes = 0;
    for (i = 0; i < SortedCandidates.length; i++) {
	if (parseInt(CandidateTotals[i]['value']) > maxVotes) {
	    maxVotes = parseInt(CandidateTotals[i]['value']);
	}
    }
    var xFactor = (svgWidth-2*xOffset)*1.0/maxVotes;
    
    var numRows = SortedCandidates.length;
    // var rowH = ((svgHeight-6*numRows)/(1.6*numRows));
    var rowH = 50;
    var yDiff = 80;

    // make color dict for these candidates
    colDict = {};
    for (i = 0; i < SortedCandidates.length; i++) {
	colDict[SortedCandidates[SortedCandidates.length-i-1][0]] = col_arr[i];
	// console.log("colors: ",SortedCandidates[i][0],col_arr[i]);
    }

    var curY = yOffset + SortedCandidates.length*yDiff

    ////////////////////////////////////////////////////////////////////////////////
    // run through the candidates, printing bar for each one
    for (const [key, value] of Object.entries(SortedCandidates)) {
	var filteredRound = mydata.filter(function (a) { return a.Round === value[0]; });
	// var curY = yOffset + (SortedCandidates.length-parseInt(key)-1)*((svgHeight-0)/(numRows+0.3)) - 20;
	curY = curY - yDiff; // yOffset + (SortedCandidates.length-parseInt(key)-1)*((svgHeight-0)/(numRows+0.3)) - 20;
	var curX = xOffset + parseInt(value[1])*xFactor; // how far bar extends to the right
	// if (key == SortedCandidates.length-1) {
	// curX = curX - parseInt(SortedCandidate[k-1]['value']);
	// }

	// console.log(key,value);
	mysvg.append("text")
    	    .attr("x",curX + 20)
    	    .attr("y",curY + rowH/2 + 10)
    	    .attr("font-size",24)
	    .attr("text-anchor","start")
    	    .text(value[1].toLocaleString('en-US')); // CandidateTotals[value[0]]['value']);
	// console.log("rows in this order: ",value[1])

	// Add in seperators between segments
	if (end_separators) {
	    mysvg.append("line")
		.attr("x1",curX)
		.attr("x2",curX)
		.attr("y1",curY-7)
		.attr("y2",curY)
		.attr("stroke","black")
		.attr("width",2);
	}

	// run through segments
	for (row = 1; row < numRows; row++) {
	    var filteredSegment = filteredRound.filter(function (a) { return parseInt(a.Segment) == row });
	    // console.log("Round,Segment: ",value[0],row,filteredSegment);
	    // console.log("bbb--- ",tmprnk,rvalue.Segment.toString());
	    for (k = 0; k < SortedCandidates.length; k++) {
		    for (const [rkey, rvalue] of Object.entries(filteredSegment)) {
			// this isn't pretty, but let's sort according to how low-ranked the candidate is
			// console.log("Round,row:  ",value[0],row,rkey,rvalue);
			var tmprnk = rvalue.Ranks.split(",");
			if ((k < tmprnk.length) && (tmprnk[k] == value[0].toString())) {
			    var newX = curX - parseInt(rvalue.Number)*xFactor;
			    // console.log("Round,row: ",value[0],row,newX,curX);
			    // run through the pedigree
			    var rks = rvalue.Ranks.split(",");
			    var rkY = curY;
			    var rkH = rowH/rks.length;
			    var preflist = rks;
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
			    var ranking_list = formlist.join("");
			    rvalue.FormattedRanks = formlist.join("");
			    console.log(ranking_list);
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
//					div.html("Accumulated in Round " + rvalue.Segment.toString() + "<br/>" + rvalue.Number.toLocaleString('en-US') + " voters preferred<br/>" + rvalue.Ranks.replace(/,/g," to ")) 
//					div.html(rvalue.Number.toLocaleString('en-US') + " votes were accumulated in Round " + rvalue.Segment.toString() + " that preferred<br/>" + rvalue.Ranks.replace(/,/g," to ")) 
					div.html(myTitleCase(value[0]) + " accumulated " + rvalue.Number.toLocaleString('en-US') + " votes in Round " + rvalue.Segment.toString() + " that ranked<br/>" + rvalue.FormattedRanks) 
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
			    curX = newX;
			};
		    };
	    };
	    // Add in seperators between segments
	    if (end_separators || row < numRows-1) {
	    mysvg.append("line")
		.attr("x1",curX)
		.attr("x2",curX)
		.attr("y1",curY-7)
		.attr("y2",curY)
		.attr("stroke","black")
		.attr("width",2);
	    }

	};
	    // Add in label for candidate
	var candlabel = myWrap(myTitleCase(value[0]),8);
// .toLowerCase()
// 		.split(' ')
// 		.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
// 		.join(' ');
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

// When the button is changed, run the updateChart function
d3.select("#selectButton").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    // console.log("selected option: ",selectedOption);
    // run the updateChart function with this selected option
    update(selectedOption)
    if (selectedOption == '2013 Minneapolis, MN mayoral') {
	console.log("opt: ",selectedOption,"blah");
	svgHeight = 1200
	// svgWidth = 1300
    }
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
