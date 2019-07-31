#!/usr/bin/env python
# coding: utf-8

# In[20]:


# Code for working with RCV data
# November 30, 2018
# Gregory S. Warrington

get_ipython().magic(u'matplotlib inline')
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon
import matplotlib.pyplot as plt
import re

import math

homepath = '/home/gswarrin/research/gerrymander/rcv/'

data_files = ['AUXCVRProofedCVR95RepCD2.xlsx','Nov18CVRExportFINAL2.xlsx','RepCD2-8final.xlsx',              'UOCAVA-AUX-CVRRepCD2.xlsx','Nov18CVRExportFINAL1.xlsx','Nov18CVRExportFINAL3.xlsx',              'UOCAVA2CVRRepCD2.xlsx','UOCAVA-FINALRepCD2.xlsx']

name_dict = {'.*Golden.*':'Golden',            '.*Poliquin.*':'Poliquin',            '.*Bond.*':'Bond',            '.*Hoar.*':'Hoar',            'undervote':'undervote'}

def collect_data(flist):
    df = pd.DataFrame()
    for fn in flist:
        tmpdf = pd.read_excel(homepath + fn)
        # clean up column headings
        tmpdf = tmpdf.rename(columns=lambda x: re.sub('Rep. to Congress','',x))
        tmpdf = tmpdf.rename(columns=lambda x: re.sub('District 2','',x))
        tmpdf = tmpdf.rename(columns=lambda x: re.sub(' ','',x))
        # I don't use these
        tmpdf = tmpdf.drop(columns=['BallotStyle','Precinct'])
        df = pd.concat([df,tmpdf])
    # Put candidate names in a simpler format
    df = df.replace(name_dict,regex=True)
    return df

# read in the individual votes
df = collect_data(data_files)
# to illustrate format
df.tail()


# In[18]:


numrks = 5

def get_perms(x):
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
    a = [x[i] for i in range(1,numrks+1)]
    
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
    
    # turn each partial permutation into a key to index a dictionary that 
    # keeps track of the number of ballots with each permutation type
    astr = '_'.join(a)
    if astr in perm_dict.keys():
        perm_dict[astr] += 1
    else:
        # print a sample ballot leading to a given partial permutation
        # print(astr,b)
        perm_dict[astr] = 1


# dictionary whose keys are partial permutations and values are number of ballots
# with that partial permutation
# perm_dict = dict()
# compute the partial permutations and put them in perm_dict
# df.apply(get_perms, axis=1)
    


# In[60]:


import csv

def count_round(d,verbose=True):
    """ add votes in for given round
    d is a dictionary with the reduced ballots as keys and counts as avlues
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
        
def make_dict_from_csv(fn):
    """
    convert listing of partial permutations with multiplicity into dict
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
    


# In[13]:


# for k in perm_dict.keys():
#     print("%s,%s,%s" % (k,perm_dict[k],','.join(k.split('_'))))
bfpd = make_dict_from_csv('/home/gswarrin/research/gerrymander/rcv/burlington-2009-votes.csv')

def list_some_votes(d,a,b,c):
    """
    list number of votes satisfying a certain property
    """
    cnt = 0
    for k in d.keys():
        tup = k.split('_')
        if a in tup and b in tup:
            if tup.index(a) < tup.index(b) and (c not in tup or (tup.index(b) < tup.index(c))):
                print("%s %s" % (d[k],k))
                cnt = cnt + d[k]
    print("%d" % (cnt))
                
list_some_votes(bfpd,'Montroll','Wright','Kiss')


# In[195]:


# code for playing around with the patterns of voting that arise
# not really functional at the moment

pat_dict = dict() # patterns of votes
d = dict()        # patterns of 1's and -'s'

def get_pat(x):
    """ truncate as soon as illegal, but don't excise undervotes
    """
    a = [x[1],x[2],x[3],x[4],x[5]]
    b = [x[1],x[2],x[3],x[4],x[5]]
    # truncate as soon as we have an overvote
    if 'overvote' in a:
        for i in range(a.index('overvote'),len(a)):
            a[i] = '-'
            
    # truncate once we have two equal in a row
    # not sure why this isn't covered by below loop, but whatever
    for i in range(len(a)-1):
        if a[i] == a[i+1] and (a[i] != 'undervote'):
            for j in range(i+1,len(a)):
                a[j] = '-'
    # if x[0] == 223572:
    #     print(a)
    isdone = False
    for i in range(len(a)-1):
        for j in range(i+1,len(a)):
            if (not isdone) and (a[i] == a[j]) and (a[i] != 'undervote'):
                for k in range(j,len(a)):
                    a[k] = '-'
                isdone = True
                   
    for i in range(len(a)):
        if a[i] not in ['undervote','-']:
            a[i] = '1'
        if a[i] == 'undervote':
            a[i] = '-'
    # a = list(filter(lambda x: x != 'undervote', a))
    astr = ''.join(a)
    if astr == '1----':
        if '_'.join(b) in d.keys():
            d['_'.join(b)] += 1
        else:
            d['_'.join(b)] = 1
        # print(x)

    if astr in pat_dict.keys():
        pat_dict[astr] += 1
    else:
        print(astr,b)
        pat_dict[astr] = 1
    # print(a)

name_pat_dict = dict()
def get_name_pat(x):
    """ replace names with 1's, blanks with underscores, and overvotes with X's
    don't worry about legality or where it would be truncated.
    """
    a = [x[1],x[2],x[3],x[4],x[5]]
    for i in range(len(a)):
        if a[i] in ['Bond','Hoar','Poliquin','Golden']:
            a[i] = '1'
        elif a[i] in ['overvote']:
            a[i] = 'X'
        elif a[i] in ['undervote']:
            a[i] = '-'
    
    # a = list(filter(lambda x: x != 'undervote', a))
    astr = ''.join(a)
    
    if astr in name_pat_dict.keys():
        name_pat_dict[astr] += 1
    else:
        # print(astr,b)
        name_pat_dict[astr] = 1
    # print(a)

df.apply(get_name_pat, axis=1)
for k in name_pat_dict.keys():
    print(name_pat_dict[k],k)


# In[1]:


# import pysankey as sankey
# df = pd.DataFrame()
# df['']

from floweaver import *

flows = pd.read_csv('/home/gswarrin/research/gerrymander/rcv/test_elec.csv')
flows

# Set the default size to fit the documentation better.
size = dict(width=570, height=300)

nodes = {
    'Round1': ProcessGroup(['Wright','Kiss','Montroll','Smith']),
    'Round3': ProcessGroup(['Wright','Kiss']),
}


# In[ ]:


{
  "nodes": [
    {
      "id": "Wright1",
      "title": "Wright"
    },
    {
      "id": "Kiss1",
      "title": "Kiss"
    },
    {
      "id": "Montroll1",
      "title": "Montroll"
    },
    {
      "id": "Smith1",
      "title": "Smith"
    },
    {
      "id": "Wright2",
      "title": "Wright"
    },
    {
      "id": "Kiss2",
      "title": "Kiss"
    },
    {
      "id": "Montroll2",
      "title": "Montroll"
    },
    {
      "id": "Wright3",
      "title": "Wright"
    },
    {
      "id": "Kiss3",
      "title": "Kiss"
    }
     
  ],
  "links": [
    {
      "source": "Wright1",
      "target": "Wright2",
      "value": 2951,
      "type": "1"
    },
    {
      "source": "Kiss1",
      "target": "Kiss2",
      "value": 2585,
      "type": "2"
    },
    {
      "source": "Montroll1",
      "target": "Montroll2",
      "value": 2063,
      "type": "3"
    },
    {
      "source": "Smith1",
      "target": "Wright2",
      "value": 343,
      "type": "1"
    },
    {
      "source": "Smith1",
      "target": "Kiss2",
      "value": 396,
      "type": "2"
    },
    {
      "source": "Smith1",
      "target": "Montroll2",
      "value": 491,
      "type": "3"
    },
    {
      "source": "Montroll2",
      "target": "Wright3",
      "value": 767,
      "type": "1"
    },
    {
      "source": "Montroll2",
      "target": "Kiss3",
      "value": 1332,
      "type": "2"
    }

  ],
  "groups": [
    {
      "id": "g",
      "nodes": [
        "a",
        "b"
      ],
      "title": "Group of nodes in top band"
    }
  ],
  "order": [
    [
      [
        "Wright1",
        "Kiss1",
          "Montroll1",
          "Smith1"
      ],
      []
    ],
    [
      [
        "Wright2",
          "Kiss2",
          "Montroll2"
      ],
        []
    ],
    [
      [
        "Wright3",
        "Kiss3"
      ],
      []
    ]
  ]
}


# In[ ]:





# In[39]:


# read in MN data

mn_name_dict = {',':';'}

def mn_collect_data(flist):
    df = pd.DataFrame()
    for fn in [flist]:
        tmpdf = pd.read_excel('/home/gswarrin/research/accumulation-chart/' + fn)
        # clean up column headings
        tmpdf = tmpdf.rename(columns=lambda x: re.sub(' CHOICE MAYOR MINNEAPOLIS','',x))
        # tmpdf = tmpdf.rename(columns=lambda x: re.sub('District 2','',x))
        # tmpdf = tmpdf.rename(columns=lambda x: re.sub(' ','',x))
        # I don't use these
        # tmpdf = tmpdf.drop(columns=['Precinct'])
        df = pd.concat([df,tmpdf])
    # Put candidate names in a simpler format
    df = df.replace(mn_name_dict,regex=True)
    return df

# read in the individual votes
mndf = mn_collect_data('2013-mayor-cvr.xlsx')
# to illustrate format
mndf.tail()


# In[22]:


df.tail()


# In[40]:


def mn_get_perms(x):
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
    a = [x[i] for i in range(1,3+1)]
    
    print(a)
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
    
    # turn each partial permutation into a key to index a dictionary that 
    # keeps track of the number of ballots with each permutation type
    astr = '_'.join(a)
    if astr in perm_dict.keys():
        perm_dict[astr] += 1
    else:
        # print a sample ballot leading to a given partial permutation
        # print(astr,b)
        perm_dict[astr] = 1

# dictionary whose keys are partial permutations and values are number of ballots
# with that partial permutation
perm_dict = dict()
numrks = 3
# compute the partial permutations and put them in perm_dict
mndf.apply(mn_get_perms, axis=1)


# In[41]:


f = open('/home/gswarrin/research/accumulation-chart/mn-output.csv', "w")
for k in list(perm_dict.keys()):
    f.write("%d,%s\n" % (perm_dict[k],re.sub('_',',',k)))
f.close()


# In[57]:


# read in MN data

meprim_name_dict = {',':';',
                    'undervote': 'undervote',
       'Cote; Adam Roland': 'Adam Cote',
       'Sweet; Elizabeth A.': 'Elizabeth Sweet',
       'Mills; Janet T.': 'Janet Mills',
       'Russell; Diane Marie': 'Diane Russell',
       'Dion; Mark N.': 'Mark Didn',
       'Eves; Mark W.': 'Mark Eves',
       'Dion; Donna J.': 'Donna Dion',
       'overvote': 'overvote',
       'Write-in': 'WriteIn'};

def meprim_collect_data(flist):
    df = pd.DataFrame()
    for fn in [flist]:
        tmpdf = pd.read_excel('/home/gswarrin/research/accumulation-chart/' + fn)
        # clean up column headings
        tmpdf = tmpdf.rename(columns=lambda x: re.sub('DEM Governor ','',x))
        tmpdf = tmpdf.rename(columns=lambda x: re.sub(' Choice','',x))
        # tmpdf = tmpdf.rename(columns=lambda x: re.sub('District 2','',x))
        # tmpdf = tmpdf.rename(columns=lambda x: re.sub(' ','',x))
        # I don't use these
        tmpdf = tmpdf.drop(columns=['Ballot Style','Precinct'])
        df = pd.concat([df,tmpdf])
    # Put candidate names in a simpler format
    df = df.replace(meprim_name_dict,regex=True)
    return df

# read in the individual votes
mepdf = meprim_collect_data('2018-maine-governor-primary-dem-cvr.xlsx')
# to illustrate format
mepdf.tail()
print(mepdf.columns)
# mepdf['1st'].summary()


# In[58]:


def meprim_get_perms(x):
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
    a = [x[i] for i in range(1,8+1)]
    
    print(a)
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
    
    # turn each partial permutation into a key to index a dictionary that 
    # keeps track of the number of ballots with each permutation type
    astr = '_'.join(a)
    if astr in perm_dict.keys():
        perm_dict[astr] += 1
    else:
        # print a sample ballot leading to a given partial permutation
        # print(astr,b)
        perm_dict[astr] = 1

# dictionary whose keys are partial permutations and values are number of ballots
# with that partial permutation
perm_dict = dict()
numrks = 8
# compute the partial permutations and put them in perm_dict
mepdf.apply(meprim_get_perms, axis=1)


# In[59]:


f = open('/home/gswarrin/research/accumulation-chart/meprim-output.csv', "w")
for k in list(perm_dict.keys()):
    f.write("%d,%s\n" % (perm_dict[k],re.sub('_',',',k)))
f.close()


# In[73]:


arr = [[3,3.58e-2],[4,5.14e-5],[5,7.29e-10],[6,8.14e-17],[7,3.9e-26]]
plt.semilogy([x[0] for x in arr],[x[1] for x in arr])
# 3.3e-8


# In[77]:


# plt.plot([0.142578125, 1.30078125, 2.39453125, 2.55859375, 2.064453125, 1.8203125, 0.0])
# plt.plot([56.80664061540684, 57.503906240289105, 58.75195311507834, 58.89453124005426, 58.32812499014992, 58.374999990142, 56.089843740527904])
plt.plot([236.66992183503268, 239.28124995959172, 241.66406245918932, 243.43749995888987, 244.65429683368438, 245.4199218335551, 246.02539058345286, 246.21679683342052, 246.13671870843405, 245.8789062084776, 245.09570308360983, 243.84374995882126, 242.0468749591247])


# In[78]:


plt.plot([56.80664061540684, 57.503906240289105, 58.75195311507834, 58.89453124005426, 58.32812499014992, 58.374999990142, 56.089843740527904])


# In[79]:


plt.plot([0.   2.5  4.72 6.4  7.72 8.47 8.94 9.11 9.17 8.9  8.14 6.99 5.37])


# In[88]:


n4 = [ 0.00, 3.18, 5.56, 7.28, 8.47, 9.19, 9.77, 10.03, 9.91, 9.50, 8.95, 7.91, 6.27, ]


# In[87]:


# plt.plot([ 0.44, 1.21, 2.32, 2.54, 2.07, 1.89, 0.00, ])
# plt.plot([ 0.23, 1.03, 2.19, 2.39, 1.95, 1.76, 0.00, ])
# plt.plot([ 0.52, 1.37, 2.41, 2.53, 2.06, 1.80, 0.00, ])
plt.plot([ 0.38, 1.37, 2.41, 2.56, 2.13, 1.92, 0.00, ])


# In[92]:


n5 = [ 0.00, 3.55, 6.41, 9.52, 11.50, 13.08, 15.12, 16.43, 17.58, 18.50, 19.33, 19.82, 20.20, 20.35, 20.34, 19.97, 19.58, 18.90, 17.82, 16.33, 14.09, ]


# In[93]:


plt.plot(n4,[x/2 for x in n5])
# n=6, but only 1.001
# plt.plot([ 0.00, 28.09, 38.12, 41.83, 45.04, 47.35, 49.70, 51.69, 53.80, 55.37, 56.55, 58.05, 59.22, 60.40, 61.23, 62.07, 62.87, 63.53, 64.07, 64.35, 64.72, 64.96, 65.00, 64.81, 64.54, 64.09, 63.42, 62.49, 61.28, 59.32, 56.87, ])


# In[91]:


n5


# In[ ]:




