# code for processing multi-winner election according to cambridge rules

import numpy as np
import csv
import pandas as pd

# name_dict = {'C01': "Benjamin; Ronald",\
#              'C02': "Burgin; Josh M.",\
#              'C03': "Carlone; Dennis J.",\
#              'C04': "D'Ambrosio; Olivia",\
#              'C05': "Devereux; Jan",\
#              'C06': "Gebru; Samuel",\
#              'C07': "Harding Jr.; Richard",\
#              'C08': "Kelley; Craig A.",\
#              'C09': "Lenke; Dan",\
#              'C10': "Levy; Ilan",\
#              'C11': "Mallon; Alanna M.",\
#              'C12': "McGovern; Marc C.",\
#              'C13': "Moree; Gregg J.",\
#              'C14': "Musgrave; Adriane B.",\
#              'C15': "Okamoto; Nadya T.",\
#              'C16': "Pillai; Hari I.",\
#              'C17': "Santos; Jeff",\
#              'C18': "Siddiqui; Sumbul",\
#              'C19': "Simmons; E. Denise",\
#              'C20': "Sivongxay; Vatsady",\
#              'C21': "Sutton; Bryan",\
#              'C22': "Tierney; Sean",\
#              'C23': "Toner; Paul F.",\
#              'C24': "Toomey Jr.; Timothy J.",\
#              'C25': "Volmar; Gwen Thomas",\
#              'C26': "Zondervan; Quinton Y.",\
#              'WI01': "Write-In"}

name_dict = {'C01': "Benjamin",\
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

homepath = '/home/gswarrin/research/accumulation-chart/'

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

        if len(b) > 0:
            ans.append(b)
        # print(b)

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
        if len(b) == 0:
            continue
        new_ballots.append([b,b])

        if b[0] in counts.keys():
            counts[b[0]] += 1
            if counts[b[0]] >= quota and b[0] not in elected:
                elected.append(b[0])
        else:
            counts[b[0]] = 1
    # print_counts(counts)

    return new_ballots, counts, elected

# allocate ballots the first time
def reallocate(ballots,counts,inelig,quota,cand,round,extra=False):
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
        n = np.round(counts[cand]*1.0/(counts[cand]-quota))
        num = counts[cand]-quota # transfer only surplus (dealing with extra votes from first round)
    else:
        n = 1
        num = counts[cand] # transfer all votes for the candidate

    is_done = False
    transferred = 0 # number of votes that have been transferred (len(moved))
    idx = 0 # index in ballots array --- need to reset periodically to avoid wrapping
    cnt = 0 # running tally of how many votes we've seen for this candidate on this run
    moved = [] # list of indices to ignore
    tot_wraps = 0
    new_elected = []
    new_ballots = []
    
    # for z in ballots:
    #    print("duh: ",len(z),len(z[0]),len(z[1]))

    orig_ballots = [[[x for x in z[0]], [y for y in z[1]]] for z in ballots]

    while not is_done:
        # rule for which votes to look at is awkward (should use mod!)
        if idx >= N:
            tot_wraps += 1
            cnt = 0
            idx = tot_wraps

        if tot_wraps >= n:
            is_done = True

        if idx >= N:
            is_done = True
            continue
        # look at this ballot
        b = ballots[idx]

        # ignore this one
        if len(b[0]) == 0 or idx in moved:
            idx += 1
            continue

        # found another vote for this candidate
        if b[0][0] == cand:
            cnt += 1
        else:
            idx += 1
            continue

        # try to reallocate this vote
        if cnt % n == 0:
            nbz = []
            for x in b[0]:
                # ignore ineligible candidates
                if x not in inelig:
                    nbz.append(x)
            # exhausted
            if len(nbz) == 0:
                idx += 1
                if extra == False:
                    moved.append(idx) # if exausted don't need any more
                continue

            moved.append(idx) # mark as ballot already moved
            transferred += 1  # we've transferred one additional

            # ready to assign
            nb = [[z for z in nbz],[w for w in b[1]]] 
            # update counts
            # by construction, nbz[0] can't be in inelig
            if nbz[0] in counts.keys():
                arg += 1
                counts[nbz[0]] += 1
                incr[nbz[0]] += 1
                counts[cand] -= 1
                print("Round: ",round,"Adding vote to",nbz[0],counts[nbz[0]])
                if counts[nbz[0]] >= quota:
                    print("Very New elec: ",new_elected,counts[nbz[0]],nbz[0])
                    new_elected.append(nbz[0])
                    inelig.append(nbz[0])
            else:
                arg += 1
                counts[nbz[0]] = 1
                incr[nbz[0]] = 1
                counts[cand] -= 1
            orig_ballots[idx] = nb
            new_ballots.append(nb)
            if len(nb) != 2:
                print("asdf: ",nb)

        idx += 1

        # tot_wraps >= n flags that we've looked at everything and no more possibilities to transfer
        # when eliminating candidate, likely will be some exhausted ballots, so transferred will
        # never reach num
        if transferred >= num or tot_wraps >= n:
            is_done = True

    # for x in new_ballots:
    #     print("nb: ",len(x[0]),len(x[1]),x)

    # tacking onto end
    # fin_ballots = [orig_ballots[i] for i in range(len(orig_ballots)) if i not in moved]

    # keeping within same order
    fin_ballots = [orig_ballots[i] for i in range(len(orig_ballots))]

    print("Arg: ",arg,len(moved))
    # return fin_ballots + new_ballots, new_ballots, counts, new_elected, inelig, incr
    return fin_ballots, new_ballots, counts, new_elected, inelig, incr

#######################################################################################################
def new_process_ballots(csvfn,ballots,seats,verbose=True):
    """
    """
    # minimum required to win
    quota = get_threshold(len(ballots),seats)
    if verbose:
        print("Seats: ",seats,"votes: ",len(ballots)," quota: ",quota)

    csvfile = open('/home/gswarrin/research/accumulation-chart/' + csvfn + '.csv', mode='w')
    csv_writer = csv.writer(csvfile, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    csv_writer.writerow(['Ballot','Round','Segment','Number','Ranks'])
    
    elected = [] # candidates who have enough votes at this point
    row_order = [] # keep track of order in which rows should be displayed, along with what happened....
    inelig = [] # candidates we don't want to add any more votes to

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

    ##################################################################
    # Reallocate the votes from the elected candidates
    # 
    if verbose:
        print("New_elected: ",new_elected)
    for cand in new_elected:
        if verbose:
            print("---------------------------------------------------")
            print("Electing",cand," in round 1 with",counts[cand]," votes",len(all_ballots))

        elected.append(cand) # mark as elected so we don't add more votes to them
        all_ballots, ac_ballots, counts, new_elected, inelig, incr = \
            reallocate(all_ballots, counts, inelig, quota, cand, round, extra = True)
        for x in new_elected:
            row_order.append([x,"Elected",min(quota,counts[x]),round])
            elected.append(x)
        if verbose:
            print("After reallocating votes for",cand," in round 1 with",counts[cand]," votes")
            print_counts(counts,incr=incr)
        del counts[cand]

    # Write initial allocations to votes to file
    ac_cnt = generate_ac_data(csv_writer,all_ballots,round,0)

    if verbose:
        print("Summary after initial reallocations")
        print_counts(counts)

    ##################################################################
    # Deal with candidate who received fewer than 50 votes
    # 
    # see who got fewer than 50 votes
    round = 2
    to_eliminate = [k for k in list(counts.keys()) if counts[k] < 50]
    to_eliminate = sorted(to_eliminate, key=lambda x: counts[x], reverse=False)

    # realloc_ballots are those that have changed
    # all_ballots list everything (including the ones that have changed)
    # collect into def_ballots so bundlings of ballots are correct size
    eliminated = []
    def_ballots = []
    for cand in to_eliminate:
        inelig.append(cand)  # don't add more votes to them
        eliminated.append(cand) # mark as eliminated
        if verbose:
            print("---------------------------------------------------")
            print("Eliminating",cand,"in round 1",len(all_ballots))
        row_order.append([cand,"Lost",min(quota,counts[cand]),round])
        all_ballots, ac_ballots, counts, new_elected, inelig, incr = \
            reallocate(all_ballots, counts, inelig, quota, cand, round, extra = False)
        def_ballots.extend(ac_ballots)
        for x in new_elected:
            row_order.append([x,"Elected",min(quota,counts[x]),round])
            elected.append(x)
        del counts[cand]

    # Candidates with < 50 all at once
    ac_cnt = generate_ac_data(csv_writer,def_ballots,round,ac_cnt)

    ##################################################################
    # Eliminate candidates in the usual fashion
    # 
    round = 3
    while len(elected) < seats and \
          len(counts.keys()) > 0 and \
          (seats-len(elected) < len(counts.keys())):
        if verbose:
            print("Len Electing: ",len(elected))

        cand = find_min_cand(counts)
        if verbose:
            if cand == None:
                print("No more candidates",elected,seats)
            print("=======================================================")
            print("Eliminating",cand," in round",round,len(all_ballots))

        inelig.append(cand)  # don't add more votes to them
        eliminated.append(cand) # mark as eliminated
        row_order.append([cand,"Lost",min(quota,counts[cand]),round])
        all_ballots, ac_ballots, counts, new_elected, inelig, incr = \
            reallocate(all_ballots, counts, inelig, quota, cand, round, extra = False)
        ac_cnt = generate_ac_data(csv_writer,ac_ballots,round,ac_cnt)
        for x in new_elected:
            row_order.append([x,"Elected",min(quota,counts[x]),round])
            if verbose:
                print("Electing",x," in round",round,len(all_ballots))
            elected.append(x)
            del counts[x]
        if cand in counts.keys():
            del counts[cand]

        round += 1

    # these didn't reach quota, but must elect
    for x in counts.keys():
        row_order.append([x,"Elected",min(quota,counts[x]),round])
        if verbose:
            print("Electing (last left)",x," in round",round,len(all_ballots))
        elected.append(x)
        
    if verbose:
        print("Row order: ",row_order)
    csvfile.close()
    # generate_ac_data(ballots,new_elected)

def print_counts(counts,incr=None):
    keys = list(counts.keys())
    keys = sorted(keys, key=lambda x: counts[x], reverse=True)
    for k in keys:
        if incr != None:
            print(counts[k],incr[k],k)
        else:
            print(counts[k],k)

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

arr = read_cambridge_data('Council2017FinalOrder.prm')
ballots = cambridge_get_perms(arr)
new_ballots = []
for b in ballots:
    c = [name_dict[x] for x in b]
    new_ballots.append(c)
new_process_ballots('cambridge-council',new_ballots,9)

# df = pd.read_csv('cambridge-council.csv',sep='\t',dtype={'Number':np.int32})
# print(df.to_json(orient='records'))
