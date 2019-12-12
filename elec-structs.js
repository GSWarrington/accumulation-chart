var maine_text = "Nov 6, 2018 Maine 2nd Congressional District General Election. Data from <a href=\"https://www.maine.gov/sos/cec/elec/results/results18.html#Nov6\" target=\"_blank\">Maine SoS</a>.";

var btv_text = "Mar 6, 2009 Burlington, VT Mayoral Election. Data from <a href=\"https://rangevoting.org/JLburl09.txt\" target=\"_blank\">RangeVoting.org</a> processed by Juho Laatu and Warren D. Smith.";

var sfo_text = "Jun 5, 2018 San Francisco, CA Mayoral Election. Data from <a href=\"https://sfelections.sfgov.org/june-5-2018-election-results-detailed-reports\" target=\"_blank\">SF Department of Elections</a>.";

var sf_2019_da_text = "2019 San Francisco, CA DA Election. Official vote totals not yet posted, there are still some discrepancies with preliminary values. Data from <a href=\"https://sfelections.sfgov.org/\" target=\"_blank\">SF Department of Elections</a>.";

var mn_text = "Nov 5, 2013 Minneapolis, MN Mayoral Election. Data from <a href=\"http://vote.minneapolismn.gov/results/2013/index.htm\" target=\"_blank\">Minneapolis Election and Voter Services</a>.";

var mainegub_text = "Nov 6, 2018 Maine Gubernatorial Primary Election. Data from <a href=\"https://www.maine.gov/sos/cec/elec/results/results18.html#Nov6\" target=\"_blank\">Maine SoS website</a>.";

var cam_text = "<b>Test.</b> Cambridge, MA 20XX city-council/school election. This is a multi-winner election, so we're still exploring the best way to display the results. Currently, the elected candidates are listed at the top, starting with those elected in the earliest rounds. Below the line are the eliminated candidates with the earliest defeated at the bottom, just as for the single-winner case. Also, the algorithm used for reallocating votes is more complicated and there may be some minor discrepancies with our tabulation and the <a href=\"https://www.cambridgema.gov/election2017/Council%20Order%20Round.htm\" target=\"_blank\">official results</a>.";

var sample_text = "Hypothetical Election.";

var poll_text = "<font color=\"red\">June-July 2019 Survey Data from Progress/YouGov Poll. The query was <i>not</i> framed as a ranked-choice election. The data shown here are included for the purpose of exploring accumulation charts, not for drawing conclusions about the true support of individual candidates or who would win an RCV election.  Data from <a href=\"https://www.dataforprogress.org/memos/how-the-first-debate-changed-the-race\" target=\"_blank\">here</a> and includes both pre- and post-debate respondents.</font>";

var cam_council_2017_order = [['Write-In-1', 'Lost', 22, 3], ['Sutton', 'Lost', 47, 3], ['Moree', 'Lost', 47, 3], ['Lenke', 'Lost', 59, 4], ['Pillai', 'Lost', 115, 5], ['Santos', 'Lost', 168, 6], ["D'Ambrosio", 'Lost', 237, 7], ['Benjamin', 'Lost', 269, 8], ['Levy', 'Lost', 276, 9], ['Volmar', 'Lost', 299, 10], ['Burgin', 'Lost', 441, 11], ['Musgrave', 'Lost', 639, 12], ['Okamoto', 'Lost', 718, 13], ['Gebru', 'Lost', 1008, 14], ['Tierney', 'Lost', 1145, 15], ['Sivongxay', 'Lost', 1222, 16], ['Harding', 'Lost', 1348, 17], ['Toner', 'Lost', 1503, 18], ['Kelley', 'Elected', 1999, 19], ['Carlone', 'Elected', 2091, 19], ['Toomey', 'Elected', 2253, 18], ['Mallon', 'Elected', 2253, 17], ['Zondervan', 'Elected', 2253, 17], ['Devereux', 'Elected', 2253, 17], ['McGovern', 'Elected', 2253, 15], ['Siddiqui', 'Elected', 2253, 1], ['Simmons', 'Elected', 2253, 1]];

var cam_school_2017_order = [['Write-In-04', 'Lost', 1, 2], ['Write-In-03', 'Lost', 1, 2], ['Write-In-06', 'Lost', 2, 2], ['Write-In-02', 'Lost', 26, 2], ['Write-In-01', 'Lost', 48, 2], ['Mitros', 'Lost', 529, 3], ['MacArthur', 'Lost', 864, 4], ['Weinstein', 'Lost', 946, 5], ['Kadete', 'Lost', 1026, 6], ['Crutchfield', 'Lost', 1435, 7], ['Cronin', 'Lost', 2262, 8], ['Kimbrough', 'Elected', 2959, 9], ['Kelly', 'Elected', 2959, 9], ['Fantini', 'Elected', 2959, 7], ['Dexter', 'Elected', 2959, 7], ['Bowman', 'Elected', 2959, 5], ['Nolan', 'Elected', 2959, 1]];

var cam_council_2015_order = [['Write-In-2', 'Lost', 1, 2], ['Write-In-4', 'Lost', 1, 2], ['Write-In-1', 'Lost', 25, 2], ['Dietrich', 'Lost', 27, 2], ['Sanzone', 'Lost', 33, 2], ['Degoes', 'Lost', 52, 3], ['Williamson', 'Lost', 75, 4], ['Moree', 'Lost', 83, 5], ['Courtney', 'Lost', 84, 6], ['Mello', 'Lost', 146, 7], ['Levy', 'Lost', 187, 8], ['Mahoney', 'Lost', 276, 9], ['Waite', 'Lost', 321, 10], ['Connolly', 'Lost', 954, 11], ['Davidson', 'Lost', 1141, 12], ['Benzan', 'Lost', 1351, 13], ['vanBeuzekom', 'Lost', 1461, 14], ['Carlone', 'Elected', 1786, 15], ['McGovern', 'Elected', 1786, 15], ['Cheung', 'Elected', 1786, 15], ['Kelley', 'Elected', 1786, 15], ['Toomey', 'Elected', 1786, 14], ['Devereux', 'Elected', 1786, 14], ['Maher', 'Elected', 1786, 13], ['Simmons', 'Elected', 1786, 11], ['Mazen', 'Elected', 1786, 1]];

var cam_school_2015_order = [['Write-In-2', 'Lost', 1, 3], ['Write-In-1', 'Lost', 63, 4], ['Kadete', 'Lost', 446, 5], ['Cisternino', 'Lost', 773, 6], ['Weinstein', 'Lost', 849, 7], ['Crutchfield', 'Lost', 1516, 8], ['Cronin', 'Lost', 1897, 9], ['Dexter', 'Elected', 2400, 10], ['Bowman', 'Elected', 2400, 10], ['Kelly', 'Elected', 2400, 9], ['Harding', 'Elected', 2400, 8], ['Fantini', 'Elected', 2400, 1], ['Nolan', 'Elected', 2400, 1]];

var cam_council_2013_order = [['Write-In-2', 'Lost', 2, 2], ['Write-In-1', 'Lost', 14, 2], ['Moree', 'Lost', 39, 2], ['Peden', 'Lost', 49, 2], ['Williamson', 'Lost', 78, 3], ['Phillips', 'Lost', 98, 4], ['Lee', 'Lost', 106, 5], ['Yarden', 'Lost', 118, 6], ['Mello', 'Lost', 123, 7], ['Vasquez', 'Lost', 293, 8], ['Mirza', 'Lost', 324, 9], ['House', 'Lost', 451, 10], ['Von-Hoffmann', 'Lost', 514, 11], ['Leslie', 'Lost', 569, 12], ['Smith', 'Lost', 700, 13], ['Seidel', 'Lost', 932, 14], ['Reeves', 'Lost', 1165, 15], ['vanBeuzekom', 'Lost', 1535, 16], ['Mazen', 'Elected', 1775, 17], ['Carlone', 'Elected', 1775, 17], ['Kelley', 'Elected', 1775, 17], ['McGovern', 'Elected', 1775, 17], ['Benzan', 'Elected', 1775, 16], ['Toomey', 'Elected', 1775, 16], ['Simmons', 'Elected', 1775, 16], ['Maher', 'Elected', 1775, 15], ['Cheung', 'Elected', 1775, 1]];

var cam_school_2013_order = [['Write-In-2', 'Lost', 1, 5], ['Write-In-6', 'Lost', 1, 5], ['Write-In-1', 'Lost', 81, 6], ['Kadete', 'Lost', 612, 7], ['Holland', 'Lost', 859, 8], ['Gerber', 'Lost', 1807, 9], ['Osborne', 'Elected', 2371, 10], ['Cronin', 'Elected', 2371, 9], ['Kelly', 'Elected', 2371, 1], ['Harding', 'Elected', 2371, 1], ['Fantini', 'Elected', 2371, 1], ['Nolan', 'Elected', 2371, 1]];

var cam_council_2011_order = [['Write-In-2', 'Lost', 9, 4], ['Write-In-1', 'Lost', 16, 4], ['Moree', 'Lost', 64, 5], ['Pascual', 'Lost', 70, 6], ['Mello', 'Lost', 155, 7], ['Williamson', 'Lost', 195, 8], ['Stohlman', 'Lost', 408, 9], ['Marquardt', 'Lost', 585, 10], ['Nelson', 'Lost', 677, 11], ['Seidel', 'Lost', 1044, 12], ['Ward', 'Lost', 1229, 13], ['Reeves', 'Elected', 1585, 14], ['vanBeuzekom', 'Elected', 1585, 14], ['Kelley', 'Elected', 1585, 14], ['Decker', 'Elected', 1585, 13], ['Simmons', 'Elected', 1585, 13], ['Davis', 'Elected', 1585, 9
], ['Maher', 'Elected', 1585, 1], ['Toomey', 'Elected', 1585, 1], ['Cheung', 'Elected', 1585, 1]];

var cam_school_2011_order = [['Write-In-5', 'Lost', 1, 2], ['Write-In-2', 'Lost', 14, 2], ['Write-In-1', 'Lost', 43, 2], ['Stead', 'Lost', 301, 3], ['Forster', 'Lost', 361, 4], ['Holland', 'Lost', 444, 5], ['Gerber', 'Lost', 646, 6], ['Tauber', 'Lost', 1756, 7], ['McGovern', 'Elected', 2185, 8], ['Harding', 'Elected', 2185, 8], ['Osborne', 'Elected', 2185, 6], ['Turkel', 'Elected', 2185, 6], ['Nolan', 'Elected', 2185, 5], ['Fantini', 'Elected', 2185, 1]];

var cam_council_2009_order = [['Write-In-6', 'Lost', 2, 4], ['Write-In-3', 'Lost', 13, 4], ['Write-In-2', 'Lost', 18, 4], ['Moree', 'Lost', 50, 5], ['Williamson', 'Lost', 92, 6], ['Podgers', 'Lost', 101, 7], ['Adkins', 'Lost', 126, 8], ['Flanagan', 'Lost', 141, 9], ['Leavitt', 'Lost', 155, 10], ['Glick', 'Lost', 336, 11], ['Stohlman', 'Lost', 438, 12], ['Marquardt', 'Lost', 475, 13], ['vanBeuzekom', 'Lost', 885, 14], ['Ward', 'Lost', 992, 15], ['Sullivan', 'Lost', 1172, 16], ['Cheung', 'Elected', 1538, 17], ['Seidel', 'Elected', 1596, 17], ['Decker', 'Elected', 1596, 17], ['Maher', 'Elected', 1596, 16], ['Reeves', 'Elected', 1596, 16], ['Kelley', 'Elected', 1596, 15], ['Toomey', 'Elected', 1596, 1], ['Simmons', 'Elected', 1596, 1], ['Davis', 'Elected', 1596, 1]];

var cam_school_2009_order = [['Write-In-2', 'Lost', 2, 1], ['Write-In-1', 'Lost', 130, 2], ['Stead', 'Lost', 395, 3], ['Steinert', 'Lost', 1495, 4], ['Grassi', 'Lost', 2005, 5], ['Nolan', 'Elected', 2204, 6], ['Turkel', 'Elected', 2204, 6], ['Fantini', 'Elected', 2204, 6], ['McGovern', 'Elected', 2204, 5], ['Tauber', 'Elected', 2204, 5], ['Harding', 'Elected', 2204, 5]];

var cam_council_2007_order = [['Write-In-2', 'Lost', 1, 2], ['Write-In-1', 'Lost', 21, 2], ['Podgers', 'Lost', 93, 3], ['Moree', 'Lost', 111, 4], ['Janik', 'Lost', 275, 5], ['Moore', 'Lost', 306, 6], ['Galluccio', 'Lost', 557, 7], ['Ward', 'Lost', 829, 8], ['Sullivan', 'Lost', 1036, 9], ['Seidel', 'Elected', 1358, 10], ['Kelley', 'Elected', 1358, 10], ['Simmons', 'Elected', 1358, 9], ['Murphy', 'Elected', 1358, 9], ['Decker', 'Elected', 1358, 9], ['Reeves', 'Elected', 1358, 8], ['Maher', 'Elected', 1358, 7], ['Toomey', 'Elected', 1358, 5], ['Davis', 'Elected', 1358, 1]];

var cam_school_2007_order = [['Write-In-2', 'Lost', 1, 3], ['Write-In-1', 'Lost', 31, 3], ['Malner', 'Lost', 145, 4], ['Lemily-Wiggins', 'Lost', 1091, 5], ['Harding', 'Lost', 1729, 6], ['Tauber', 'Elected', 1891, 7], ['Grassi', 'Elected', 1891, 7], ['Schuster', 'Elected', 1891, 6], ['Nolan', 'Elected', 1891, 6], ['Fantini', 'Elected', 1891, 1], ['McGovern', 'Elected', 1891, 1]];

var cam_council_2005_order = [['Write-In-1', 'Lost', 13, 2], ['Condit', 'Lost', 43, 2], ['Hall', 'Lost', 84, 3], ['LaTremouille', 'Lost', 121, 4], ['Green', 'Lost', 201, 5], ['Adkins', 'Lost', 258, 6], ['Hees', 'Lost', 279, 7], ['Gordon', 'Lost', 713, 8], ['Maher', 'Lost', 1064, 9], ['Seidel', 'Lost', 1278, 10], ['Reeves', 'Elected', 1601, 11], ['Kelley', 'Elected', 1601, 11], ['Murphy', 'Elected', 1601, 11], ['Simmons', 'Elected', 1601, 10], ['Toomey', 'Elected', 1601, 10], ['Davis', 'Elected', 1601, 9], ['Decker', 'Elected', 1601, 9], ['Sullivan', 'Elected', 1601, 7], ['Galluccio', 'Elected', 1601, 1]];

var cam_school_2005_order = [['Write-In-3', 'Lost', 1, 3], ['Write-In-2', 'Lost', 2, 3], ['Write-In-1', 'Lost', 45, 3], ['McGovern', 'Lost', 1454, 4], ['Lummis', 'Lost', 1882, 5], ['Grassi', 'Elected', 2201, 6], ['Schuster', 'Elected', 2201, 6], ['Harding', 'Elected', 2201, 5], ['Walser', 'Elected', 2201, 5], ['Fantini', 'Elected', 2201, 1], ['Nolan', 'Elected', 2201, 1]];

var cam_council_2003_order = [['Write-In-2', 'Lost', 2, 2], ['Write-In-1', 'Lost', 32, 2], ['Greenwood', 'Lost', 41, 2], ['Dixon', 'Lost', 63, 3], ['Hall', 'Lost', 119, 4], ['LaTremouille', 'Lost', 141, 5], ['Taymorberry', 'Lost', 201, 6], ['King', 'Lost', 400, 7], ['Smith', 'Lost', 522, 8], ['Bellew', 'Lost', 843, 9], ['Kelley', 'Lost', 1175, 10], ['Pitkin', 'Lost', 1467, 11], ['DeBergalis', 'Lost', 1635, 12], ['Maher', 'Elected', 1975, 13], ['Simmons', 'Elected', 1975, 13], ['Reeves', 'Elected', 1975, 13], ['Murphy', 'Elected', 1975, 12], ['Toomey', 'Elected', 1975, 12], ['Decker', 'Elected', 1975, 12], ['Sullivan', 'Elected', 1975, 10], ['Davis', 'Elected', 1975, 10], ['Galluccio', 'Elected', 1975, 1]];

var cam_school_2003_order = [['Write-In-3', 'Lost', 2, 7], ['Write-In-2', 'Lost', 3, 7], ['Write-In-1', 'Elected', 92, 8], ['Craig', 'Elected', 711, 8], ['Price', 'Elected', 1813, 8], ['Grassi', 'Elected', 2627, 1], ['Harding', 'Elected', 2627, 1], ['Lummis', 'Elected', 2627, 1], ['McGovern', 'Elected', 2627, 1], ['Fantini', 'Elected', 2627, 1], ['Walser', 'Elected', 2627, 1]];

var elec_dict = {"2019 San Francisco, CA District Attorney": [sf_2019_da_elec_data, {'NWinners': 0, 'desc': sf_2019_da_text}],
		 "2018 Maine 2nd Congressional District": [me_data, {'NWinners': 0, 'desc': maine_text}],
		 "2018 San Francisco, CA mayoral": [sfo_data, {'NWinners': 0, 'desc': sfo_text}],
		 "2018 Maine gubernatorial primary": [meprim_data, {'NWinners': 0, 'desc': mainegub_text}],
		 "2017 Cambridge, MA City Council (9-seat STV)": [cam_council_2017_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2017_order}],
		 "2017 Cambridge, MA School (6-seat STV)": [cam_school_2017_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2017_order}],
		 // "2015 Cambridge, MA City Council (9-seat STV)": [cam_council_2015_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2015_order}],
		 // "2015 Cambridge, MA School (6-seat STV)": [cam_school_2015_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2015_order}],
		 // "2013 Cambridge, MA City Council (9-seat STV)": [cam_council_2013_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2013_order}],
		 // "2013 Cambridge, MA School (6-seat STV)": [cam_school_2013_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2013_order}],
		 // "2011 Cambridge, MA City Council (9-seat STV)": [cam_council_2011_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2011_order}],
		 // "2011 Cambridge, MA School (6-seat STV)": [cam_school_2011_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2011_order}],
		 // "2009 Cambridge, MA City Council (9-seat STV)": [cam_council_2009_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2009_order}],
		 // "2009 Cambridge, MA School (6-seat STV)": [cam_school_2009_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2009_order}],
		 // "2007 Cambridge, MA City Council (9-seat STV)": [cam_council_2007_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2007_order}],
		 // "2007 Cambridge, MA School (6-seat STV)": [cam_school_2007_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2007_order}],
		 // "2005 Cambridge, MA City Council (9-seat STV)": [cam_council_2005_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2005_order}],
		 // "2005 Cambridge, MA School (6-seat STV)": [cam_school_2005_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2005_order}],
		 // "2003 Cambridge, MA City Council (9-seat STV)": [cam_council_2003_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_council_2003_order}],
		 // "2003 Cambridge, MA School (6-seat STV)": [cam_school_2003_data, {'NWinners': 6, 'desc': cam_text, 'order': cam_school_2003_order}],
		 "2013 Minneapolis, MN mayoral": [mn_data, {'NWinners': 0, 'desc': mn_text}],
		 "2009 Burlington, VT mayoral": [bfp_data, {'NWinners': 0, 'desc': btv_text}],

//		 "2019 Democratic ranking, July (Data from survey; not RCV)": [pollI_data, {'NWinners': 0, 'desc': poll_text}],
		 "Sample Election": [example1_data, {'NWinners': 0, 'desc': sample_text}]};
var elec_keys = Object.keys(elec_dict);

// var elec_values = Object.keys(elec_dict).map(function(key){
//     return elec_dict[key][0];
// });

function elec_values(key) {
    return elec_dict[key][0];
}

function elec_meta(key) {
    return elec_dict[key][1];
};

function elec_text(key) {
    return key['desc'];
};

function elec_order(key) {
    return key['order'];
};

function elec_nwinners(key) {
    return key['NWinners'];
};

function elec_quota(key) {
    return key['quota'];
};

// var elec_meta = Object.keys(elec_dict).map(function(key){
//     return elec_dict[key][1];
// });

var color_dict = {"Ranking": "crank",
		 "First choice": "cfirst",
		  "Candidate": "ccand",
		  "Segment": "csegment"};
var color_keys = Object.keys(color_dict);
var color_values = Object.keys(color_dict).map(function(key){
    return color_dict[key];
});

// this is more complicated than it needs to be, but I'm too lazy to change it now
var maxCands_dict = {"2": 2,
		 "3": 3,
		 "4": 3,
		 "5": 5,
		 "6": 6,
		 "7": 7,
		 "8": 8,
		 "9": 9,
		 "10": 10,
		 "25": 25,
		     "100": 100};
var maxCands_keys = Object.keys(maxCands_dict);
var maxCands_values = Object.keys(maxCands_dict).map(function(key){
    return maxCands_dict[key];
});

//		  "Round accumulated (n": "cround"};
