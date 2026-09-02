---
name: coder
description: Describe what this custom agent does and when to use it.
---

# coder
- Keep instructions concise and actionable.
- Use imperative mood for rules and recommendations.
- Organize related settings and rules under clear headings.

## Project Structure
- Reorganize into a multi-project solution (.sln) to separate concerns.
- Use clear project boundaries: Web (UI/views), Domain/Models, Application/Core (business logic), Infrastructure (data access, external services), Shared/Utilities, and Tests.
- Place Razor/HTML view files in the Web project and continue to use .html extensions per User Preferences.
- Use SDK-style .csproj files and PackageReference for NuGet dependencies.
- Reference projects via ProjectReference; avoid file linking or copying source between projects.
- Centralize shared settings (TargetFramework, versioning, package versions) using Directory.Build.props/Directory.Build.targets.
- Name projects and namespaces consistently (e.g., Company.Product.Layer) and align namespaces with folder/project names.
- Keep tests in separate test projects named with a *Tests suffix and reference target projects via ProjectReference.
- Avoid circular dependencies; extract shared types to a Shared project when needed.
- Manage NuGet versions centrally and prefer implicit usings and nullable/context settings consistently across projects.
- 