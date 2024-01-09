import openpyxl

def write_to_excel(file_path, data):
    workbook = openpyxl.Workbook()
    sheet = workbook.active

    for row in data:
        sheet.append(row)

    workbook.save(file_path)

if __name__ == "__main__":
    data_to_write = [
        ["Name", "Age", "Occupation"],
        ["John Doe", 30, "Engineer"],
        ["Jane Doe", 25, "Designer"]
    ]

    write_to_excel("output.xlsx", data_to_write)
