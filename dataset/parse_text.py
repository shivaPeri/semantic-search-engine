
with open("texts.txt") as file:
    i = 0
    for line in file.readlines():
        line = line.strip()
        if line.startswith('''"target": "'''):
            line = line[len('''"target": "'''):-2]

            # write a text file for each line
            with open("testdata/" + str(i) + ".txt", 'w') as handler:
                handler.write(line)
            
            i += 1
