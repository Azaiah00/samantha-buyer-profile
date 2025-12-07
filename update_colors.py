import os

files = [
    r"c:\Users\azaia\Downloads\Real Advancement\Clients\Samantha Martinez\marisol-buyer-demo-main\samantha-buyer-profile\src\App.css",
    r"c:\Users\azaia\Downloads\Real Advancement\Clients\Samantha Martinez\marisol-buyer-demo-main\samantha-buyer-profile\src\App.jsx"
]

replacements = {
    "#ec4899": "#D4AF37", # Pink -> Gold
    "rgba(236, 72, 153": "rgba(212, 175, 55", # Pink RGB -> Gold RGB
    "236, 72, 153": "212, 175, 55" # Raw RGB values
}

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path}")
        else:
            print(f"No changes in {file_path}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
