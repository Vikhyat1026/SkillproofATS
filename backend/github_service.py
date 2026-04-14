import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

GITHUB_API = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "SkillProofATS"
}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"


def get_user_repos(username: str):
    """
    Fetch all public repos of a user
    """
    url = f"{GITHUB_API}/users/{username}/repos"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"GitHub repo fetch failed: {e}")
        return []


def get_commit_count(username: str, repo_name: str):
    """
    Fetch commit count for a repo
    NOTE: GitHub returns paginated commits, this is lightweight count
    """
    url = f"{GITHUB_API}/repos/{username}/{repo_name}/commits"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        data = response.json()

        if isinstance(data, list):
            return len(data)

        return 0

    except requests.exceptions.RequestException as e:
        print(f"Commit fetch failed for {repo_name}: {e}")
        return 0


def analyze_github_profile(username: str):
    """
    Main GitHub Intelligence Engine
    Returns a normalized score between 0 and 1
    """

    repos = get_user_repos(username)

    if not repos:
        return 0.0, {}

    # analyze only top 5 repos (rate limit safety)
    repos = repos[:5]

    total_stars = 0
    total_commits = 0
    total_size = 0
    language_counts = {}

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

        repo_lang = repo.get("language")
        if repo_lang:
            language_counts[repo_lang] = language_counts.get(repo_lang, 0) + 1

        # -------------------------------
        # recent activity check
        # -------------------------------
        pushed_at = repo.get("pushed_at")

        if pushed_at:
            try:
                last_push = datetime.fromisoformat(
                    pushed_at.replace("Z", "+00:00")
                )

                days_diff = (now - last_push).days

                if days_diff <= 90:
                    recent_active_repos += 1

            except Exception:
                pass

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
    diversity_factor = min(len(language_counts) / 5, 1)

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

    profile_data = {
        "total_commits": total_commits,
        "total_stars": total_stars,
        "language_breakdown": language_counts,
        "active_repos": recent_active_repos,
        "total_repos_scanned": len(repos)
    }

    return round(github_strength, 2), profile_data