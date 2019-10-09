#!/usr/bin/env python
# coding: utf-8

# Code for working with RCV data
# November 30, 2018
# Gregory S. Warrington

# get_ipython().magic(u'matplotlib inline')
import pandas as pd
import re
import csv

import math
import numpy as np

homepath = '/home/gswarrin/research/gerrymander/accumulation-chart/'
    
##########################################################################################
# code for converting dataframe of ballots into appropriate format for accumulation charts
##########################################################################################

def make_dict_from_csv(fn):
    """
    convert listing of partial permutations with multiplicity into dict
    input file should have one line for each "type" of ballot
    - first entry is number of ballots of this type
    - successive entries are ranked candidates (no non-votes or repeats)
    - all candidates are comma-separated
    """
    d = dict()
    for x in open(fn,'r'):
        line = x.rstrip().split(',')
        lbl = '_'.join(line[1:])
        if lbl not in d.keys():
            d[lbl] = int(line[0])
        else:
            d[lbl] += int(line[0])
        # print("%d -- %s" % (int(line[0]),lbl))
    return d

def count_round(d,verbose=True):
    """ add votes in for given round
    d is a dictionary with the reduced ballots as keys and counts as values
    """
    cand_votes_dict = dict()
    for k in d.keys():
        v = int(d[k])
        cands = k.split('_')
        if len(cands[0]) > 0:
            if cands[0] in cand_votes_dict.keys():
                cand_votes_dict[cands[0]] += v
            else:
                cand_votes_dict[cands[0]] = v
    # display the results of the round
    if verbose:
        for k in cand_votes_dict.keys():
            print(cand_votes_dict[k],k)
    return cand_votes_dict

def find_loser(cand_votes_dict):
    """ return the candidate with the fewest votes
    """
    min_cand = ''
    minv_votes = 0
    for k in cand_votes_dict.keys():
        if min_cand == '' or cand_votes_dict[k] < min_votes:
            min_cand = k
            min_votes = cand_votes_dict[k]
    return min_cand

def remove_loser(perm_dict,loser,verbose=False):
    """ remove the loser from the ballots
    """
    new_dict = dict()
    exhausted = 0
    for k in perm_dict.keys():
        cands = k.split('_')
        newcands = '_'.join(filter(lambda x: x != loser, cands))
        if len(newcands) > 0:
            newk = newcands
        else:
            exhausted += perm_dict[k]
            newk = ''
            
        if newk in new_dict.keys():
            new_dict[newk] += perm_dict[k]
        else:
            new_dict[newk] = perm_dict[k]
            
    if verbose:
        print("exhausted: ",exhausted)
    return new_dict

def print_dict(d):
    """
    print out partial permutations along with multiplicties
    """
    print("----------------------------------------------2")
    for k in d.keys():
        print(d[k],k)
    print()
    
def advance_round(d,verbose=True):
    """ Count number of votes for each candidate and remove candidate with fewest
    Return new dictionary with that candidate removed
    """
    # if verbose:
    #     print_dict(d)
        
    cv_dict = count_round(d)
    loser = find_loser(cv_dict)
    
    if len(cv_dict.keys()) >= 2:
        new_dict = remove_loser(d,loser)
        if verbose:
            # print_dict(d)
            print("loser: ",loser)
            print()
            # print_dict(new_dict)
        return loser,new_dict
    else:
        print("\nIt is over")
        # print_dict(cv_dict)
        return loser,False

def get_pedigrees(orig_d,losers,makecsv=False,csvfn=''):
    """
    list pedigrees for each candidate
    """
    if makecsv:
        csvfile = open('/home/gswarrin/research/accumulation-chart/' + csvfn + '.csv', mode='w')
        csv_writer = csv.writer(csvfile, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow(['Ballot','Round','Segment','Number','Ranks'])
    
    idx = 0
    for i,l in enumerate(losers):
        print("Candidate %d %s" % (i+1,l))
        totcnt = 0
        for j in range(i+1):
            if j == 0:
                print("  Round %d (Nobody has been eliminated)" % (j+1))
            else:
                print("  Round %d (%s was just eliminated)" % (j+1,losers[j-1]))
            # filter out all candidates except current and already eliminated
            # only list votes that include loser from previous round (i.e., now contributors)
            tmpd = dict()
            for k in orig_d.keys():
                arr = k.split('_')
                if l in arr:
                    # we check that everyone ranked higher has already been eliminated
                    okay = True
                    for a in range(arr.index(l)):
                        if arr[a] not in losers[:j]:
                            okay = False
                    # we check that candidate who was just eliminated appears
                    if okay and (j == 0 or losers[j-1] in arr[:arr.index(l)]):
                        narr = '_'.join(arr[:arr.index(l)+1])
                    else:
                        narr = ''
                # narr = list(filter(lambda x: x in losers[:j+1]+losers[i:i+1], arr))
                # narrk = '_'.join(narr)
                    if okay and narr != '':
                        if narr in tmpd:
                            tmpd[narr] += orig_d[k]
                            # print("   Adding more ... %d %s %s" % (orig_d[k],narr,k))
                        else:
                            tmpd[narr] = orig_d[k]
                            # print("   Adding ... %d %s %s" % (orig_d[k],narr,k))
            #  Total number of votes when eliminated
            for tmpk in tmpd.keys():
                print("    %6d %s" % (tmpd[tmpk],tmpk))
                if makecsv and (i != len(losers)-1 or j < i):
                    csv_writer.writerow([idx,l,j+1,tmpd[tmpk],tmpk.replace('_',',')])
                idx = idx + 1
                # don't want to include votes from second-place candidates
                if i < len(losers)-1 or j < i:
                    totcnt += tmpd[tmpk]
            if j == i:    
                print("     Total at losing %6d" %  (totcnt))
    if makecsv:
        csvfile.close()
        
def evaluate_election(orig_d):
    """
    determine election results
    specifically, tells us which candidate gets eliminated in each round
    """
    d = orig_d
    round = 0
    losers = []
    while d != False:
        round += 1
        print("Round %d" % (round))
        for k in d.keys():
            print("%s,%s" % (d[k],','.join(k.split('_'))))
        # print_dict(d)
        l,d = advance_round(d,True)
        losers.append(l)
    return losers
        
    
#################################################################################################
# code for each specific election we're working with
#################################################################################################

# evaluate_election(perm_dict)
# Burlington
# bfpd = make_dict_from_csv('/home/gswarrin/research/gerrymander/rcv/burlington-2009-votes.csv')
# bfp_losers = evaluate_election(bfpd)
# get_pedigrees(bfpd,bfp_losers,makecsv=True,csvfn='BFP-csv-d3')

# San Francisco
# sfod = make_dict_from_csv('/home/gswarrin/research/accumulation-chart/SFO_2018_mayoral.csv')
# sfo_losers = evaluate_election(sfod)
# get_pedigrees(sfod,sfo_losers,makecsv=True,csvfn='SFO-csv-d3')

# me_losers = evaluate_election(perm_dict)
# get_pedigrees(perm_dict,me_losers,makecsv=True,csvfn='Maine-csv-d3')

# Minnesota
# mnd = make_dict_from_csv('/home/gswarrin/research/accumulation-chart/mn-output.csv')
# mn_losers = evaluate_election(mnd)
# get_pedigrees(mnd,mn_losers,makecsv=True,csvfn='MN-csv-d3')

# Maine primary
med = make_dict_from_csv('/home/gswarrin/research/accumulation-chart/meprim-output.csv')
med_losers = evaluate_election(med)
get_pedigrees(med,med_losers,makecsv=True,csvfn='MEPrim-csv-d3')
    
# for k in perm_dict.keys():
#     print("%s,%s,%s" % (k,perm_dict[k],','.join(k.split('_'))))
bfpd = make_dict_from_csv('/home/gswarrin/research/gerrymander/rcv/burlington-2009-votes.csv')

###############################################################################################
# place data in 
# df = pd.read_csv('MEPrim-csv-d3.csv',sep='\t',dtype={'Number':np.int32})
df = pd.read_csv('Poll-c3-for-plotting.csv',sep='\t',dtype={'Number':np.int32})
print(df.to_json(orient='records'))
