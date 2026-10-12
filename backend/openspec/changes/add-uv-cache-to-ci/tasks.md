## 1. Update build.yml

- [x] 1.1 Update `actions/checkout` from v4 to v6
- [x] 1.2 Update `actions/setup-python` from v5 to v6
- [x] 1.3 Update `astral-sh/setup-uv` from v5 to v7 with `enable-cache: true`
- [x] 1.4 Update `actions/upload-artifact` from v4 to v5
- [x] 1.5 Update `actions/download-artifact` from v4 to v6
- [x] 1.6 Update `SonarSource/sonarcloud-github-action` from v2 to v5
- [x] 1.7 Add `uv cache prune --ci` step after tests

## 2. Update release.yml

- [x] 2.1 Update `actions/checkout` from v4 to v6
- [x] 2.2 Update `actions/setup-node` from v4 to v6

## 3. Verification

- [x] 3.1 Verify build workflow runs successfully
- [x] 3.2 Verify release workflow runs successfully
