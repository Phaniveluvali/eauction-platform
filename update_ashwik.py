import os

base_dir = "/home/nodejs/eauction-workspace/frontend"

files_to_update = [
    "index.html",
    "public/reports/technical-report-sample.html",
    "public/architecture-document.html",
    "src/components/AdminPortal.tsx",
    "src/components/AuthModal.tsx",
    "src/components/HelpPage.tsx",
    "src/components/HomePage.tsx",
    "src/components/PortalSidebar.tsx",
    "src/components/SignInPage.tsx",
    "src/components/SecurityDepositModal.tsx",
    "src/components/VehicleDetailsPage.tsx",
    "src/components/AICustomerConcierge.tsx",
    "src/components/Navbar.tsx",
]

total_replacements = 0

for rel in files_to_update:
    fp = os.path.join(base_dir, rel)
    if not os.path.exists(fp):
        print(f"[MISSING] {fp}")
        continue
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()

    # Exact string replacements
    reps = 0
    if "AJTechnologies" in content:
        c = content.count("AJTechnologies")
        content = content.replace("AJTechnologies", "AshwikTechnologies")
        reps += c
    if "ajtechnologies" in content:
        c = content.count("ajtechnologies")
        content = content.replace("ajtechnologies", "ashwiktechnologies")
        reps += c
    if rel == "src/components/Navbar.tsx":
        if "className=\"h-12 sm:h-13 w-auto object-contain\"" in content:
            content = content.replace(
                "className=\"h-12 sm:h-13 w-auto object-contain\"",
                "className=\"h-14 sm:h-16 w-auto object-contain\""
            )
            reps += 1

    with open(fp, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"[UPDATED] {rel}: {reps} replacements")
    total_replacements += reps

print(f"Total replacements across all files: {total_replacements}")
