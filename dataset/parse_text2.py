# import required module
import os
# assign directory
directory = 'bbc-summary-data-2'
 
# iterate over files in
# that directory
for i, filename in enumerate(os.listdir(directory)):    
    if i > 1: break
    fname = filename.replace('.summary', '.txt')
    # os.rename(filename, fname)

    f = os.path.join(directory, filename)
    f2 = os.path.join(directory, fname)
    os.rename(f, f2)