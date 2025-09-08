# Contributing to LinkedIn Auto

Welcome, team! This document outlines the development workflow and best practices to follow when contributing to this project. Following these guidelines helps us maintain a high-quality, clean, and easily maintainable codebase.

---

## The Core Workflow

Our workflow is centered around **feature branching** and **Pull Requests**. The `main` branch is always kept in a stable, deployable state. **Never commit directly to `main`.**

Here is the step-by-step process:

### 1. Pick a Task
Before you start coding, make sure you have an associated ticket or issue in our tracker (e.g., Jira, GitHub Issues). Assign the ticket to yourself so everyone knows you're working on it.

### 2. Create a Branch
Create a new branch from the latest `main` branch. Use the following naming convention to keep our branches organized:

`<type>/<ticket-id>-<short-description>`

* **`<type>`**: Can be `feature`, `bugfix`, or `chore`.
* **`<ticket-id>`**: The ID from our issue tracker (e.g., `PROJ-123`).
* **`<short-description>`**: A few words describing the task.

**Example:**
```bash
# Make sure your main branch is up-to-date
git checkout main
git pull origin main

# Create your new feature branch
git checkout -b feature/PROJ-123-add-linkedin-auth
```

### 3. Code & Commit
As you work, make small, logical commits. This makes your changes easier to review.

* **Write Tests**: Ensure your changes are covered by tests.
* **Commit Often**: Don't wait until the end to make one giant commit.
* **Follow the Style**: Make sure to follow our commit message style guide below.
* **Sign Your Commits**: All commits **must be GPG signed** to verify their integrity. This ensures that the commit genuinely comes from you. Please follow [GitHub's guide on signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits). You can configure Git to sign all commits automatically with `git config --global commit.gpgsign true`.

### 4. Submit a Pull Request (PR)
Once your feature is complete and tested:

1.  **Update Your Branch**: It's a good practice to pull the latest changes from `main` into your branch to resolve any potential conflicts before you open a PR.
    ```bash
    git pull origin main
    ```
2.  **Push Your Branch**: Push your feature branch to the remote repository.
    ```bash
    git push -u origin feature/PROJ-123-add-linkedin-auth
    ```
3.  **Open the PR**: Go to GitHub and open a new Pull Request.
    * The target branch should always be `main`.
    * Write a clear and descriptive title.
    * Fill out the PR template, explaining **what** the PR does, **why** it's needed, and **how** it was tested. Link to the original ticket.

### 5. Code Review ✅
Assign at least one other team member to review your PR.

* **For the Author**: Be open to feedback. Respond to comments and push any required changes to the same branch. The PR will update automatically.
* **For the Reviewer**: Provide constructive feedback. Check for correctness, logic, tests, and adherence to our style guides. Approve the PR once you are satisfied.

### 6. Merge & Clean Up 🚀
Once the PR has been approved, it can be merged.

* **Use "Squash and Merge"**: This is our preferred method. It condenses all of your feature branch's commits into a single, clean commit on the `main` branch. This keeps our `main` history easy to read.
* **Delete the Branch**: After merging, delete your feature branch to keep the repository tidy.

---

## Style Guides

### Code Style
We use [**Biome**](https://www.conventionalcommits.org/en/v1.0.0/#specification) to enforce a consistent code style across the entire project. Please configure your code editor to format on save. A pre-commit hook is also in place to automatically check and format your code before you commit.

### Commit Message Style
We follow the [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/#specification) specification. This creates a more readable commit history and helps automate release notes. Each commit message should have the following structure:

`<type>(<scope>): <subject>`

**Common Types:**

* `feat`: A new feature.
* `fix`: A bug fix.
* `docs`: Documentation only changes.
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc).
* `refactor`: A code change that neither fixes a bug nor adds a feature.
* `test`: Adding missing tests or correcting existing tests.
* `chore`: Changes to the build process or auxiliary tools and libraries.

**Example Commit Messages:**
```
feat(auth): implement linkedin oauth2 strategy
fix(scraper): correctly parse connection count from profile
docs(readme): update setup instructions
chore(deps): upgrade express to version 4.18.2
```
