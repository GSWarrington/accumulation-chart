# Code for working with RCV data
# November 30, 2018
# Gregory S. Warrington

# WARNING: Code is totally disorganized

import pandas as pd
import re
import csv

import math

homepath = '/home/gswarrin/research/Active_proj/accumulation-chart/'

#########################################################################################
# code for reading raw ballot data into a dataframe of ballots
#########################################################################################

###########################################################################
# 2018 Maine 2nd congressional 

me_elec_dict = {'data_files': ['AUXCVRProofedCVR95RepCD2.xlsx',\
                              'Nov18CVRExportFINAL2.xlsx',\
                              'RepCD2-8final.xlsx',\
                              'UOCAVA-AUX-CVRRepCD2.xlsx',\
                              'Nov18CVRExportFINAL1.xlsx',\
                              'Nov18CVRExportFINAL3.xlsx',\
                              'UOCAVA2CVRRepCD2.xlsx',\
                              'UOCAVA-FINALRepCD2.xlsx'],\
                'name_dict': {'.*Golden.*':'Golden','.*Poliquin.*':'Poliquin',\
                             '.*Bond.*':'Bond',            '.*Hoar.*':'Hoar',\
                             'undervote':'undervote'},\
                'drop_cols': ['BallotStyle','Precinct'],\
                'col_renamings': {'Rep. to Congress':'','District 2':'',' ':''},\
                'numrks': 5}

###########################################################################
# MN data

mn_elec_dict = {'data_files': ['2013-mayor-cvr.xlsx'],\
                'name_dict': {',':';'},\
                'drop_cols': [],\
                'col_renamings': {' CHOICE MAYOR MINNEAPOLIS':''},\
                'numrks': 3}

###########################################################################
# Maine primary

meprime_elec_dict = {'data_files': ['2018-maine-governor-primary-dem-cvr.xlsx'],\
                     'name_dict': {',':';',
                                  'undervote': 'undervote',
                                  'Cote; Adam Roland': 'Adam Cote',
                                  'Sweet; Elizabeth A.': 'Elizabeth Sweet',
                                  'Mills; Janet T.': 'Janet Mills',
                                  'Russell; Diane Marie': 'Diane Russell',
                                  'Dion; Mark N.': 'Mark Didn',
                                  'Eves; Mark W.': 'Mark Eves',
                                  'Dion; Donna J.': 'Donna Dion',
                                  'overvote': 'overvote',
                                  'Write-in': 'WriteIn'},\
                     'drop_cols': ['Ballot Style','Precinct'],\
                     'col_renamings': {'DEM Governor ':'',' Choice':''},\
                     'numrks': 8}

###########################################################################
# San Francisco 

# 2019 DA
sanfran_2019_DA_elec_dict = {'data_files': ['san_francisco/2019_DA/DA-ballots.xlsx'],\
                             'name_dict': {',':';',
                                  'undervote': 'undervote',
                                  'overvote': 'overvote',
                                  'Write-in': 'WriteIn'},\
                             'drop_cols': [],\
                             'col_renamings': {},\
                             'outfile': 'data/san_francisco/2019_DA/DA-compiled',\
                             'numrks': 4}

# 2019 Mayor
sanfran_2019_Mayor_elec_dict = {'data_files': ['san_francisco/2019_DA/Mayor-ballots.xlsx'],\
                                'name_dict': {',':';',
                                              'undervote': 'undervote',
                                              'overvote': 'overvote',
                                              'Write-in': 'WriteIn'},\
                                'drop_cols': [],\
                                'col_renamings': {},\
                                'outfile': 'data/san_francisco/2019_DA/Mayor-compiled',\
                                'numrks': 6}

# 2019 Supervisor
sanfran_2019_Supervisor_elec_dict = \
    {'data_files': ['san_francisco/2019_DA/Supervisor-ballots.xlsx'],\
     'name_dict': {',':';',
                   'undervote': 'undervote',
                   'overvote': 'overvote',
                   'outfile': 'data/san_francisco/2019_DA/Supervisor-compiled',\
                   'Write-in': 'WriteIn'},\
     'drop_cols': [],\
     'col_renamings': {},\
     'numrks': 4}

###########################################################################
# San Francisco 

# was sf_candidate_dict
sf_name_dict = {
    '0000178': 'Bravo',
    '0000186': 'Sheehy',
    '0000179': 'Breed',
    '0000187': 'DaGesse',
    '0000180': 'Leno',
    '0000188': 'Mandelman',
    '0000021': 'WriteIn',
    '0000181': 'Kim',
    '0000182': 'Greenberg',
    '0000183': 'Alioto',
    '0000184': 'Weiss',
    '0000185': 'Zhou',
    '0000020': 'WriteIn',
    '0000200': 'WriteInRogers',
    '0000000': 'Unknown'}

###########################################################################
###########################################################################
###########################################################################
def gen_collect_data(flist,name_dict,drop_cols,col_renamings):
    df = pd.DataFrame()
    for fn in flist:
        tmpdf = pd.read_excel(homepath + 'data/' + fn)

        # clean up column headings
        for k in col_renamings.keys():
            tmpdf = tmpdf.rename(columns=lambda x: re.sub(k,col_renamings[k],x))

        # I don't use these
        tmpdf = tmpdf.drop(columns=drop_cols)
        df = pd.concat([df,tmpdf])

    # Put candidate names in a simpler format
    df = df.replace(name_dict,regex=True)
    return df

def gen_get_perms(x,**kwargs):
    """ cut down each ballot to a (partial) permutation of the candidates
    rules according to:
      https://legislature.maine.gov/legis/bills/bills_127th/billtexts/IB000201.asp
    
    truncate as soon as two undervotes or an overvote
    remove occurrences of a candidate after the first appearance
    remove undervotes
    results are placed in a dictionary with keys given a string representing
      the partial permutations and values representating the multiplicity
    
    So, for example:
    ['undervote','Bond','Bond','overvote','Hoar'] -> 'Bond'
    ['Golden','Golden','Golden','Hoar','Golden'] -> 'Golden_Hoar'
    ['undervote','undervote','Poliquin','Bond','Golden'] -> ''
    """
    
    # collect entries of ballot in an array
    a = [x[i] for i in range(1,kwargs['numrks']+1)]
    
    # truncate as soon as we have an overvote
    if 'overvote' in a:
        a = a[:a.index('overvote')] # index will find the first occurrence
        
    # truncate once we have two successive undervotes
    isdone = False
    for i in range(len(a)-1):
        if (not isdone) and a[i] == a[i+1] and a[i] == 'undervote':
            a = a[:i+1]
            isdone = True
            
    # if an entry is repeated keep only first occurrence
    isdone = False
    keep = [True for x in range(len(a))]
    for i in range(1,len(a)):
        for j in range(i):
            if a[i] == a[j]:
                keep[i] = False
    inds = list(filter(lambda i: keep[i], range(len(a))))
    a = list(map(lambda y: a[y], inds))
    
    # filter out any remaining undervotes
    a = list(filter(lambda x: x != 'undervote', a))
    
    perm_dict = kwargs['pdict']

    # turn each partial permutation into a key to index a dictionary that 
    # keeps track of the number of ballots with each permutation type
    # print("a: ",a)
    astr = '_'.join(a)
    if astr in perm_dict.keys():
        perm_dict[astr] += 1
    else:
        perm_dict[astr] = 1

def process_election_data(ed):
    """ process data from raw files to JSON output
    """
    df = gen_collect_data(flist=ed['data_files'],name_dict=ed['name_dict'],\
                          drop_cols=ed['drop_cols'],col_renamings=ed['col_renamings'])
    perm_dict = dict()
    df.apply(gen_get_perms, axis=1, numrks=ed['numrks'], pdict=perm_dict)

    fn = '/home/gswarrin/research/Active_proj/accumulation-chart/' + ed['outfile'] + '.csv'
    f = open(fn, "w")
    for k in list(perm_dict.keys()):
        f.write("%d,%s\n" % (perm_dict[k],re.sub('_',',',k)))
    f.close()

##################################################################################
# for pre-2019 SF data - which is stored completely differently
##################################################################################

def read_ballots(fn):
    bd = dict() # dict of ballots organized by voterid
    d = dict()
    rankd = dict()
    tot_ballots = 0
    with open('/home/gswarrin/research/accumulation-chart/data/' + fn, 'r') as inp_file:
        ballots  = inp_file.readlines()
        for ballot in ballots:
            ballot = ballot.rstrip()
            contest_id = ballot[:7]
            voter_id = ballot[7:16]
            serial_num = ballot[16:23]
            tally_type = ballot[23:26]
            precinct = ballot[26:33]
            rank = ballot[33:36]
            candidate = ballot[36:43]
            over_vote = (ballot[43] == '1')
            under_vote = (ballot[44] == '1')

            if contest_id != "0000020": # this is the mayoral election
                continue

            cand = sf_name_dict[candidate]
            # if cand == 'Unknown':
            #     continue

            if voter_id in bd.keys():
                bd[voter_id]['rankings'].append([int(rank),cand])
            else:
                bd[voter_id] = {'rankings': [[int(rank),sf_name_dict[candidate]]], 'under': under_vote, 'over': over_vote}

    rankd = dict()
    for k in bd.keys():
        chosen_ranks = list(map(lambda x: x[0], bd[k]['rankings']))
        for ii in range(len(chosen_ranks)):
            for jj in range(ii+1,len(chosen_ranks)):
                if chosen_ranks[ii] == chosen_ranks[jj]:
                    print("repeated rank!",k,bd[k])
        tmp = []
        for i in range(1,3+1):
            if i in chosen_ranks:
                pson = bd[k]['rankings'][chosen_ranks.index(i)][1]
                if pson != 'Unknown':
                    tmp.append(pson)
        mystr = ','.join(tmp)

        if bd[k]['over'] and (not bd[k]['under']):
            continue
        if mystr in rankd.keys() and mystr != '':
            rankd[mystr] += 1
        else:
            rankd[mystr] = 1

    for k in rankd.keys():
        print("%d,%s" % (rankd[k],k))

    # to fix
    fn = '/home/gswarrin/research/accumulation-chart/' + ed['outfile'] + 'csv'
    f = open(fn, "w")
    for k in list(perm_dict.keys()):
        f.write("%d,%s\n" % (perm_dict[k],re.sub('_',',',k)))
    f.close()

# have 92197 instead of 92121
# Old san fran?
# read_ballots('20180627_ballotimage.txt',ed)

# 11.10.19
process_election_data(sanfran_2019_DA_elec_dict)
