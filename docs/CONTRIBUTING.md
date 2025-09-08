# Contributing

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
