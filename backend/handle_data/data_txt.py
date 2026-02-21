def handle_txt(filename):
    # read file
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            data = file.read()
            return data

    except Exception as e:
        print(e)
        return ""
