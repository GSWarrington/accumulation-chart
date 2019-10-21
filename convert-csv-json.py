#!/usr/bin/python

import pandas as pd
import numpy as np
import sys

# df = pd.read_csv('MEPrim-csv-d3.csv',sep='\t',dtype={'Number':np.int32})
df = pd.read_csv(sys.argv[1],sep='\t',dtype={'Number':np.int32})
print("var",sys.argv[2],"=",df.to_json(orient='records')+";")
