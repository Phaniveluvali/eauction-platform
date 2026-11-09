import os

base_dir = "/home/nodejs/eauction-workspace/frontend"

fixes = {
    "src/components/AdminPortal.tsx": [
        ('<option value="Al Wataneya Consignment">AJ Consignment (Ajman Hub)</option>',
         '<option value="AJ Consignment">AJ Consignment (Ajman Hub)</option>'),
    ],
    "public/reports/technical-report-sample.html": [
        ('<h1>Al Wataneya Vehicle Technical Inspection Certificate</h1>',
         '<h1>AJ Auctions Vehicle Technical Inspection Certificate</h1>'),
        ('<p>Official RTO & Emirates Transport Technical Testing Center | UAE</p>',
         '<p>Official AJ Certified Technical Testing Center | UAE • Powered by AJTechnologies</p>'),
        ('<p style="font-size: 11px; color: #64748b;">Chief Technical Examiner, Emirates Transport</p>',
         '<p style="font-size: 11px; color: #64748b;">Chief Technical Examiner, AJ Certified Fleet Services</p>'),
    ],
    "public/architecture-document.html": [
        ('<title>Al Wataneya Vehicle E-Auction Platform - Architecture & Bidding Flow Specification</title>',
         '<title>AJ Auctions Platform - Architecture & Bidding Flow Specification • Powered by AJTechnologies</title>'),
        ('<span class="brand-badge">Al Wataneya Vehicle E-Auction Platform</span>',
         '<span class="brand-badge">AJ Auctions Platform • Powered by AJTechnologies</span>'),
        ('href="Al_Wataneya_E-Auction_Architecture_and_Bidding_Flow.docx"',
         'href="AJ_Auctions_Architecture_and_Bidding_Flow.docx"'),
        ('<strong>Al Wataneya Vehicle E-Auction Platform</strong>',
         '<strong>AJ Auctions Platform (Powered by AJTechnologies)</strong>'),
    ]
}

for rel, reps in fixes.items():
    fp = os.path.join(base_dir, rel)
    if os.path.exists(fp):
        with open(fp, "r", encoding="utf-8") as f:
            c = f.read()
        for t, r in reps:
            c = c.replace(t, r)
        with open(fp, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"Cleaned {rel}")

print("Cleaned residual files successfully.")
