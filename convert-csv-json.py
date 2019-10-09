#!/usr/bin/python

import pandas as pd
import numpy as np

# df = pd.read_csv('MEPrim-csv-d3.csv',sep='\t',dtype={'Number':np.int32})
df = pd.read_csv('Poll-c3-for-plotting.csv',sep='\t',dtype={'Number':np.int32})
print(df.to_json(orient='records'))
