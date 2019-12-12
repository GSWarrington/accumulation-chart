# code for processing multi-winner election according to cambridge rules

import numpy as np
import csv
import pandas as pd
import random
import matplotlib.pyplot as plt

council_dict = {'C01': "Benjamin",\
             'C02': "Burgin",\
             'C03': "Carlone",\
             'C04': "D'Ambrosio",\
             'C05': "Devereux",\
             'C06': "Gebru",\
             'C07': "Harding-Jr.",\
             'C08': "Kelley",\
             'C09': "Lenke",\
             'C10': "Levy",\
             'C11': "Mallon",\
             'C12': "McGovern",\
             'C13': "Moree",\
             'C14': "Musgrave",\
             'C15': "Okamoto",\
             'C16': "Pillai",\
             'C17': "Santos",\
             'C18': "Siddiqui",\
             'C19': "Simmons",\
             'C20': "Sivongxay",\
             'C21': "Sutton",\
             'C22': "Tierney",\
             'C23': "Toner",\
             'C24': "Toomey-Jr.",\
             'C25': "Volmar",\
             'C26': "Zondervan",\
             'WI01': "Write-In"}

school_dict = {'C01': "Bowman",\
               'C02': "Cronin",\
               'C03': "Crutchfield",\
               'C04': "Dexter",\
               'C05': "Fantini",\
               'C06': "Kadete",\
               'C07': "Kelly",\
               'C08': "Kimbrough",\
               'C09': "MacArthur",\
               'C10': "Mitros",\
               'C11': "Nolan",\
               'C12': "Weinstein",\
               'WI01': "Write-In-01",\
               'WI02': "Write-In-02",\
               'WI03': "Write-In-03",\
               'WI04': "Write-In-04",\
               'WI05': "Write-In-05",\
               'WI06': "Write-In-06"}

pathd = dict()
# Not sure of precinct order... I think I can figure it out from the piles
# pathd['1997_Council_Names' ] = '1997/Council/FINPILES.OUT'
# pathd['1997_Council_Names' ] = '1997/Council/FINPILES.OUT'

pathd['2017_Council_Names' ] = '2017/Council/Council Order Final Piles Report.txt'
pathd['2017_Council_Ballots' ] = '2017/Council/Council2017FinalOrder.prm'
pathd['2017_School_Names' ] = '2017/School/School Order Final Piles Report.txt'
pathd['2017_School_Ballots' ] = '2017/School/School2017FinalOrder.prm'

# Don't see any obvious problems - both look stable
pathd['2015_Council_Names' ] = '2015/Council/Council Final Piles Report.txt'
pathd['2015_Council_Ballots' ] = '2015/Council/council_single_file_ballot data.prm'
pathd['2015_School_Names' ] = '2015/School/School Final Piles Report.txt'
pathd['2015_School_Ballots' ] = '2015/School/school_single_file_ballot_data.prm'

# Don't see any obvious problems - both look stable
pathd['2013_Council_Names' ] = '2013/Council/Final/Council Final Piles Report.txt'
pathd['2013_Council_Ballots' ] = '2013/Council/Final/CouncilFinalOrder.txt'
pathd['2013_School_Names' ] = '2013/School/Final/School Final Piles Report.txt'
pathd['2013_School_Ballots' ] = '2013/School/Final/SchoolFinalOrder.txt'

# Something is wrong (at least with School one --- too many candidates)
pathd['2011_Council_Names' ] = '2011/Council/Final/Council Final Piles Report.txt'
pathd['2011_Council_Ballots' ] = '2011/Council/Final/myRandomOrder.prm'
pathd['2011_School_Names' ] = '2011/School/Final/School Final Piles Report.txt'
pathd['2011_School_Ballots' ] = '2011/School/Final/myRandomOrder.prm'

# redid randomly to include Final and Tuesday folders
pathd['2009_Council_Names' ] =   '2009/Council/Final/Council Final Piles Report.txt'
pathd['2009_Council_Ballots' ] = '2009/Council/Final/myRandomOrder.prm'
pathd['2009_School_Names' ] =    '2009/School/Final/School Final Piles Report.txt'
pathd['2009_School_Ballots' ] =  '2009/School/Final/myRandomOrder.prm'

pathd['2007_Council_Names' ] =   '2007/Council/Final/Council Final Piles Report.txt'
pathd['2007_Council_Ballots' ] = '2007/Council/Final/myRandomOrder.prm'
pathd['2007_School_Names' ] =    '2007/School/Final/School Final Piles Report.txt'
pathd['2007_School_Ballots' ] =  '2007/School/Final/myRandomOrder.prm'

pathd['2005_Council_Names' ] =   '2005/Council/Final/Council Final Piles Report.txt'
pathd['2005_Council_Ballots' ] = '2005/Council/Final/myRandomOrder.prm'
pathd['2005_School_Names' ] =    '2005/School/Final/School Final Piles Report.txt'
pathd['2005_School_Ballots' ] =  '2005/School/Final/myRandomOrder.prm'

pathd['2003_Council_Names' ] =   '2003/Council/Final/Council Final Piles Report.txt'
pathd['2003_Council_Ballots' ] = '2003/Council/Final/myRandomOrder.prm'
pathd['2003_School_Names' ] =    '2003/School/Final/School Final Piles Report.txt'
pathd['2003_School_Ballots' ] =  '2003/School/Final/myRandomOrder.prm'

# 000703-00-0031, 10010,           010,         1)           C18[1],C05[2]
# BALLOT-ID-ALPHA BALLOT-TOP-ALPHA IGNORE-FIELD IGNORE-FIELD RANKINGS-ALPHA

homepath = '/home/gswarrin/research/Active_proj/accumulation-chart/'

def get_threshold(votes,seats):
    """ compute quota needed based on total number of votes and number of seats
    """
    return int(votes/(seats+1))+1

def read_cambridge_data(fn):
    """
    """
    f = open(homepath + 'data/cambridge/' + fn, "r")
    ans = []
    for line in f:
        l = line.rstrip()
        if ' ' in l:
            a,b = l.split(' ')
            cands = b.split(',')
            ans.append([a,cands])
            print("blah: ",ans[-1])
    return ans

def cambridge_get_perms(arr):
    """ cut down each ballot to a (partial) permutation of the candidates
    rules according to:
    
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
    
    ans = []
    for z in arr:
        a = list(filter(lambda y: y != '', z[1]))
        a = [x[:x.index('[')] for x in a]

        # if an entry is repeated keep only first occurrence
        isdone = False
        keep = [True for x in range(len(a))]
        for i in range(1,len(a)):
            for j in range(i):
                if a[i] == a[j]:
                    keep[i] = False
        inds = list(filter(lambda i: keep[i], range(len(a))))
        a = list(map(lambda y: a[y], inds))
        b = []
        for i in range(len(a)):
            if '=' in a[i]:
                # b.extend(a[i].split('='))
                i = len(a) # bail out when two candidates ranked equally
            else:
                b.append(a[i])

        # WARNING
        if len(b) > 0:
            ans.append([b,z[0]])
        # print("aaaa: ",z[0],b)

    return ans

############################################################################
# terminology
# perms - actual permutations on ballots cast
# rnd_ballots - [idx, list of remaining candidates on ballot] - not sure we need these indices...
# support = dict with most recently computed support for surviving candidates
# remaining_cands = list of remaining candidates
# 

# # function to count number for each candidate
# def make_ballots(perms):
#     """ append index onto beginning of each ballot
#     """
#     return [[i,perms[i]] for i in range(len(perms))]

# # function to count number for each candidate
# def count_support(ballots):
#     """ count support for each candidate
#     """
#     support = dict()
#     for x in ballots:
#         # empty ballot
#         if len(x[1]) == 0:
#             continue
#         cand = x[1][0]
#         if cand in support.keys():
#             support[x] += 1
#         else:
#             support[x] = 1
#     return support

# allocate ballots the first time
def very_first_round(ballots,quota):
    """ just do initial allocations, nothing fancy
    process ballots
    if any candidate gets pushed over threshold, mark as elected
    """
    counts = dict()
    elected = []
    new_ballots = []

    # do an initial sorting of ballots
    for b in ballots:
        # if nobody on the ballot then just ignore
        if len(b[0]) == 0:
            continue
        new_ballots.append([b[0],b[0],b[1]])

        if b[0][0] in counts.keys():
            counts[b[0][0]] += 1
            if counts[b[0][0]] >= quota and b[0][0] not in elected:
                elected.append(b[0][0])
        else:
            counts[b[0][0]] = 1
        for k in range(1,len(b[0])):
            if b[0][k] not in counts.keys():
                counts[b[0][k]] = 0
    # print_counts(counts)

    return new_ballots, counts, elected

# allocate ballots the first time
def reallocate(ballots,counts,inelig,quota,cand,round,cntmoves,extra=False,verbose=False):
    """ reallocate votes from a given candidate (who has been eliminated)
    inelig are candidates we don't want to give more votes to
    candidates can never get more than quota from this function
    """
    N = len(ballots) # modulus since we might be wrapping around
    arg = 0
    incr = dict()
    for k in counts.keys():
        incr[k] = 0

    # try to transfer every n-th vote
    if extra:
        n = int(np.round(counts[cand]*1.0/(counts[cand]-quota)))
        num = counts[cand]-quota # transfer only surplus (dealing with extra votes from first round)
    else:
        n = 1
        num = counts[cand] # transfer all votes for the candidate

    is_done = False
    transferred = 0 # number of votes that have been transferred (len(moved))
    idx = 0 # index in ballots array --- need to reset periodically to avoid wrapping
    cnt = 0 # running tally of how many votes we've seen for this candidate on this run
    moved = [] # list of indices we've actually moved
    ignore = [] # ones we've looked at
    tot_wraps = 0
    new_elected = []
    new_ballots = []
    
    # for z in ballots:
    #    print("duh: ",len(z),len(z[0]),len(z[1]))

    orig_ballots = [[[x for x in z[0]], [y for y in z[1]],z[2]] for z in ballots]

    while not is_done:
        # print("%d %s idx: %d cnt: %d tot: %d togo: %d ig: %d" % (num,cand,idx,cnt,tot_wraps,num-transferred,len(ignore)))

        if transferred == num:
            is_done = True

        # rule for which votes to look at is awkward (should use mod!)
        if idx >= N:
            tot_wraps += 1
            cnt = 0
            idx = tot_wraps

        # look at this ballot
        b = ballots[idx]

        # ignore this one because it's exhausted
        if len(b[0]) == 0:
            # print(idx,len(ignore),N,"Skipping: ",b)
            idx += 1
            continue

        # found another vote for this candidate
        if b[0][0] == cand:
            cnt += 1
        else: # not a vote so move index to next in array
            idx += 1
            continue

        if idx in ignore:
            idx += 1
            continue

        # try to reallocate this vote
        if (cnt % n) == 0: # and cnt >= n:
            if verbose:
                print("Considering: ",b[2])
            nbz = []
            for x in b[0]:
                # ignore ineligible candidates
                if x not in inelig:
                    nbz.append(x)
            if len(nbz) == 0:
                # if extra then we want to move it, so this won't work
                if extra:
                    idx += 1
                    ignore.append(idx)
                    continue
                # if moving everything, then need to mark as transferred
                else:
                   ignore.append(idx) # if exhausted don't need any more
                   cntmoves[idx] += 1
                   moved.append(idx) # mark as ballot already moved
                   counts[cand] -= 1
                   transferred += 1
                   idx += 1
                   continue

            cntmoves[idx] += 1
            moved.append(idx) # mark as ballot already moved
            ignore.append(idx)
            transferred += 1  # we've transferred one additional

            # ready to assign
            nb = [[z for z in nbz],[w for w in b[1]],b[2]]
            # update counts
            # by construction, nbz[0] can't be in inelig
            if nbz[0] in counts.keys():
                arg += 1
                counts[nbz[0]] += 1
                incr[nbz[0]] += 1
                counts[cand] -= 1
                if verbose:
                    print("Round: ",round,"Adding vote to",nbz[0],counts[nbz[0]])
                if counts[nbz[0]] >= quota:
                    if verbose:
                        print("Adding to new_elec in realloc: ",new_elected,counts[nbz[0]],nbz[0])
                    new_elected.append(nbz[0])
                    inelig.append(nbz[0])
            else:
                arg += 1
                counts[nbz[0]] = 1
                incr[nbz[0]] = 1
                counts[cand] -= 1
            # print("replacing: ", b)
            # print("with: ",nb)
            orig_ballots[idx] = nb
            new_ballots.append(nb)
            if len(nb) != 3 and verbose:
                print("asdf: ",nb)

        idx += 1

        # tot_wraps >= n flags that we've looked at everything and no more possibilities to transfer
        # when eliminating candidate, likely will be some exhausted ballots, so transferred will
        # never reach num
        if transferred >= num or len(ignore) >= N:
            is_done = True

    # for x in new_ballots[:3]:
    #    print("asdasfdasdfasdfasdf",x)
    # return

    # tacking onto end
    fin_ballots = [orig_ballots[i] for i in range(len(orig_ballots)) if i not in moved]

    # keeping within same order
    # fin_ballots = [orig_ballots[i] for i in range(len(orig_ballots))]

    if verbose:
        print("Arg: ",arg,len(moved))
    # onto end
    return fin_ballots + new_ballots, new_ballots, counts, new_elected, cntmoves, inelig, incr
    # keeping in same order
    # return fin_ballots, new_ballots, counts, new_elected, cntmoves, inelig, incr

#######################################################################################################
def new_process_ballots(csvfn,ballots,seats,cntmoves=[],rnd=False,verbose=True,makecsv=True):
    """
    """
    if cntmoves == []:
        cntmoves = [0 for x in ballots]

    # minimum required to win
    quota = get_threshold(len(ballots),seats)
    if verbose:
        print("Seats: ",seats,"votes: ",len(ballots)," quota: ",quota)

    if makecsv:
        csvfile = open('/home/gswarrin/research/Active_proj/accumulation-chart/' + csvfn + '.csv', mode='w')
        if verbose:
            print("csvfile: ",csvfile)
        csv_writer = csv.writer(csvfile, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow(['Ballot','Round','Segment','Number','Ranks'])
    
    elected = [] # candidates who have enough votes at this point
    row_order = [] # keep track of order in which rows should be displayed, along with what happened....
    inelig = [] # candidates we don't want to add any more votes to

    win_order = []
    lose_order = []

    ##################################################################
    # Initial allocation of ballots
    # 
    # all_ballots are just that at this point in the game
    round = 1
    all_ballots, counts, new_elected = very_first_round(ballots,quota)
    new_elected = sorted(new_elected, key=lambda x: counts[x], reverse=True)

    if verbose:
        print("Summary after initial counts!!!!")
        print_counts(counts)

    # from sample iteration, looks like can't reallocate to someone already above threshold
    for cand in new_elected:
        inelig.append(cand)  
        row_order.append([cand,"Elected",min(quota,counts[cand]),round])
        win_order.append([cand,"Elected",min(quota,counts[cand]),round])
        
    ##################################################################
    # Reallocate the votes from the elected candidates
    # 
    if rnd:
        random.shuffle(all_ballots)

    if verbose:
        print("New_elected after initial allocation: ",new_elected)
    for cand in new_elected:
        if verbose:
            print("---------------------------------------------------")
            print("Electing",cand," in round 1 with",counts[cand]," votes",len(all_ballots))

        elected.append(cand) # mark as elected so we don't add more votes to them
        # for x in all_ballots[:3]:
        #     print("gosh: ",x)
        all_ballots, ac_ballots, counts, super_new_elected, cntmoves, inelig, incr = \
            reallocate(all_ballots, counts, inelig, quota, cand, round, cntmoves, \
                       extra = True, verbose=verbose)
        for x in super_new_elected:
            row_order.append([x,"Elected",min(quota,counts[x]),round])
            win_order.append([x,"Elected",min(quota,counts[x]),round])
            elected.append(x)
            del counts[x]
        if verbose:
            print("After reallocating votes for",cand," in round 1 with",counts[cand]," votes")
            print_counts(counts,incr=incr)
        del counts[cand]

    # Write initial allocations to votes to file
    if makecsv:
        ac_cnt = generate_ac_data(csv_writer,all_ballots,round,0)

    if verbose:
        print("Summary after initial reallocations")
        print_counts(counts)

    ##################################################################
    # Deal with candidate who received fewer than 50 votes
    # 
    # see who got fewer than 50 votes
    round = len(row_order)+1

    to_eliminate = [k for k in list(counts.keys()) if counts[k] < 50]
    to_eliminate = sorted(to_eliminate, key=lambda x: counts[x], reverse=False)

    for cand in to_eliminate:
        inelig.append(cand)  # don't add more votes to them

    if rnd:
        random.shuffle(all_ballots)

    if len(elected) == seats:
        to_eliminate = []
    # realloc_ballots are those that have changed
    # all_ballots list everything (including the ones that have changed)
    # collect into def_ballots so bundlings of ballots are correct size
    eliminated = []
    def_ballots = []
    for cand in to_eliminate:
        if verbose:
           print("After before reallocating votes for",cand," in round ",round," with",counts[cand]," votes")
        # inelig.append(cand)  # don't add more votes to them
        eliminated.append(cand) # mark as eliminated
        if verbose:
            print("---------------------------------------------------")
            print("Eliminating",cand,"in round 1",len(all_ballots))
        if counts[cand] > 0:
            row_order.append([cand,"Lost",min(quota,counts[cand]),round])
            lose_order.append([cand,"Lost",min(quota,counts[cand]),round])
        all_ballots, ac_ballots, counts, new_elected, cntmoves, inelig, incr = \
            reallocate(all_ballots, counts, inelig, quota, cand, round, cntmoves, extra = False, verbose=verbose)
        def_ballots.extend(ac_ballots)
        for x in new_elected:
            row_order.append([x,"Elected",min(quota,counts[x]),round])
            win_order.append([x,"Elected",min(quota,counts[x]),round])
            elected.append(x)
        if verbose:
            print("After reallocating votes for",cand," in round ",round," with",counts[cand]," votes")
            print_counts(counts,incr=incr)
        del counts[cand]

    # Candidates with < 50 all at once
    if makecsv:
        ac_cnt = generate_ac_data(csv_writer,def_ballots,round,ac_cnt)

    if rnd:
        random.shuffle(all_ballots)

    ##################################################################
    # Eliminate candidates in the usual fashion
    # 
    round += 1
    while len(elected) < seats and \
          len(counts.keys()) > 0 and \
          (seats-len(elected) < len(counts.keys())):
        # if verbose:
        #     print("Len Electing: ",len(elected))

        cand = find_min_cand(counts)
        if verbose:
            if cand == None:
                print("No more candidates",elected,seats)
            print("=======================================================")
            print("Eliminating",cand," in round",round,len(all_ballots))

        inelig.append(cand)  # don't add more votes to them
        eliminated.append(cand) # mark as eliminated
        row_order.append([cand,"Lost",min(quota,counts[cand]),round])
        lose_order.append([cand,"Lost",min(quota,counts[cand]),round])
        all_ballots, ac_ballots, counts, new_elected, cntmoves, inelig, incr = \
            reallocate(all_ballots, counts, inelig, quota, cand, round, cntmoves, extra = False, verbose=verbose)
        if makecsv:
            ac_cnt = generate_ac_data(csv_writer,ac_ballots,round,ac_cnt)
        for x in new_elected:
            row_order.append([x,"Elected",min(quota,counts[x]),round+1])
            win_order.append([x,"Elected",min(quota,counts[x]),round+1])
            if verbose:
                print("Electing",x," in round",round,len(all_ballots))
            elected.append(x)
            del counts[x]
        if verbose:
            print("After reallocating votes for",cand," in round ",round," with",counts[cand]," votes")
            print_counts(counts,incr=incr)
        if cand in counts.keys():
            del counts[cand]

        round += 1
        if rnd:
            random.shuffle(all_ballots)

    # these didn't reach quota, but must elect
    for x in counts.keys():
        row_order.append([x,"Elected",min(quota,counts[x]),round])
        win_order.append([x,"Elected",min(quota,counts[x]),round])
        if verbose:
            print("Electing (last left)",x," in round",round,len(all_ballots))
        elected.append(x)
        
    win_order.reverse()
    row_order = lose_order + win_order
    if makecsv:
        print("var %s_order = %s;" % (csvfn,row_order))
    if makecsv:
        csvfile.close()
    # generate_ac_data(ballots,new_elected)

    if not rnd:
        plt.hist(cntmoves,range=(0,8),bins=8,align='left')
        plt.yscale('log')
        plt.xlabel('Number of times ballot reallocated')
        plt.ylabel('Count')
        plt.title('2017 Cambridge School Board Election')
        plt.savefig('/home/gswarrin/research/Active_proj/accumulation-chart/Active_robustness/moves-school.png')
        # print("Mean: ",np.mean(cntmoves))
    # summarize results
    tarr = [x[0] for x in win_order]
    return '_'.join(tarr)   

#############################################################################
def print_counts(counts,incr=None):
    keys = list(counts.keys())
    keys = sorted(keys, key=lambda x: counts[x], reverse=True)
    for k in keys:
        if incr != None:
            print(counts[k],incr[k],k)
        else:
            print(counts[k],k)

#############################################################################
# function to determine who to eliminate
def find_min_cand(counts):
    """ return list of candidates who need to be eliminated this round
    
    WARNING: doesn't deal properly with ties in support for min candidates....
    """
    ans = []
    if len(counts.keys()) == 0:
        return None

    curmin = min(list(counts.values()))
    for k in counts.keys():
        if counts[k] == curmin:
            return k

def generate_ac_data(csv_writer,ballots,round,ac_cnt):
    """ generate output for accumulation chart
    """
    # Cand is who is getting eliminated
    # Round is who is getting eliminated
    # Segment is when accumulated
    # csv_writer.writerow(['Ballot','Round','Segment','Number','Ranks'])

    d = dict()
    for b in ballots:
        k = b[0][0]
        pedigree = '_'.join(b[1][:b[1].index(k)+1])
        if pedigree in d.keys():
            d[pedigree] += 1
        else:
            d[pedigree] = 1
    
    for k in d.keys():
        csv_writer.writerow([ac_cnt,k.split('_')[-1],round,d[k],k.replace('_',',')])
        ac_cnt += 1
    return ac_cnt

###########################################
def read_candidates(yr,elec,pathdict):
    """ get candidate dictionary from provided file
    """
    curpath = 'Active_robustness/data/' + pathdict['_'.join([str(yr),elec,'Names'])]
    f = open(homepath + curpath,'r')
    d = dict()
    for line in f:
        l = line.rstrip().split()
        # if l[0] == ".ELECT":
        #    seats = int(l[1])
        if len(l) > 0 and l[0] == ".CANDIDATE":
            if ',' in l[2]:
                d[l[1][:-1]] = l[2][1:-1]
            else:
                d[l[1][:-1]] = l[2][1:] + '-' + l[3][:-1]
    return d

###########################################
def read_ballots(yr,elec,pathdict):
    """
    """
    curpath = 'Active_robustness/data/' + pathdict['_'.join([str(yr),elec,'Ballots'])]
    f = open(homepath + curpath, "r")
    ans = []
    for line in f:
        l = line.rstrip()
        if ' ' in l and l[:2] == '00':
            a,b = l.split(' ')
            cands = b.split(',')
            ans.append([a,cands])
            # print("blah: ",ans[-1])
    return ans

###########################################
def extract_cands(mystr,candd):
    """ extract candidate names from _-separated string, increment dict entries
    """
    for c in mystr.split("_"):
        if c in candd.keys():
            candd[c] += 1
        else:
            candd[c] = 1
    return candd

###########################################
def new_check_robustness(yr,elec,pathdict,N):
    """ Check robustness based on new data
    """
    arr = read_ballots(yr,elec,pathdict)
    name_dict = read_candidates(yr,elec,pathdict)
    
    print("Year: %s elec: %s Ballots: %d" % (yr,elec,len(arr)))

    # need to check this...
    if elec == 'Council':
        seats = 9
    else:
        seats = 6

    ballots = cambridge_get_perms(arr)
    new_ballots = []
    # print(name_dict)
    for b in ballots:
        # print(b)
        c = [[name_dict[x] for x in b[0]],b[1]]
        new_ballots.append(c)
    d = dict()
    candd = dict()
    for i in range(N):
        if i % 10 == 0:
            print(i)
        res = new_process_ballots('test',new_ballots,seats,rnd=True,makecsv=False,verbose=False)
        candd = extract_cands(res,candd)
        if res in d.keys():
            d[res] += 1
        else:
            d[res] = 1
    for k in d.keys():
        print("%3d %s" % (d[k],k))
    print()
    if min(candd.values()) < max(candd.values()):
        print("Verdict: Randomization matters!")
        for k in candd.keys():
            print(candd[k],k)
    else:
        print("Verdict: Stable")
    print("-----------------------------------------------------")
    print("-----------------------------------------------------")

##################################################################
# generate results in AC format
##################################################################
def new_generate_ac(yr,elec,pathdict,fncsv,verbose=False):
    """
    """
    arr = read_ballots(yr,elec,pathdict)
    name_dict = read_candidates(yr,elec,pathdict)
    # need to check this...
    if elec == 'Council':
        seats = 9
    else:
        seats = 6
    
    ballots = cambridge_get_perms(arr)

    new_ballots = []
    for b in ballots:
        c = [[name_dict[x] for x in b[0]],b[1]] # WARNING
        new_ballots.append(c)
    new_process_ballots(fncsv,new_ballots,seats,rnd=False,makecsv=True,verbose=verbose)

    df = pd.read_csv(fncsv+'.csv',sep='\t',dtype={'Number':np.int32})
    f = open(homepath + 'elec-' + fncsv + '.js','w')
    mystr = "var " + fncsv + "_data = " + df.to_json(orient='records')+';\n'
    f.write(mystr)
    # f.write("var","cam_council_2017_data = ",df.to_json(orient='records')+';\n')
    # f.close()

##################################################################
# robustness tests with new data
##################################################################
# new_check_robustness(2017,'Council',pathd,20)
# new_check_robustness(2015,'Council',pathd,20)
# new_check_robustness(2013,'Council',pathd,20) # it mattered (once!)
# new_check_robustness(2011,'Council',pathd,20)

for yr in [2005,2007,2009,2011,2013,2015,2017]:
    for asdf in ['Council','School']:
        new_check_robustness(yr,asdf,pathd,100)

##################################################################
# robustness tests with original 2017 data - should supercede
##################################################################
# check_robustness('Council2017FinalOrder.prm',9,100)
# check_robustness('School2017FinalOrder.prm',6,100,school_dict)

# generate_ac('Council2017FinalOrder.prm','cam_council_2017')
# generate_ac('Council2017FinalOrder.prm','cam_council_2017')

# new_generate_ac(2011,'School',pathd,'cam_school_2011_test')
# new_generate_ac(2017,'Council',pathd,'cam_council_2017')
# new_generate_ac(2017,'School',pathd,'cam_school_2017',verbose=False)
# new_generate_ac(2015,'Council',pathd,'cam_council_2015',verbose=False)
# new_generate_ac(2015,'School',pathd,'cam_school_2015',verbose=False)
# new_generate_ac(2013,'Council',pathd,'cam_council_2013',verbose=False)
# new_generate_ac(2013,'School',pathd,'cam_school_2013',verbose=False)
# new_generate_ac(2011,'Council',pathd,'cam_council_2011',verbose=False)
# new_generate_ac(2011,'School',pathd,'cam_school_2011',verbose=False)
# new_generate_ac(2009,'Council',pathd,'cam_council_2009',verbose=True)
# new_generate_ac(2009,'School',pathd,'cam_school_2009',verbose=True)
# new_generate_ac(2007,'Council',pathd,'cam_council_2007',verbose=False)
# new_generate_ac(2007,'School',pathd,'cam_school_2007',verbose=False)
# new_generate_ac(2005,'Council',pathd,'cam_council_2005',verbose=True)
# new_generate_ac(2005,'School',pathd,'cam_school_2005',verbose=True)
# new_generate_ac(2003,'Council',pathd,'cam_council_2003',verbose=False)

# bug when everybody elected in first round
# new_generate_ac(2003,'School',pathd,'cam_school_2003',verbose=False)

# arr = read_cambridge_data('School2017FinalOrder.prm')
# ballots = cambridge_get_perms(arr)
# new_ballots = []
# for b in ballots:
#     c = [school_dict[x] for x in b]
#     new_ballots.append(c)
# new_process_ballots('cambridge-school',new_ballots,6,rnd=False,makecsv=False)

# df = pd.read_csv('cambridge-school.csv',sep='\t',dtype={'Number':np.int32})
# print(df.to_json(orient='records'))
