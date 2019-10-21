var maine_text = "Nov 6, 2018 Maine 2nd Congressional District General Election. Data from <a href=\"https://www.maine.gov/sos/cec/elec/results/results18.html#Nov6\">Maine SoS</a>.";

var btv_text = "Mar 6, 2009 Burlington, VT Mayoral Election. Data from <a href=\"https://rangevoting.org/JLburl09.txt\">RangeVoting.org</a> processed by Juho Laatu and Warren D. Smith.";

var sfo_text = "Jun 5, 2018 San Francisco, CA Mayoral Election. Data from <a href=\"https://sfelections.sfgov.org/june-5-2018-election-results-detailed-reports\">SF Department of Elections</a>.";

var mn_text = "Nov 5, 2013 Minneapolis, MN Mayoral Election. Data from <a href=\"http://vote.minneapolismn.gov/results/2013/index.htm\">Minneapolis Election and Voter Services.";

var mainegub_text = "Nov 6, 2018 Maine Gubernatorial Primary Election. Data from <a href=\"https://www.maine.gov/sos/cec/elec/results/results18.html#Nov6\">Maine SoS website</a>.";

var cam_text = "<b>Test.</b> Cambridge, MA 2017 city council election. This is a multi-winner election, so we're still exploring the best way to display the results. Also, the algorithm used for reallocating votes is more complicated and there are still some significant discrepancies with our tabulation and the <a href=\"https://www.cambridgema.gov/election2017/Council%20Order%20Round.htm\">official results</a>.";

var sample_text = "Hypothetical Election.";

var poll_text = "<font color=\"red\">June-July 2019 Survey Data from Progress/YouGov Poll. The query was <i>not</i> framed as a ranked-choice election. The data shown here are included for the purpose of exploring accumulation charts, not for drawing conclusions about the true support of individual candidates or who would win an RCV election.  Data from <a href=\"https://www.dataforprogress.org/memos/how-the-first-debate-changed-the-race\">here</a> and includes both pre- and post-debate respondents.</font>";

var cam_order = [['Simmons', 'Elected'], ['Siddiqui', 'Elected'], ['Write-In', 'Lost'], ['Sutton', 'Lost'], ['Moree', 'Lost'], ['Lenke', 'Lost'], ['Pillai', 'Lost'], ['Santos', 'Lost'], ["D'Ambrosio", 'Lost'], ['Benjamin', 'Lost'], ['Levy', 'Lost'], ['Volmar', 'Lost'], ['Burgin', 'Lost'], ['Musgrave', 'Lost'], ['Okamoto', 'Lost'], ['Gebru', 'Lost'], ['McGovern', 'Elected'], ['Tierney', 'Lost'], ['Sivongxay', 'Lost'], ['Devereux', 'Elected'], ['Zondervan', 'Elected'], ['Mallon', 'Elected'], ['Harding-Jr.', 'Lost'], ['Toner', 'Lost'], ['Toomey-Jr.', 'Elected'], ['Kelley', 'Lost'], ['Carlone', 'Elected'], ['Simmons', 'Lost'], ['Carlone', 'Lost'], ['McGovern', 'Lost'], ['Zondervan', 'Lost'], ['Devereux', 'Lost'], ['Siddiqui', 'Lost'], ['Toomey-Jr.', 'Lost'], ['Mallon', 'Lost']];

var cam_order = [['Simmons', 'Elected', 2253], ['Siddiqui', 'Elected', 2253], ['Write-In', 'Lost', 22], ['Sutton', 'Lost', 47], ['Moree', 'Lost', 47], ['Lenke', 'Lost', 59], ['Pillai', 'Lost', 115], ['Santos', 'Lost', 168], ["D'Ambrosio", 'Lost', 237], ['Benjamin', 'Lost', 271], ['Levy', 'Lost', 276], ['Volmar', 'Lost', 298], ['Burgin', 'Lost', 440], ['Musgrave', 'Lost', 641], ['Okamoto', 'Lost', 715], ['Gebru', 'Lost', 1003], ['McGovern', 'Elected', 2253], ['Tierney', 'Lost', 1133], ['Sivongxay', 'Lost', 1207], ['Devereux', 'Elected', 2253], ['Zondervan', 'Elected', 2253], ['Mallon', 'Elected', 2253], ['Harding-Jr.', 'Lost', 1324], ['Toner', 'Lost', 1468], ['Toomey-Jr.', 'Elected', 2253], ['Kelley', 'Lost', 1901], ['Carlone', 'Elected', 2253], ['Simmons', 'Lost', 2253], ['Carlone', 'Lost', 2253], ['McGovern', 'Lost', 2253], ['Zondervan', 'Lost', 2253], ['Devereux', 'Lost', 2253], ['Siddiqui', 'Lost', 2253], ['Toomey-Jr.', 'Lost', 2253], ['Mallon', 'Lost', 2253]];

var cam_order = [['Simmons', 'Elected', 2253, 1], ['Siddiqui', 'Elected', 2253, 1], ['Write-In', 'Lost', 8, 2], ['Sutton', 'Lost', 4, 2], ['Moree', 'Lost', 9, 2], ['Lenke', 'Lost', 6, 3], ['Pillai', 'Lost', 9, 4], ['Santos', 'Lost', 25, 5], ["D'Ambrosio", 'Lost', 17, 6], ['Benjamin', 'Lost', 85, 7], ['Levy', 'Lost', 21, 8], ['Volmar', 'Lost', 35, 9], ['Burgin', 'Lost', 111, 10], ['Musgrave', 'Lost', 26, 11], ['Okamoto', 'Lost', 126, 12], ['Gebru', 'Lost', 213, 13], ['McGovern', 'Elected', 2253, 13], ['Tierney', 'Lost', 151, 14], ['Sivongxay', 'Lost', 269, 15], ['Devereux', 'Elected', 2253, 15], ['Zondervan', 'Elected', 2253, 15], ['Mallon', 'Elected', 2253, 15], ['Harding-Jr.', 'Lost', 707, 16], ['Toomey-Jr.', 'Elected', 2253, 16], ['Toner', 'Lost', 905, 17], ['Carlone', 'Elected', 2081, 18], ['Kelley', 'Elected', 1945, 18]];

var cam_order = [['Simmons', 'Elected', 2253, 1], ['Siddiqui', 'Elected', 2253, 1], ['Write-In', 'Lost', 22, 2], ['Sutton', 'Lost', 47, 2], ['Moree', 'Lost', 47, 2], ['Lenke', 'Lost', 59, 3], ['Pillai', 'Lost', 115, 4], ['Santos', 'Lost', 168, 5], ["D'Ambrosio", 'Lost', 237, 6], ['Benjamin', 'Lost', 271, 7], ['Levy', 'Lost', 276, 8], ['Volmar', 'Lost', 298, 9], ['Burgin', 'Lost', 440, 10], ['Musgrave', 'Lost', 641, 11], ['Okamoto', 'Lost', 716, 12], ['Gebru', 'Lost', 1007, 13], ['McGovern', 'Elected', 2253, 13], ['Tierney', 'Lost', 1141, 14], ['Sivongxay', 'Lost', 1218, 15], ['Devereux', 'Elected', 2253, 15], ['Zondervan', 'Elected', 2253, 15], ['Mallon', 'Elected', 2253, 15], ['Harding-Jr.', 'Lost', 1337, 16], ['Toomey-Jr.', 'Elected', 2253, 16], ['Toner', 'Lost', 1491, 17], ['Carlone', 'Elected', 2081, 18], ['Kelley', 'Elected', 1945, 18]];

var elec_dict = {"2018 Maine 2nd CD": [me_data, {'NWinners': 0, 'desc': maine_text}],
		 "2017 Cambridge, MA City Council (multi-winner test. Beta.)": [cam_data, {'NWinners': 9, 'desc': cam_text, 'order': cam_order}],
		 "2009 Burlington, VT mayoral": [bfp_data, {'NWinners': 0, 'desc': btv_text}],
		 "2018 San Francisco, CA mayoral": [sfo_data, {'NWinners': 0, 'desc': sfo_text}],
		 "2013 Minneapolis, MN mayoral": [mn_data, {'NWinners': 0, 'desc': mn_text}],
		 "2018 Maine gubernatorial primary": [meprim_data, {'NWinners': 0, 'desc': mainegub_text}],
		 "2019 Democratic ranking, July (Data from survey; not RCV)": [pollI_data, {'NWinners': 0, 'desc': poll_text}],
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
		  "Candidate": "ccand"};
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
