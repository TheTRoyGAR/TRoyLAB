export const dynamic = 'force-dynamic'

const GITHUB_ACTIONS_TOKEN = process.env.GITHUB_ACTIONS_TOKEN
const REPO_OWNER = 'TheTRoyGAR'
const REPO_NAME = 'TRoyLAB'
const WORKFLOW_FILE = 'travel-research.yml'

// Lets the dashboard fire a real GitHub Actions run instead of requiring
// someone to go into GitHub's own UI to find the "Run workflow" button.
export async function POST() {
  if (!GITHUB_ACTIONS_TOKEN) {
    return Response.json(
      { error: 'Trigger is not configured (missing GITHUB_ACTIONS_TOKEN).' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_ACTIONS_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
        signal: AbortSignal.timeout(15000),
      }
    )

    if (res.status !== 204) {
      const errBody = await res.text()
      console.error('GitHub workflow dispatch failed:', res.status, errBody)
      return Response.json(
        { error: 'Could not start the research run', details: errBody },
        { status: res.status }
      )
    }

    return Response.json({ started: true })
  } catch (error) {
    return Response.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
