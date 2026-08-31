from pathlib import Path
from crewai_tools import SerperDevTool, ScrapeWebsiteTool, FileWriterTool, FileReadTool
from agency.tools.safe_directory_tool import SafeDirectoryReadTool

search = SerperDevTool()
scrape = ScrapeWebsiteTool()
write = FileWriterTool()

# Read-only tools for the CTO department's codebase auditor. base_dir
# sandboxes reads to this project (the whole TRoyLAB repo, so it can see
# both the site in troygo/ and this agency/ backend) — the agent can't
# wander outside it.
_PROJECT_ROOT = str(Path(__file__).resolve().parents[2])
read_file = FileReadTool(base_dir=_PROJECT_ROOT)
# Not crewai_tools' DirectoryReadTool: that one does a raw, unfiltered
# os.walk() with no exclusions, so pointed at troygo/'s node_modules/.next a
# single call returned 2.9M tokens and crashed the audit outright (2026-08-31).
list_dir = SafeDirectoryReadTool(root=_PROJECT_ROOT)
