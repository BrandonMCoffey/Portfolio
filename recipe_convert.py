import os

start = False
name = ""
f = None
with open('recipe_data.txt', 'r') as recipe_data:
    for line in recipe_data:
        if "title" in line:
            name = line.split(": ")[1].strip()
            file_name = name.replace(" ", "-").lower()
            file_path = "_recipes/" + file_name + ".md"
            if f:
                f.write("---")
                f.close()
            if os.path.isfile(file_path):
                os.remove(file_path)
            f = open(file_path, "x")
            f.write("---\n")
            f.write("layout: recipe-page\n")
            f.write("permalink: /recipes/" + file_name + "/\n")
            f.write("gallery: true")
            f.write("\n")
        if line.strip() == "---":
           start = not start
           continue
        f.write(line)
