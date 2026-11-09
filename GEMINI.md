# Workspace Guidelines & Engineering Standards

## 1. Document Control & Versioning Standard
Whenever creating or updating architectural documents, operational runbooks, technical specifications, or benchmark reports:
1. **Explicit Document Versioning**: Always assign an explicit Semantic Version (e.g., `v1.0.0`, `v1.1.0`, `v2.0.0`) in the header metadata.
2. **Document Control & Version History Table**: Always include a formal Markdown revision table near the top of the document following this exact structure:
   ```markdown
   ### Document Control & Version History

   | Version | Release Date | Author | Reviewer / Approver | Description of Changes & Milestone |
   |---|---|---|---|---|
   | `v1.0.0` | YYYY-MM-DD | <Author/Team> | <Approver> | Initial release description... |
   | `v1.1.0` | YYYY-MM-DD | <Author/Team> | <Approver> | Description of changes, additions, or fixes... |
   ```
3. **Continuous Revision Updates**: Whenever making modifications to an existing document or operational runbook, increment the version number according to SemVer (patch for minor text/doc edits, minor for new sections/features, major for breaking redesigns) and add a new row detailing the changes.

## 2. Helm Chart & Kubernetes Best Practices
- Always take date-stamped safety backups (`<chart-name>-backup-YYYYMMDD`) before refactoring or updating Helm charts.
- Maintain exhaustive parameter self-documentation and copy-pasteable sample blocks for complex Kubernetes configurations in all `values.yaml` files.
- Test both linting and template rendering across all profiles (`values.yaml` and `values-production-multinode.yaml`) before applying upgrades.
