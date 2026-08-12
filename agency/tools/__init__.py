from pathlib import Path
from crewai_tools import SerperDevTool, ScrapeWebsiteTool, FileWriterTool, FileReadTool, DirectoryReadTool

search = SerperDevTool()
scrape = ScrapeWebsiteTool()
write = FileWriterTool()

# Read-only tools for the CTO department's codebase auditor. base_dir
# sandboxes reads to this project (the whole TRoyLAB repo, so it can see
# both the site in troygo/ and this agency/ backend) — the agent can't
# wander outside it.
_PROJECT_ROOT = str(Path(__file__).resolve().parents[2])
read_file = FileReadTool(base_dir=_PROJECT_ROOT)
list_dir = DirectoryReadTool(directory=_PROJECT_ROOT)
