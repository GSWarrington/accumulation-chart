# accumulation-chart
Interactive accumulation charts for ranked-choice voting

## Outline of code

This code demostrates the accumulation charts introduced in the
[preprint](https://arxiv.org/abs/1903.06095) and [_Notices of the AMS_
article](https://www.ams.org/journals/notices/201911/rnoti-p1793.pdf).
A demonstration of this code, along with additional explanatory
material, can be found
[here](http://www.cems.uvm.edu/~gswarrin/accumulation-chart.html).

As these charts illustrate detailed data about how ballots with
different partial rankings are reallocated during the tabulation
process, they require input data that are more detailed than that
needed for many types of illustrations. In particular it is **not**
enough to know the number of votes each candidate has garnered at each
round of the election. Instead, one must use an accumulation chart,
one must have a tabulator output data suitable for input into the
accumulation chart.

This repository breaks into the three parts described below. Note that
most of the code could use an overhaul. 

+ Accumulation Chart display code:
  + accumulation-chart.html
  + accumulation-chart.js
  + accumulation-chart.css

+ Code to process raw ballot data into a form suitable for use by the
  Accumulation Chart display code.
  + Maine_RCV.py - General code for processing raw ballot
    data. Included is a generic, bare-bones IRV tabulator.
  + cambridge-process.py - Code for processing ballots from
    multi-winnner elections. Included is a generic, bare-bones STV tabulator.
  + convert-csv-json.py - converts processed data into JSON format which
    can be read directly by the display code

+ Data for individual elections with accompanying metadata.
  + elec-structs.js - metadata about elections. The functions served
    by this file need to be overhauled. It currently must be udpated
    manualloy for each new election.
  + other files beginning with "elec" such as
    "elec-cam_council_2017.js" - this store the processed data for
    individual elections.

## How to use Accumulation Charts

Currently if you want to use Accumulation Charts to display results
from your election, you have two choices:
1. Modify one of the included tabulators to process your raw ballot
   data exactly the same way as your tabulator does.
2. Modify your own tabulator to generate the information needed by
   accumulation charts.

In an ideal world, there would be a standard format for recording the
tabulation process for any IRV/STV election. Tabulators used by those
running elections could be modified to output data files in this
format. These files could, in turn, be read for other purposes such as
display (e.g., via Accumulation Charts) or for auditing.

## JSON format

The following is the JSON data that encodes the "Sample Election" that can be found 
[here](http://www.cems.uvm.edu/~gswarrin/accumulation-chart.html).

```javascript
var example1_data = [{"Ballot":0,"Round":"C","Segment":1,"Number":20,"Ranks":"C"},
    		     {"Ballot":1,"Round":"B","Segment":1,"Number":100,"Ranks":"B"},
		     {"Ballot":2,"Round":"A","Segment":1,"Number":90,"Ranks":"A"},
		     {"Ballot":3,"Round":"A","Segment":2,"Number":20,"Ranks":"C,A"}];
```

Each entry is a dictionary recording the data for a given block of
ballots allocated to a given candidate in a given round. For example,
the fourth entry above indicates there were 20 ballots allocated to
Candidate A after the first elimination that ranked Candidate C first
and Candidate A second.

* "Ballot" is just an index and really refers to a block of ballots
  rather than a single one. Should be renamed.
* "Round" indicates the candidate who's bar these ballots should be displayed in.
* "Segment" indicates which round these ballots were accumulated in.
* "Number" indicates the number of ballots of this type.
* "Ranks" indicates the partial ranking of candidates to be
  displayed. The final candidate in this list should match the value
  of "Round".

## csv format

The file convert-csv-json.py will convert data in the below format
into the JSON format described above. This is a tab-separated file
with the following headers and the same data as described above. For
example, here are the first few rows for the 2017 Cambridge City
Council election.

```
Ballot  Round   Segment Number  Ranks
0       Simmons 1       2253    Simmons
1       Tierney 1       779     Tierney
2       Carlone 1       1176    Carlone
```

Arguments are the .csv/.tsv file and the variable name to assign.

## Adding a new election

Assigning the appropriate JSON data has been put into a .js file. The
only steps required to add an election to the display offered by
accumulation-chart.html is to:
1. Load the .js file from accumulation-chart.html
2. Add a text description to elec-structs.js
3. If STV: Add metadata describing order to display candidate and what happens to each.
4. Add an appropriate entry to elec_dict in elec-structs.js
