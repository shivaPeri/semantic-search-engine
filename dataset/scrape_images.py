import csv, requests
from tqdm import tqdm

with open("open-images-dataset-train0.tsv") as file:
    tsv_file = csv.reader(file, delimiter="\t")
    for i, line in tqdm(enumerate(tsv_file)):
        if i == 0: continue
        if i < 100:
            url = line[0]
            fname = str(i) + ".jpg"
            # fname = url.replace('/', '-')
            # fname = fname.replace('.', '-')
            # fname = fname.replace('\\', '-')

            response = requests.get(url)
            if response.ok:
                with open("testdata/" + fname, 'wb') as handler:
                    handler.write(response.content)

        else:
            break