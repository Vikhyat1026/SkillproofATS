import requests

# Simple GitHub repo counter
def get_repo_count(username: str) -> float:
    try:
        url = f"https://api.github.com/users/{username}"
        response = requests.get(url)

        if response.status_code != 200:
            return 0.0

        data = response.json()

        # total public repos
        repo_count = data.get("public_repos", 0)

        # Convert into score (0 to 1 scale)

        score = min(repo_count / 20, 1.0)

        return float(score)

    except Exception:
        return 0.0
