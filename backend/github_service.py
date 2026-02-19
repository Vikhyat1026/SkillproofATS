import requests
from datetime import datetime, timezone

GITHUB_API = "https://api.github.com"


def get_user_repos(username: str):
    """
    Fetch all public repos of a user
    """
    url = f"{GITHUB_API}/users/{username}/repos"
    response = requests.get(url)

    if response.status_code != 200:
        return []

    return response.json()


def get_commit_count(username: str, repo_name: str):
    """
    Fetch commit count for a repo (simple length based)
    NOTE: GitHub returns paginated commits, this is lightweight count
    """
    url = f"{GITHUB_API}/repos/{username}/{repo_name}/commits"
    response = requests.get(url)

    if response.status_code != 200:
        return 0

    data = response.json()
    if isinstance(data, list):
        return len(data)

    return 0


def analyze_github_profile(username: str):
    """
    Main GitHub Intelligence Engine
    Returns a normalized score between 0 and 1
    """

    repos = get_user_repos(username)

    if not repos:
        return 0.0

    # rate limit safe -> analyze only top 5 repos
    repos = repos[:5]

    total_stars = 0
    total_commits = 0
    total_size = 0
    languages = set()

    recent_active_repos = 0
    repos_with_commits = 0

    now = datetime.now(timezone.utc)

    # -------------------------------
    # analyze each repo
    # -------------------------------
    for repo in repos:
        repo_name = repo.get("name")

        total_stars += repo.get("stargazers_count", 0)
        total_size += repo.get("size", 0)

        if repo.get("language"):
            languages.add(repo.get("language"))

        # -------------------------------
        # recent activity check
        # -------------------------------
        pushed_at = repo.get("pushed_at")
        if pushed_at:
            last_push = datetime.fromisoformat(
                pushed_at.replace("Z", "+00:00")
            )
            days_diff = (now - last_push).days

            if days_diff <= 90:
                recent_active_repos += 1

        # -------------------------------
        # commit analysis
        # -------------------------------
        if repo_name:
            commits = get_commit_count(username, repo_name)
            total_commits += commits

            if commits > 0:
                repos_with_commits += 1

    # -------------------------------
    # Normalization
    # -------------------------------

    stars_factor = min(total_stars / 50, 1)
    commits_factor = min(total_commits / 100, 1)
    size_factor = min(total_size / 5000, 1)
    diversity_factor = min(len(languages) / 5, 1)

    # NEW signals
    freshness_factor = min(recent_active_repos / 5, 1)
    consistency_factor = (
        repos_with_commits / len(repos) if repos else 0
    )

    # -------------------------------
    # Final GitHub Strength Score
    # -------------------------------
    github_strength = (
        0.30 * commits_factor +
        0.20 * stars_factor +
        0.15 * diversity_factor +
        0.10 * size_factor +
        0.15 * freshness_factor +
        0.10 * consistency_factor
    )

    return round(github_strength, 2) 