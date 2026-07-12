import os
import re

search_terms = ['notificationsTrigger', 'notificationsDropdown', 'notificationBadge', 'checkUserNotifications']
base_dir = r'c:\Users\fraider\OneDrive\Documentos\avistar-nex\avistar-ne\frontend\public'

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(('.js', '.html')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                for term in search_terms:
                    matches = [m.start() for m in re.finditer(term, content)]
                    if matches:
                        print(f"File: {file} | Found term: '{term}' {len(matches)} times")
                        lines = content.split('\n')
                        for line_no, line in enumerate(lines):
                            if term in line:
                                try:
                                    print(f"  Line {line_no + 1}: {line.strip()}")
                                except:
                                    pass
