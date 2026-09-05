import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();

  if (!username) {
    return NextResponse.json(
      { error: 'invalid_request' },
      { status: 400 }
    );
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Shared-Work-Life-Hub',
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=50`,
      { headers, next: { revalidate: 60 } }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: 'github_user_not_found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'github_failed' },
        { status: res.status }
      );
    }

    const repos = await res.json();

    const formattedRepos = repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description || '',
      html_url: r.html_url,
      language: r.language || 'Code',
      stars: r.stargazers_count || 0,
      updated_at: r.updated_at,
      fork: r.fork,
    }));

    return NextResponse.json({ repos: formattedRepos });
  } catch (err: unknown) {
    console.error('[api:github_failed]', err);
    return NextResponse.json(
      { error: 'github_failed' },
      { status: 500 }
    );
  }
}
